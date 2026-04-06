'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { setToken } from '@/lib/auth'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      setToken(token)
      router.replace('/profile')
    } else {
      router.replace('/login')
    }
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground text-sm">Signing in...</p>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Signing in...</p>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
