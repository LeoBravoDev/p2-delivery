export interface Recipe {
  id: number
  name: string
  cuisine: string
  image: string
  prepTimeMinutes: number
  cookTimeMinutes: number
  servings?: number
  difficulty?: string
  rating?: number
  isLocal?: boolean
}

export interface RecipeFormData {
  name: string
  cuisine: string
  image: string
  prepTimeMinutes: number
  cookTimeMinutes: number
}
