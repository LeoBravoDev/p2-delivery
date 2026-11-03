import { useEffect, useState, type FormEvent } from 'react'
import { ImagePlus, X } from 'lucide-react'
import type { Recipe, RecipeFormData } from '../types'

interface RecipeModalProps {
  recipe: Recipe | null
  saving: boolean
  onClose: () => void
  onSave: (data: RecipeFormData) => void
}

const initialForm: RecipeFormData = {
  name: '', cuisine: '', image: '', prepTimeMinutes: 10, cookTimeMinutes: 20,
}

export default function RecipeModal({ recipe, saving, onClose, onSave }: RecipeModalProps) {
  const [form, setForm] = useState<RecipeFormData>(initialForm)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    setForm(recipe ? {
      name: recipe.name,
      cuisine: recipe.cuisine || '',
      image: recipe.image || '',
      prepTimeMinutes: recipe.prepTimeMinutes || 0,
      cookTimeMinutes: recipe.cookTimeMinutes || 0,
    } : initialForm)
    setFormError('')
  }, [recipe])

  const update = (field: keyof RecipeFormData, value: string | number) => {
    setForm(current => ({ ...current, [field]: value }))
  }

  const price = 15 + 0.5 * (Number(form.prepTimeMinutes) + Number(form.cookTimeMinutes))

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.name.trim() || !form.cuisine.trim()) {
      setFormError('Preencha o nome do prato e a cozinha.')
      return
    }
    if (Number(form.prepTimeMinutes) < 0 || Number(form.cookTimeMinutes) < 0) {
      setFormError('Os tempos não podem ser negativos.')
      return
    }
    onSave({ ...form, name: form.name.trim(), cuisine: form.cuisine.trim(), prepTimeMinutes: Number(form.prepTimeMinutes), cookTimeMinutes: Number(form.cookTimeMinutes) })
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose() }}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <div>
            <p className="eyebrow">{recipe ? 'ATUALIZAÇÃO DO CARDÁPIO' : 'NOVO ITEM'}</p>
            <h2 id="modal-title">{recipe ? 'Editar prato' : 'Adicionar prato'}</h2>
          </div>
          <button className="icon-button" onClick={onClose} disabled={saving} aria-label="Fechar"><X size={20} /></button>
        </div>
        <form onSubmit={submit} className="recipe-form">
          <label>Nome do prato
            <input autoFocus maxLength={90} value={form.name} onChange={e => update('name', e.target.value)} placeholder="Ex.: Risoto de cogumelos" required />
          </label>
          <label>Tipo de cozinha
            <input maxLength={50} value={form.cuisine} onChange={e => update('cuisine', e.target.value)} placeholder="Ex.: Italiana, Brasileira..." required />
          </label>
          <label>URL da foto <span className="optional">(opcional)</span>
            <div className="input-with-icon"><ImagePlus size={17} /><input type="url" value={form.image} onChange={e => update('image', e.target.value)} placeholder="https://..." /></div>
          </label>
          <div className="form-grid">
            <label>Preparo (min)
              <input type="number" min="0" max="600" value={form.prepTimeMinutes} onChange={e => update('prepTimeMinutes', Number(e.target.value))} required />
            </label>
            <label>Cozimento (min)
              <input type="number" min="0" max="600" value={form.cookTimeMinutes} onChange={e => update('cookTimeMinutes', Number(e.target.value))} required />
            </label>
          </div>
          <div className="price-preview"><span>Preço calculado</span><strong>{price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong><small>R$ 15 + R$ 0,50 por minuto total</small></div>
          {formError && <p className="form-error" role="alert">{formError}</p>}
          <div className="modal-actions">
            <button type="button" className="button button-outline" onClick={onClose} disabled={saving}>Cancelar</button>
            <button type="submit" className="button button-primary" disabled={saving}>{saving ? 'Salvando...' : recipe ? 'Salvar alterações' : 'Adicionar prato'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}
