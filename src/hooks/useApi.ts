import { useState, useCallback } from 'react'
import { getStoredToken, clearStoredAuth, UNAUTHORIZED_EVENT } from '../context/AuthContext'
import { beginLoading, endLoading } from '../utils/loading'

const BASE_URL = '/api'

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...extra }
  const token = getStoredToken()
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

function handleUnauthorized(res: Response): void {
  if (res.status === 401) {
    clearStoredAuth()
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
  }
}

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const rawGet = useCallback(async (path: string): Promise<unknown> => {
    setLoading(true)
    setError(null)
    beginLoading()
    try {
      const res = await fetch(`${BASE_URL}${path}`, { headers: authHeaders() })
      handleUnauthorized(res)
      if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`)
      return await res.json()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(msg)
      throw err
    } finally {
      endLoading()
      setLoading(false)
    }
  }, [])

  const rawPost = useCallback(async (path: string, body: unknown): Promise<unknown> => {
    setLoading(true)
    setError(null)
    beginLoading()
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(body),
      })
      handleUnauthorized(res)
      if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`)
      return await res.json()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(msg)
      throw err
    } finally {
      endLoading()
      setLoading(false)
    }
  }, [])

  const rawPut = useCallback(async (path: string, body: unknown): Promise<unknown> => {
    setLoading(true)
    setError(null)
    beginLoading()
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: 'PUT',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(body),
      })
      handleUnauthorized(res)
      if (!res.ok) throw new Error(`PUT ${path} failed: ${res.status}`)
      return await res.json()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(msg)
      throw err
    } finally {
      endLoading()
      setLoading(false)
    }
  }, [])

  const rawDel = useCallback(async (path: string): Promise<void> => {
    setLoading(true)
    setError(null)
    beginLoading()
    try {
      const res = await fetch(`${BASE_URL}${path}`, { method: 'DELETE', headers: authHeaders() })
      handleUnauthorized(res)
      if (!res.ok) throw new Error(`DELETE ${path} failed: ${res.status}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(msg)
      throw err
    } finally {
      endLoading()
      setLoading(false)
    }
  }, [])

  return {
    get: rawGet as <T>(path: string) => Promise<T>,
    post: rawPost as <T>(path: string, body: unknown) => Promise<T>,
    put: rawPut as <T>(path: string, body: unknown) => Promise<T>,
    del: rawDel,
    loading,
    error,
  }
}
