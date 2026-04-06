'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { Header } from '@/components/header'
import { SourceCvEditor } from '@/components/source-cv/SourceCvEditor'
import { SourceCvHeader } from '@/components/source-cv/SourceCvHeader'
import {
  SourceCvData,
  VersionSummary,
  emptySourceCv,
  getSourceCv,
  getVersions,
  putSourceCv,
} from '@/lib/source-cv'
import { toast } from 'sonner'

export default function SourceCvPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  const [cv, setCv] = useState<SourceCvData>(emptySourceCv())
  const [currentVersion, setCurrentVersion] = useState<number | null>(null)
  const [versions, setVersions] = useState<VersionSummary[]>([])
  const [isDirty, setIsDirty] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    getSourceCv().then((res) => {
      setCv(res.data)
      setCurrentVersion(res.version)
    })
    getVersions().then(setVersions)
  }, [user])

  function handleChange(updated: SourceCvData) {
    setCv(updated)
    setIsDirty(true)
  }

  const handleSave = useCallback(async (data: SourceCvData) => {
    setIsSaving(true)
    let retries = 0
    while (retries < 3) {
      try {
        const res = await putSourceCv(data)
        setCurrentVersion(res.version)
        setLastSaved(new Date())
        setIsDirty(false)
        break
      } catch {
        retries++
        if (retries === 3) {
          toast.error('Failed to save. Please try manually.')
        } else {
          await new Promise((r) => setTimeout(r, 5000))
        }
      }
    }
    setIsSaving(false)
  }, [])

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <SourceCvHeader
          currentVersion={currentVersion}
          lastSaved={lastSaved}
          isSaving={isSaving}
          versions={versions}
          onVersionCreated={(v) => setVersions((prev) => [v, ...prev])}
          onRestored={async () => {
            const res = await getSourceCv()
            setCv(res.data)
            setCurrentVersion(res.version)
            const vList = await getVersions()
            setVersions(vList)
          }}
        />
        <div className="mt-6">
          <SourceCvEditor
            cv={cv}
            isDirty={isDirty}
            onChange={handleChange}
            onSave={handleSave}
          />
        </div>
      </main>
    </div>
  )
}
