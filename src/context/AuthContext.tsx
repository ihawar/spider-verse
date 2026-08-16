import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { User, AuthResponse } from '../types'
import { beginLoading, endLoading } from '../utils/loading'

const TOKEN_KEY = 'spiderverse.token'
const USER_KEY = 'spiderverse.user'

export const UNAUTHORIZED_EVENT = 'spiderverse:unauthorized'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function clearStoredAuth(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

interface AuthContextValue {
  user: User | null
  token: string | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken())
  const [user, setUser] = useState<User | null>(() => (getStoredToken() ? getStoredUser() : null))
  const [loading, setLoading] = useState(true)

  const persist = useCallback((t: string, u: User) => {
    localStorage.setItem(TOKEN_KEY, t)
    localStorage.setItem(USER_KEY, JSON.stringify(u))
    setToken(t)
    setUser(u)
  }, [])

  const clear = useCallback(() => {
    clearStoredAuth()
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    if (!getStoredToken()) {
      setLoading(false)
      return
    }
    const t = getStoredToken()
    beginLoading()
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${t}` } })
      .then(async (res) => {
        if (!res.ok) {
          clear()
          return
        }
        const u = (await res.json()) as User
        localStorage.setItem(USER_KEY, JSON.stringify(u))
        setUser(u)
      })
      .catch(() => clear())
      .finally(() => {
        endLoading()
        setLoading(false)
      })
  }, [clear])

  useEffect(() => {
    const onUnauthorized = () => clear()
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
  }, [clear])

  const login = useCallback(async (username: string, password: string) => {
    beginLoading()
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? 'Login failed')
      }
      const data = (await res.json()) as AuthResponse
      persist(data.token, data.user)
    } finally {
      endLoading()
    }
  }, [persist])

  const register = useCallback(async (username: string, password: string) => {
    beginLoading()
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? 'Registration failed')
      }
      const data = (await res.json()) as AuthResponse
      persist(data.token, data.user)
    } finally {
      endLoading()
    }
  }, [persist])

  const logout = useCallback(async () => {
    const t = getStoredToken()
    if (t) {
      beginLoading()
      try {
        await fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${t}` } })
      } catch {
        // ignore
      } finally {
        endLoading()
      }
    }
    clear()
  }, [clear])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
