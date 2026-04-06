'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import { isLoggedIn, removeToken } from '@/lib/auth'

interface User {
  id: string
  email: string
  name: string | null
  cvTemplateUrl: string | null
}

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn()) {
      setLoading(false)
      return
    }
    apiFetch('/api/users/me')
      .then((res) => {
        if (res.ok) return res.json()
        removeToken()
        return null
      })
      .then((data: User | null) => {
        setUser(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  const logout = () => {
    removeToken()
    setUser(null)
    router.push('/login')
  }

  return { user, loading, logout }
}
