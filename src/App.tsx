import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { ChefHat, CircleAlert, CircleCheck, Clock3, LogOut, Plus, Search, ShieldCheck, Utensils, X } from 'lucide-react'
import { addRecipe, ApiError, deleteRecipe, getRecipes, login, searchRecipes, updateRecipe } from './api'
import type { Recipe, RecipeFormData } from './types'
import RecipeCard, { EmptyState } from './components/RecipeCard'
import RecipeModal from './components/RecipeModal'

type User = { username: string; firstName?: string; lastName?: string }

function getFriendlyError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Usuário ou senha incorretos. Confira os dados e tente novamente.'
    if (error.status === 404) return 'A API retornou 404: este prato não existe no servidor. Como a API é simulada, confira a mensagem e a lista local.'
    return `${error.message} (status ${error.status || 'sem resposta HTTP'}).`
  }
  return 'Ocorreu um erro inesperado. Tente novamente.'
}

function LoginScreen({ onLogin }: { onLogin: (username: string, password: string) => Promise<void> }) {
  const [username, setUsername] = useState('emilys')
  const [password, setPassword] = useState('emilyspass')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try { await onLogin(username.trim(), password) }
    catch (err) { setError(getFriendlyError(err)) }
    finally { setLoading(false) }
  }

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="brand brand-light"><span className="brand-mark"><ChefHat size={22} /></span><span>Sabor<span className="brand-accent"> da Casa</span></span></div>
        <div className="login-hero-copy">
          <span className="hero-kicker"><span className="live-dot" /> PAINEL DO RESTAURANTE</span>
          <h1>Seu cardápio.<br /><em>Do seu jeito.</em></h1>
          <p>Organize seus pratos, atualize os detalhes e mantenha cada sabor pronto para conquistar novos pedidos.</p>
          <div className="hero-stats">
            <div><strong>01</strong><span>Um só painel</span></div>
            <div><strong>∞</strong><span>Novas possibilidades</span></div>
          </div>
        </div>
        <div className="login-visual-footer">FEITO PARA QUEM AMA SERVIR BEM <span>✳</span></div>
      </section>
      <section className="login-panel">
        <div className="login-panel-inner">
          <div className="mobile-brand brand"><span className="brand-mark"><ChefHat size={22} /></span><span>Sabor<span className="brand-accent"> da Casa</span></span></div>
          <div className="login-heading">
            <span className="eyebrow">BEM-VINDO DE VOLTA</span>
            <h2>Entre na sua cozinha.</h2>
            <p>Acesse sua conta para gerenciar o cardápio.</p>
          </div>
          <form className="login-form" onSubmit={submit}>
            <label>Usuário
              <input value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" placeholder="Seu usuário" required />
            </label>
            <label>Senha
              <input value={password} onChange={e => setPassword(e.target.value)} type="password" autoComplete="current-password" placeholder="Sua senha" required />
            </label>
            {error && <div className="alert alert-error" role="alert"><CircleAlert size={18} /><span>{error}</span></div>}
            <button className="button button-primary login-submit" type="submit" disabled={loading}>{loading ? <><span className="spinner" /> Entrando...</> : <>Entrar no painel <span aria-hidden="true">→</span></>}</button>
          </form>
          <div className="login-tip"><ShieldCheck size={18} /><div><strong>Acesso de demonstração</strong><span>Usuário e senha de teste do DummyJSON já preenchidos.</span></div></div>
          <p className="login-footnote">Ao entrar, você concorda em usar este painel para fins de demonstração acadêmica.</p>
        </div>
      </section>
    </main>
  )
}

function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem('delivery-token') || '')
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(sessionStorage.getItem('delivery-user') || 'null') as User | null } catch { return null }
  })
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Recipe | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Recipe | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const loadRecipes = useCallback(async (activeToken: string) => {
    setLoading(true)
    setError('')
    try {
      const result = await getRecipes(activeToken)
      setRecipes(current => {
        const local = current.filter(item => item.isLocal)
        return [...local, ...result.filter(item => !local.some(added => added.id === item.id))]
      })
    } catch (err) {
      setError(getFriendlyError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (token) void loadRecipes(token)
  }, [token, loadRecipes])

  async function handleLogin(username: string, password: string) {
    const result = await login(username, password)
    sessionStorage.setItem('delivery-token', result.token)
    const nextUser = { username: result.user.username, firstName: result.user.firstName, lastName: result.user.lastName }
    sessionStorage.setItem('delivery-user', JSON.stringify(nextUser))
    setUser(nextUser)
    setToken(result.token)
    setNotice('Login realizado com sucesso. Bem-vindo ao painel!')
  }

  function logout() {
    sessionStorage.removeItem('delivery-token')
    sessionStorage.removeItem('delivery-user')
    setToken('')
    setUser(null)
    setRecipes([])
    setQuery('')
    setError('')
    setNotice('')
  }

  const filteredRecipes = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('pt-BR')
    if (!normalized) return recipes
    return recipes.filter(recipe => recipe.name.toLocaleLowerCase('pt-BR').includes(normalized))
  }, [recipes, query])

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const term = query.trim()
    if (!term) {
      await loadRecipes(token)
      return
    }
    setLoading(true)
    setError('')
    try {
      const found = await searchRecipes(term, token)
      const localMatches = recipes.filter(r => r.isLocal && r.name.toLocaleLowerCase('pt-BR').includes(term.toLocaleLowerCase('pt-BR')))
      setRecipes(current => [...localMatches, ...found.filter(item => !localMatches.some(local => local.id === item.id))])
    } catch (err) {
      setError(getFriendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  function openCreate() { setEditing(null); setModalOpen(true) }
  function openEdit(recipe: Recipe) { setEditing(recipe); setModalOpen(true) }

  async function saveRecipe(data: RecipeFormData) {
    setSaving(true)
    setError('')
    setNotice('')
    try {
      if (editing) {
        if (editing.isLocal) {
          setRecipes(current => current.map(r => r.id === editing.id ? { ...r, ...data } : r))
          setNotice('Prato atualizado nesta sessão. A API DummyJSON não persiste alterações de verdade.')
        } else {
          try {
            const updated = await updateRecipe(editing.id, data, token)
            setRecipes(current => current.map(r => r.id === editing.id ? { ...r, ...updated, ...data } : r))
            setNotice('Prato atualizado com sucesso (simulação da API).')
          } catch (err) {
            if (err instanceof ApiError && err.status === 404) {
              setRecipes(current => current.map(r => r.id === editing.id ? { ...r, ...data } : r))
              setNotice('A API retornou 404 ao editar. A alteração foi mantida apenas na lista desta sessão.')
            } else throw err
          }
        }
      } else {
        const created = await addRecipe(data, token)
        const localRecipe: Recipe = { ...created, ...data, id: 51, isLocal: true, image: data.image || 'https://images.unsplash.com/photo-1547592180-85f173990554?w=900' }
        setRecipes(current => [localRecipe, ...current.filter(r => r.id !== 51)])
        setQuery('')
        setNotice('Prato adicionado! A API usa o ID 51 e a inclusão existe apenas nesta sessão.')
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
    setDeleteLoading(true)
    setError('')
    setNotice('')
    try {
      if (deleteTarget.isLocal) {
        setRecipes(current => current.filter(r => r.id !== deleteTarget.id))
        setNotice('Prato removido da lista desta sessão. A API DummyJSON não persiste exclusões.')
      } else {
        try {
          await deleteRecipe(deleteTarget.id, token)
          setRecipes(current => current.filter(r => r.id !== deleteTarget.id))
          setNotice('Prato removido com sucesso (simulação da API).')
        } catch (err) {
          if (err instanceof ApiError && err.status === 404) {
            setRecipes(current => current.filter(r => r.id !== deleteTarget.id))
            setNotice('A API retornou 404 ao excluir. O prato foi removido da lista local desta sessão.')
          } else throw err
        }
      }
      setDeleteTarget(null)
    } catch (err) {
      setError(getFriendlyError(err))
    } finally {
      setDeleteLoading(false)
    }
  }

  if (!token) return <LoginScreen onLogin={handleLogin} />

  const firstName = user?.firstName || user?.username || 'Restaurante'
  const totalMinutes = recipes.reduce((sum, recipe) => sum + (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0), 0)

  return (
    <main className="dashboard">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><ChefHat size={22} /></span><span>Sabor<span className="brand-accent"> da Casa</span></span></div>
        <div className="sidebar-label">RESTAURANTE</div>
        <div className="sidebar-current"><span className="restaurant-avatar"><Utensils size={18} /></span><span><strong>Minha cozinha</strong><small>Painel do parceiro</small></span><span className="status-dot" /></div>
        <div className="sidebar-label sidebar-label-spaced">GERENCIAMENTO</div>
        <div className="nav-item active"><Utensils size={18} /><span>Cardápio</span><span className="nav-count">{recipes.length}</span></div>
        <div className="sidebar-bottom">
          <div className="help-card"><span className="help-icon">✳</span><strong>Feito com cuidado.</strong><p>Um bom cardápio começa com ingredientes e detalhes bem cuidados.</p></div>
          <div className="user-profile"><span className="user-avatar">{firstName.charAt(0).toUpperCase()}</span><span className="user-details"><strong>{firstName}</strong><small>Administrador</small></span><button className="icon-button logout-button" onClick={logout} aria-label="Sair" title="Sair"><LogOut size={18} /></button></div>
        </div>
      </aside>

      <section className="main-content">
        <header className="topbar"><div className="breadcrumb">Painel <span>/</span> <strong>Cardápio</strong></div><div className="topbar-right"><span className="open-status"><span className="status-dot" /> Painel conectado</span><button className="button button-outline button-logout-mobile" onClick={logout}><LogOut size={16} /> Sair</button></div></header>
        <div className="page-content">
          <section className="welcome-row">
            <div><p className="eyebrow">SUA OPERAÇÃO, EM UM SÓ LUGAR</p><h1>Cardápio <span>do restaurante</span></h1><p className="page-subtitle">Cuide dos seus pratos e deixe cada detalhe pronto para servir.</p></div>
            <button className="button button-primary add-button" onClick={openCreate}><Plus size={18} /> Novo prato</button>
          </section>

          <section className="stats-grid" aria-label="Resumo do cardápio">
            <article className="stat-card"><span className="stat-icon green"><Utensils size={19} /></span><div><span className="stat-label">Pratos no cardápio</span><strong>{recipes.length}</strong><small>Itens disponíveis na lista</small></div></article>
            <article className="stat-card"><span className="stat-icon orange"><Clock3 size={19} /></span><div><span className="stat-label">Tempo somado</span><strong>{totalMinutes} <small>min</small></strong><small>Preparo + cozimento</small></div></article>
            <article className="stat-card"><span className="stat-icon violet"><ChefHat size={19} /></span><div><span className="stat-label">Cozinhas diferentes</span><strong>{new Set(recipes.map(r => r.cuisine).filter(Boolean)).size}</strong><small>Estilos representados</small></div></article>
          </section>

          {notice && <div className="alert alert-success" role="status"><CircleCheck size={18} /><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Fechar aviso"><X size={16} /></button></div>}
          {error && <div className="alert alert-error" role="alert"><CircleAlert size={18} /><span>{error}</span><button onClick={() => setError('')} aria-label="Fechar erro"><X size={16} /></button></div>}

          <section className="menu-section">
            <div className="section-heading"><div><h2>Seus pratos</h2><p>Gerencie os itens que fazem parte do seu menu.</p></div><span className="result-count">{filteredRecipes.length} {filteredRecipes.length === 1 ? 'prato' : 'pratos'}</span></div>
            <form className="search-row" onSubmit={handleSearch}>
              <div className="search-input-wrap"><Search size={19} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar prato pelo nome..." aria-label="Buscar prato pelo nome" /><button type="button" className="search-clear" onClick={() => setQuery('')} aria-label="Limpar busca" hidden={!query}><X size={16} /></button></div>
              <button className="button button-outline search-button" type="submit">Buscar</button>
            </form>
            {loading ? <div className="loading-state"><span className="spinner spinner-dark" /><span>Carregando cardápio...</span></div> :
              filteredRecipes.length ? <div className="recipe-grid">{filteredRecipes.map(recipe => <RecipeCard key={`${recipe.id}-${recipe.isLocal ? 'local' : 'api'}`} recipe={recipe} onEdit={openEdit} onDelete={setDeleteTarget} />)}</div> :
              <EmptyState searching={Boolean(query.trim())} onClear={() => setQuery('')} />}
            <div className="list-footer"><span>✳</span> Os preços são calculados automaticamente conforme o tempo de preparo.</div>
          </section>
          <footer className="app-footer"><span>© 2026 Sabor da Casa</span><span>PAINEL DO RESTAURANTE <span className="footer-dot">•</span> PROJETO ACADÊMICO</span></footer>
        </div>
      </section>

      {modalOpen && <RecipeModal recipe={editing} saving={saving} onClose={() => { if (!saving) { setModalOpen(false); setEditing(null) } }} onSave={handleSaveProxy} />}
      {deleteTarget && <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget && !deleteLoading) setDeleteTarget(null) }}><section className="modal confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-title"><div className="confirm-icon"><CircleAlert size={25} /></div><h2 id="delete-title">Excluir este prato?</h2><p>Você está prestes a remover <strong>{deleteTarget.name}</strong> do cardápio. Essa ação não pode ser desfeita nesta sessão.</p><div className="modal-actions"><button className="button button-outline" onClick={() => setDeleteTarget(null)} disabled={deleteLoading}>Cancelar</button><button className="button button-danger" onClick={confirmDelete} disabled={deleteLoading}>{deleteLoading ? 'Excluindo...' : 'Sim, excluir'}</button></div></section></div>}
    </main>
  )

  function handleSaveProxy(data: RecipeFormData) {
    void saveRecipe(data)
  }
}

export default App
