import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { login } from '../services/api'

export type User = { username: string; firstName?: string; lastName?: string }

interface AuthContextValue {
  token: string
  user: User | null
  signIn: (username: string, password: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('delivery-token') || '')
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(sessionStorage.getItem('delivery-user') || 'null') as User | null } catch { return null }
  })

  const value = useMemo<AuthContextValue>(() => ({
    token,
    user,
    async signIn(username, password) {
      const result = await login(username, password)
      const nextUser: User = { username: result.user.username, firstName: result.user.firstName, lastName: result.user.lastName }
      sessionStorage.setItem('delivery-token', result.token)
      sessionStorage.setItem('delivery-user', JSON.stringify(nextUser))
      setUser(nextUser)
      setToken(result.token)
    },
    signOut() {
      sessionStorage.removeItem('delivery-token')
      sessionStorage.removeItem('delivery-user')
      setToken('')
      setUser(null)
    },
  }), [token, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth precisa estar dentro de AuthProvider')
  return context
}
