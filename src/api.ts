import type { Recipe, RecipeFormData } from './types'

const API_URL = (import.meta.env.VITE_API_URL || 'https://dummyjson.com').replace(/\/$/, '')

type LoginResponse = {
  accessToken?: string
  token?: string
  id: number
  username: string
  firstName?: string
  lastName?: string
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.body) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers })
  } catch {
    throw new ApiError('Não foi possível conectar à API. Confira sua internet e tente novamente.', 0)
  }
  if (!response.ok) {
    let detail = ''
    try {
      const body = await response.json()
      detail = body.message || body.error || ''
    } catch { /* resposta sem JSON */ }
    throw new ApiError(detail || `A API respondeu com erro HTTP ${response.status}.`, response.status)
  }
  return response.json() as Promise<T>
}

export async function login(username: string, password: string): Promise<{ token: string; user: LoginResponse }> {
  const user = await request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password, expiresInMins: 60 }),
  })
  const token = user.accessToken || user.token
  if (!token) throw new ApiError('O login foi respondido, mas a API não retornou um token.', 200)
  return { token, user }
}

export async function getRecipes(token: string): Promise<Recipe[]> {
  const data = await request<{ recipes: Recipe[] }>('/recipes?limit=30&skip=0&select=id,name,cuisine,image,prepTimeMinutes,cookTimeMinutes,servings,difficulty,rating', {}, token)
  return data.recipes
}

export async function searchRecipes(query: string, token: string): Promise<Recipe[]> {
  const data = await request<{ recipes: Recipe[] }>(`/recipes/search?q=${encodeURIComponent(query)}&limit=30`, {}, token)
  return data.recipes
}

export async function addRecipe(data: RecipeFormData, token: string): Promise<Recipe> {
  return request<Recipe>('/recipes/add', {
    method: 'POST',
    body: JSON.stringify(data),
  }, token)
}

export async function updateRecipe(id: number, data: RecipeFormData, token: string): Promise<Recipe> {
  return request<Recipe>(`/recipes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }, token)
}

export async function deleteRecipe(id: number, token: string): Promise<{ isDeleted?: boolean }> {
  return request<{ isDeleted?: boolean }>(`/recipes/${id}`, { method: 'DELETE' }, token)
}

export function getPrice(recipe: Pick<Recipe, 'prepTimeMinutes' | 'cookTimeMinutes'>): number {
  return 15 + 0.5 * ((recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0))
}
