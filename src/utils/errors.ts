import { ApiError } from '../services/api'

export function getFriendlyError(error: unknown, isLogin = false): string {
  if (error instanceof ApiError) {
    if (isLogin && (error.status === 400 || error.status === 401)) {
      return 'Usuário ou senha incorretos. Confira os dados e tente novamente.'
    }
    if (error.status === 404) {
      return 'Erro 404: este prato não existe no servidor (a API só simula as alterações).'
    }
    return `${error.message} (status ${error.status || 'sem resposta HTTP'}).`
  }
  return 'Ocorreu um erro inesperado. Tente novamente.'
}
