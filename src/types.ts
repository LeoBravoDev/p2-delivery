export interface ApiRecipe {
  id: number
  name: string
  cuisine: string
  image: string
  prepTimeMinutes: number
  cookTimeMinutes: number
  servings?: number
  difficulty?: string
  rating?: number
}

// uid identifica o item na tela (pratos criados localmente repetem o id 51 da API)
export interface Recipe extends ApiRecipe {
  uid: string
  isLocal?: boolean
}

export interface RecipeFormData {
  name: string
  cuisine: string
  image: string
  prepTimeMinutes: number
  cookTimeMinutes: number
}
