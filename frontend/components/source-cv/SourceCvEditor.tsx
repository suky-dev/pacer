// frontend/components/source-cv/SourceCvEditor.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { Section, SourceCvData, Node } from '@/lib/source-cv'
import { treeToMarkdown, markdownToTree } from '@/lib/markdown-cv'
import { NodeList } from './NodeList'
import { MarkdownEditor } from './MarkdownEditor'
import { Plus, Code, List } from 'lucide-react'

function uid() { return Math.random().toString(36).slice(2, 10) }

type Props = {
  cv: SourceCvData
  isDirty: boolean
  onChange: (cv: SourceCvData) => void
  onSave: (cv: SourceCvData) => void
}

export function SourceCvEditor({ cv, isDirty, onChange, onSave }: Props) {
  const [mode, setMode] = useState<'tree' | 'markdown'>('tree')
  const [markdownText, setMarkdownText] = useState('')
  const [parseError, setParseError] = useState<string | null>(null)
  const onSaveRef = useRef(onSave)
  onSaveRef.current = onSave
  const selfUpdatedRef = useRef(false)

  // Auto-save: 5 seconds after last change
  useEffect(() => {
    if (!isDirty) return
    const timer = setTimeout(() => onSaveRef.current(cv), 5000)
    return () => clearTimeout(timer)
  }, [cv, isDirty])

  // Re-sync markdownText if cv is updated externally (e.g., version restore)
  useEffect(() => {
    if (mode === 'markdown' && !selfUpdatedRef.current) {
      setMarkdownText(treeToMarkdown(cv))
    }
    selfUpdatedRef.current = false
  }, [cv, mode])

  function switchToMarkdown() {
    setMarkdownText(treeToMarkdown(cv))
    setParseError(null)
    setMode('markdown')
  }

  function switchToTree() {
    try {
      onChange(markdownToTree(markdownText))
      setParseError(null)
      setMode('tree')
    } catch (e) {
      setParseError((e as Error).message)
    }
  }

  function handleMarkdownChange(text: string) {
    setMarkdownText(text)
    selfUpdatedRef.current = true
    try {
      onChange(markdownToTree(text))
      setParseError(null)
    } catch (e) {
      setParseError((e as Error).message)
    }
  }

  function updateSections(sections: Node[]) {
    onChange({ sections: sections as Section[] })
  }

  function addSection() {
    const newSection: Section = { kind: 'section', id: uid(), title: [], children: [] }
    onChange({ sections: [...cv.sections, newSection] })
  }

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex justify-end">
        {mode === 'tree' ? (
          <button
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded px-2 py-1"
            onClick={switchToMarkdown}
          >
            <Code className="h-3 w-3" />
            Markdown
          </button>
        ) : (
          <button
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded px-2 py-1"
            onClick={switchToTree}
          >
            <List className="h-3 w-3" />
            Tree
          </button>
        )}
      </div>

      {mode === 'markdown' ? (
        <>
          <MarkdownEditor value={markdownText} onChange={handleMarkdownChange} />
          {parseError && (
            <p className="text-xs text-destructive mt-1">{parseError}</p>
          )}
        </>
      ) : (
        <>
          <NodeList
            nodes={cv.sections}
            depth={0}
            onChange={updateSections}
          />
          <button
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-dashed border-border rounded px-4 py-2 w-full justify-center"
            onClick={addSection}
          >
            <Plus className="h-4 w-4" />
            Add Section
          </button>
        </>
      )}
    </div>
  )
}
