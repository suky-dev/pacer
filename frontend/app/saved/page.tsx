'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bookmark } from 'lucide-react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useAuth } from '@/components/auth-provider'

export default function SavedJobsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Saved Jobs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Jobs you've bookmarked for later
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Bookmark className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-base font-medium text-foreground">No saved jobs yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Click the bookmark icon on any job listing to save it here for quick access later.
          </p>
          <Button asChild className="mt-6">
            <Link href="/jobs">Browse jobs</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
