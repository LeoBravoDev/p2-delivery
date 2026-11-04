import type { ApiRecipe, Recipe, RecipeFormData } from '../types'

const API_URL = (import.meta.env.VITE_API_URL || 'https://dummyjson.com').replace(/\/$/, '')

export type LoginResponse = {
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

function toRecipe(item: ApiRecipe): Recipe {
  return { ...item, uid: `api-${item.id}` }
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

export async function getRecipes(): Promise<Recipe[]> {
  const data = await request<{ recipes: ApiRecipe[] }>(
    '/recipes?limit=50&skip=0&select=id,name,cuisine,image,prepTimeMinutes,cookTimeMinutes,servings,difficulty,rating',
  )
  return data.recipes.map(toRecipe)
}

export async function searchRecipes(query: string): Promise<Recipe[]> {
  const data = await request<{ recipes: ApiRecipe[] }>(`/recipes/search?q=${encodeURIComponent(query)}&limit=50`)
  return data.recipes.map(toRecipe)
}

export async function addRecipe(data: RecipeFormData): Promise<ApiRecipe> {
  return request<ApiRecipe>('/recipes/add', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateRecipe(id: number, data: RecipeFormData): Promise<Partial<ApiRecipe>> {
  return request<Partial<ApiRecipe>>(`/recipes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteRecipe(id: number): Promise<{ isDeleted?: boolean }> {
  return request<{ isDeleted?: boolean }>(`/recipes/${id}`, { method: 'DELETE' })
}

export function getPrice(recipe: Pick<Recipe, 'prepTimeMinutes' | 'cookTimeMinutes'>): number {
  return 15 + 0.5 * ((recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0))
}

export async function getMe(token: string): Promise<LoginResponse> {
  return request<LoginResponse>('/auth/me', {}, token)
}
