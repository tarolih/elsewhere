import { useCallback, useMemo, useState } from 'react'
import { apiFetch } from '../api/client'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('elsewhere_token'))
  const [user, setUser] = useState(null)

  const setSession = useCallback((newToken) => {
    setToken(newToken)
    if (newToken) localStorage.setItem('elsewhere_token', newToken)
    else localStorage.removeItem('elsewhere_token')
  }, [])

  const loadMe = useCallback(async (activeToken = token) => {
    if (!activeToken) return
    const me = await apiFetch('/api/auth/me', {}, activeToken)
    setUser(me)
  }, [token])

  const login = useCallback(async (email, password) => {
    const data = await apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    setSession(data.access_token)
    await loadMe(data.access_token)
  }, [loadMe, setSession])

  const register = useCallback(async (email, password) => {
    const data = await apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) })
    setSession(data.access_token)
    await loadMe(data.access_token)
  }, [loadMe, setSession])

  const logout = useCallback(() => {
    setSession(null)
    setUser(null)
  }, [setSession])

  const value = useMemo(() => ({ token, user, login, register, loadMe, logout }), [token, user, login, register, loadMe, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
