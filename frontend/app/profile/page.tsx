'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiFetch } from '@/lib/api'
import { useAuth } from '@/components/auth-provider'

function toEmbedUrl(url: string): string {
  try {
    const parsed = new URL(url)
    parsed.search = ''
    parsed.hash = ''
    return `${parsed.toString()}?embedded=true`
  } catch {
    return `${url}?embedded=true`
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [urlInput, setUrlInput] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
    if (user) {
      setUrlInput(user.cvTemplateUrl ?? '')
    }
  }, [user, loading, router])

  const handleSave = async () => {
    setSaving(true)
    const res = await apiFetch('/api/users/me/cv-template', {
      method: 'PATCH',
      body: JSON.stringify({ cvTemplateUrl: urlInput }),
    })
    if (res.ok) {
      const data = await res.json()
      setUrlInput(data.cvTemplateUrl ?? '')
    }
    setSaving(false)
  }

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
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-semibold">Profile</h1>

        <section className="mb-8 rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-medium">CV Template</h2>
          <p className="mb-3 text-sm text-muted-foreground">
            Paste your Google Docs CV template URL. The app will use this to generate job-specific resumes.
          </p>
          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://docs.google.com/document/d/..."
              className="flex-1"
            />
            <Button onClick={handleSave} disabled={saving || !urlInput}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </section>

        {urlInput && (
          <section className="rounded-lg border border-border overflow-hidden">
            <div className="border-b border-border bg-card px-4 py-2 text-sm font-medium">
              CV Preview
            </div>
            <iframe
              src={toEmbedUrl(urlInput)}
              className="h-[80vh] w-full"
              title="CV Template"
            />
          </section>
        )}
      </main>
    </div>
  )
}
