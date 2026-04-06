'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import { isLoggedIn, removeToken } from '@/lib/auth'

interface User {
  id: string
  email: string
  name: string | null
  cvTemplateUrl: string | null
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  logout: () => void
  refetch: () => void
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  logout: () => {},
  refetch: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    if (!isLoggedIn()) {
      setLoading(false)
      return
    }
    try {
      const res = await apiFetch('/api/users/me')
      if (res.ok) {
        setUser(await res.json())
      } else {
        removeToken()
      }
    } catch {
      // network error — keep loading false, don't log out
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const logout = useCallback(() => {
    removeToken()
    setUser(null)
    router.push('/login')
  }, [router])

  return (
    <AuthContext.Provider value={{ user, loading, logout, refetch: fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
