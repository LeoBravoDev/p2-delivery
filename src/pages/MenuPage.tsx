import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { ChefHat, CircleAlert, CircleCheck, Clock3, LogOut, Plus, Search, Utensils, X } from 'lucide-react'
import { addRecipe, ApiError, deleteRecipe, getMe, getRecipes, searchRecipes, updateRecipe } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { getFriendlyError } from '../utils/errors'
import type { Recipe, RecipeFormData } from '../types'
import RecipeCard, { EmptyState } from '../components/RecipeCard'
import RecipeModal from '../components/RecipeModal'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1547592180-85f173990554?w=900'

export default function MenuPage() {
  const { token, user, signOut } = useAuth()
  const [apiRecipes, setApiRecipes] = useState<Recipe[]>([])
  const [localRecipes, setLocalRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Recipe | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Recipe | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const loadRecipes = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setApiRecipes(await getRecipes())
    } catch (err) {
      setError(getFriendlyError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void loadRecipes() }, [loadRecipes])

  // Confere o usuário logado (GET /auth/me com Bearer); se o token não vale mais, volta ao login
  useEffect(() => {
    getMe(token).catch(err => {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) signOut()
    })
  }, [token, signOut])

  const allRecipes = useMemo(() => [...localRecipes, ...apiRecipes], [localRecipes, apiRecipes])

  const filteredRecipes = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('pt-BR')
    if (!normalized) return allRecipes
    return allRecipes.filter(recipe => recipe.name.toLocaleLowerCase('pt-BR').includes(normalized))
  }, [allRecipes, query])

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const term = query.trim()
    if (!term) {
      await loadRecipes()
      return
    }
    setLoading(true)
    setError('')
    try {
      setApiRecipes(await searchRecipes(term))
    } catch (err) {
      setError(getFriendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  async function clearSearch() {
    setQuery('')
    await loadRecipes()
  }

  function openCreate() { setEditing(null); setModalOpen(true) }
  function openEdit(recipe: Recipe) { setEditing(recipe); setModalOpen(true) }

  function applyUpdate(target: Recipe, data: RecipeFormData) {
    const change = (list: Recipe[]) => list.map(r => r.uid === target.uid ? { ...r, ...data } : r)
    if (target.isLocal) setLocalRecipes(change)
    else setApiRecipes(change)
  }

  function applyRemove(target: Recipe) {
    const remove = (list: Recipe[]) => list.filter(r => r.uid !== target.uid)
    if (target.isLocal) setLocalRecipes(remove)
    else setApiRecipes(remove)
  }

  async function saveRecipe(data: RecipeFormData) {
    setSaving(true)
    setError('')
    setNotice('')
    try {
      if (editing) {
        const target = editing
        try {
          await updateRecipe(target.id, data)
          applyUpdate(target, data)
          setNotice('Prato atualizado com sucesso (simulação da API).')
        } catch (err) {
          if (err instanceof ApiError && err.status === 404) {
            applyUpdate(target, data)
            setError(`${getFriendlyError(err)} A edição foi aplicada só na lista local desta sessão.`)
          } else throw err
        }
      } else {
        await addRecipe(data)
        const localRecipe: Recipe = {
          ...data,
          id: 51,
          uid: `local-${Date.now()}`,
          isLocal: true,
          image: data.image || FALLBACK_IMAGE,
        }
        setLocalRecipes(current => [localRecipe, ...current])
        setQuery('')
        setNotice('Prato adicionado! A API devolve o ID 51 e a inclusão existe apenas nesta sessão.')
      }
      setModalOpen(false)
      setEditing(null)
    } catch (err) {
      setError(getFriendlyError(err))
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    const target = deleteTarget
    setDeleteLoading(true)
    setError('')
    setNotice('')
    try {
      try {
        await deleteRecipe(target.id)
        applyRemove(target)
        setNotice('Prato removido com sucesso (simulação da API).')
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          applyRemove(target)
          setError(`${getFriendlyError(err)} O prato foi removido só da lista local desta sessão.`)
        } else throw err
      }
      setDeleteTarget(null)
    } catch (err) {
      setError(getFriendlyError(err))
      setDeleteTarget(null)
    } finally {
      setDeleteLoading(false)
    }
  }

  const firstName = user?.firstName || user?.username || 'Restaurante'
  const totalMinutes = allRecipes.reduce((sum, recipe) => sum + (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0), 0)

  return (
    <main className="dashboard">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><ChefHat size={22} /></span><span>Sabor<span className="brand-accent"> da Casa</span></span></div>
        <div className="sidebar-label">RESTAURANTE</div>
        <div className="sidebar-current"><span className="restaurant-avatar"><Utensils size={18} /></span><span><strong>Minha cozinha</strong><small>Painel do parceiro</small></span><span className="status-dot" /></div>
        <div className="sidebar-label sidebar-label-spaced">GERENCIAMENTO</div>
        <div className="nav-item active"><Utensils size={18} /><span>Cardápio</span><span className="nav-count">{allRecipes.length}</span></div>
        <div className="sidebar-bottom">
          <div className="help-card"><span className="help-icon">✳</span><strong>Feito com cuidado.</strong><p>Um bom cardápio começa com ingredientes e detalhes bem cuidados.</p></div>
          <div className="user-profile"><span className="user-avatar">{firstName.charAt(0).toUpperCase()}</span><span className="user-details"><strong>{firstName}</strong><small>Administrador</small></span><button className="icon-button logout-button" onClick={signOut} aria-label="Sair" title="Sair"><LogOut size={18} /></button></div>
        </div>
      </aside>

      <section className="main-content">
        <header className="topbar"><div className="breadcrumb">Painel <span>/</span> <strong>Cardápio</strong></div><div className="topbar-right"><span className="open-status"><span className="status-dot" /> Painel conectado</span><button className="button button-outline button-logout-mobile" onClick={signOut}><LogOut size={16} /> Sair</button></div></header>
        <div className="page-content">
          <section className="welcome-row">
            <div><p className="eyebrow">SUA OPERAÇÃO, EM UM SÓ LUGAR</p><h1>Cardápio <span>do restaurante</span></h1><p className="page-subtitle">Cuide dos seus pratos e deixe cada detalhe pronto para servir.</p></div>
            <button className="button button-primary add-button" onClick={openCreate}><Plus size={18} /> Novo prato</button>
          </section>

          <section className="stats-grid" aria-label="Resumo do cardápio">
            <article className="stat-card"><span className="stat-icon green"><Utensils size={19} /></span><div><span className="stat-label">Pratos no cardápio</span><strong>{allRecipes.length}</strong><small>Itens disponíveis na lista</small></div></article>
            <article className="stat-card"><span className="stat-icon orange"><Clock3 size={19} /></span><div><span className="stat-label">Tempo somado</span><strong>{totalMinutes} <small>min</small></strong><small>Preparo + cozimento</small></div></article>
            <article className="stat-card"><span className="stat-icon violet"><ChefHat size={19} /></span><div><span className="stat-label">Cozinhas diferentes</span><strong>{new Set(allRecipes.map(r => r.cuisine).filter(Boolean)).size}</strong><small>Estilos representados</small></div></article>
          </section>

          {notice && <div className="alert alert-success" role="status"><CircleCheck size={18} /><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Fechar aviso"><X size={16} /></button></div>}
          {error && <div className="alert alert-error" role="alert"><CircleAlert size={18} /><span>{error}</span><button onClick={() => setError('')} aria-label="Fechar erro"><X size={16} /></button></div>}

          <section className="menu-section">
            <div className="section-heading"><div><h2>Seus pratos</h2><p>Gerencie os itens que fazem parte do seu menu.</p></div><span className="result-count">{filteredRecipes.length} {filteredRecipes.length === 1 ? 'prato' : 'pratos'}</span></div>
            <form className="search-row" onSubmit={handleSearch}>
              <div className="search-input-wrap"><Search size={19} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar prato pelo nome..." aria-label="Buscar prato pelo nome" /><button type="button" className="search-clear" onClick={() => { void clearSearch() }} aria-label="Limpar busca" hidden={!query}><X size={16} /></button></div>
              <button className="button button-outline search-button" type="submit">Buscar</button>
            </form>
            {loading ? <div className="loading-state"><span className="spinner spinner-dark" /><span>Carregando cardápio...</span></div> :
              filteredRecipes.length ? <div className="recipe-grid">{filteredRecipes.map(recipe => <RecipeCard key={recipe.uid} recipe={recipe} onEdit={openEdit} onDelete={setDeleteTarget} />)}</div> :
              <EmptyState searching={Boolean(query.trim())} onClear={() => { void clearSearch() }} />}
            <div className="list-footer"><span>✳</span> Os preços são calculados automaticamente conforme o tempo de preparo.</div>
          </section>
          <footer className="app-footer"><span>© 2026 Sabor da Casa</span><span>PAINEL DO RESTAURANTE <span className="footer-dot">•</span> PROJETO ACADÊMICO</span></footer>
        </div>
      </section>

      {modalOpen && <RecipeModal recipe={editing} saving={saving} onClose={() => { if (!saving) { setModalOpen(false); setEditing(null) } }} onSave={data => { void saveRecipe(data) }} />}
      {deleteTarget && <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget && !deleteLoading) setDeleteTarget(null) }}><section className="modal confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-title"><div className="confirm-icon"><CircleAlert size={25} /></div><h2 id="delete-title">Excluir este prato?</h2><p>Você está prestes a remover <strong>{deleteTarget.name}</strong> do cardápio. Essa ação não pode ser desfeita nesta sessão.</p><div className="modal-actions"><button className="button button-outline" onClick={() => setDeleteTarget(null)} disabled={deleteLoading}>Cancelar</button><button className="button button-danger" onClick={confirmDelete} disabled={deleteLoading}>{deleteLoading ? 'Excluindo...' : 'Sim, excluir'}</button></div></section></div>}
    </main>
  )
}
