'use client'

import { useState } from 'react'
import { VersionSummary, createVersion, restoreVersion } from '@/lib/source-cv'
import { Button } from '@/components/ui/button'
import { Save, Clock, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'

type Props = {
  currentVersion: number | null
  lastSaved: Date | null
  isSaving: boolean
  versions: VersionSummary[]
  onVersionCreated: (v: VersionSummary) => void
  onRestored: () => void
}

export function SourceCvHeader({
  currentVersion,
  lastSaved,
  isSaving,
  versions,
  onVersionCreated,
  onRestored,
}: Props) {
  const [showHistory, setShowHistory] = useState(false)
  const [savingVersion, setSavingVersion] = useState(false)

  async function handleSaveVersion() {
    setSavingVersion(true)
    try {
      const v = await createVersion()
      onVersionCreated(v)
      toast.success(`Version ${v.version} saved`)
    } catch {
      toast.error('Failed to save version')
    } finally {
      setSavingVersion(false)
    }
  }

  async function handleRestore(id: string, version: number) {
    try {
      await restoreVersion(id)
      toast.success(`Restored from v${version}`)
      onRestored()
      setShowHistory(false)
    } catch {
      toast.error('Failed to restore version')
    }
  }

  return (
    <div className="flex items-center gap-4 pb-4 border-b border-border">
      <div>
        <h1 className="text-2xl font-semibold">Source CV</h1>
        <p className="text-sm text-muted-foreground">
          {isSaving && 'Saving…'}
          {!isSaving && lastSaved && `Saved ${lastSaved.toLocaleTimeString()}`}
          {!isSaving && !lastSaved && (currentVersion ? `v${currentVersion}` : 'Not saved yet')}
        </p>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {versions.length > 0 && (
          <div className="relative">
            <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)}>
              <Clock className="h-4 w-4 mr-1" />
              History
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
            {showHistory && (
              <div className="absolute right-0 top-9 z-10 w-64 rounded-md border border-border bg-card shadow-md">
                {versions.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between px-3 py-2 hover:bg-muted text-sm"
                  >
                    <span>
                      v{v.version}{v.label ? ` — ${v.label}` : ''}
                    </span>
                    <button
                      className="text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => handleRestore(v.id, v.version)}
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <Button size="sm" onClick={handleSaveVersion} disabled={savingVersion}>
          <Save className="h-4 w-4 mr-1" />
          {savingVersion ? 'Saving…' : 'Save Version'}
        </Button>
      </div>
    </div>
  )
}
