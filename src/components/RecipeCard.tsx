import { Clock3, Pencil, Trash2, UtensilsCrossed } from 'lucide-react'
import type { Recipe } from '../types'
import { getPrice } from '../services/api'

interface RecipeCardProps {
  recipe: Recipe
  onEdit: (recipe: Recipe) => void
  onDelete: (recipe: Recipe) => void
}

export default function RecipeCard({ recipe, onEdit, onDelete }: RecipeCardProps) {
  const totalTime = (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0)
  return (
    <article className="recipe-card">
      <div className="recipe-image-wrap">
        <img
          className="recipe-image"
          src={recipe.image || 'https://images.unsplash.com/photo-1547592180-85f173990554?w=900'}
          alt={recipe.name}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = 'https://images.unsplash.com/photo-1547592180-85f173990554?w=900'
          }}
        />
        <span className="cuisine-pill">{recipe.cuisine || 'Especial da casa'}</span>
      </div>
      <div className="recipe-card-content">
        <div className="recipe-title-row">
          <h3>{recipe.name}</h3>
          <span className="recipe-price">{getPrice(recipe).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        </div>
        <p className="recipe-meta"><Clock3 size={15} /> Pronto em {totalTime} min</p>
        <div className="recipe-actions">
          <button className="button button-soft" onClick={() => onEdit(recipe)}><Pencil size={16} /> Editar</button>
          <button className="button button-danger-soft" onClick={() => onDelete(recipe)} aria-label={`Excluir ${recipe.name}`}><Trash2 size={16} /> Excluir</button>
        </div>
      </div>
    </article>
  )
}

export function EmptyState({ searching, onClear }: { searching: boolean; onClear: () => void }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><UtensilsCrossed size={28} /></div>
      <h3>{searching ? 'Nenhum prato encontrado' : 'Seu cardápio está vazio'}</h3>
      <p>{searching ? 'Tente buscar por outro nome ou limpe a pesquisa.' : 'Cadastre seu primeiro prato para começar a montar o cardápio.'}</p>
      {searching && <button className="button button-soft" onClick={onClear}>Limpar pesquisa</button>}
    </div>
  )
}
