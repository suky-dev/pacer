'use client'

import { useEffect, useRef } from 'react'
import { Section, SourceCvData, Node } from '@/lib/source-cv'
import { NodeList } from './NodeList'
import { Plus } from 'lucide-react'

function uid() { return Math.random().toString(36).slice(2, 10) }

type Props = {
  cv: SourceCvData
  isDirty: boolean
  onChange: (cv: SourceCvData) => void
  onSave: (cv: SourceCvData) => void
}

export function SourceCvEditor({ cv, isDirty, onChange, onSave }: Props) {
  const onSaveRef = useRef(onSave)
  onSaveRef.current = onSave

  // Auto-save: 5 seconds after last change
  useEffect(() => {
    if (!isDirty) return
    const timer = setTimeout(() => onSaveRef.current(cv), 5000)
    return () => clearTimeout(timer)
  }, [cv, isDirty])

  function updateSections(sections: Node[]) {
    onChange({ sections: sections as Section[] })
  }

  function addSection() {
    const newSection: Section = { kind: 'section', id: uid(), title: [], children: [] }
    onChange({ sections: [...cv.sections, newSection] })
  }

  return (
    <div className="space-y-4">
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
    </div>
  )
}
