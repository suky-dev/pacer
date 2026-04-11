'use client'

import { useRef, useEffect } from 'react'
import { RenderType, Variation } from '@/lib/source-cv'
import { X } from 'lucide-react'

const RENDER_TYPES: RenderType[] = [
  'header1', 'header2', 'header3', 'header4',
  'text', 'list', 'table', 'location', 'period',
]

type Props = {
  variation: Variation
  isEditing: boolean
  onEdit: () => void
  onClose: () => void
  onChange: (updated: Variation) => void
  onDelete: () => void
}

export function VariationChip({ variation, isEditing, onEdit, onClose, onChange, onDelete }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing) textareaRef.current?.focus()
  }, [isEditing])

  if (isEditing) {
    return (
      <div className="flex flex-col gap-1 rounded border border-border bg-card p-2 w-full">
        <div className="flex items-center gap-2">
          <select
            className="text-xs bg-muted border border-border rounded px-1 py-0.5"
            value={variation.renderType}
            onChange={(e) => onChange({ ...variation, renderType: e.target.value as RenderType })}
          >
            {RENDER_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <button
            className="ml-auto text-muted-foreground hover:text-destructive"
            onClick={onClose}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
        <textarea
          ref={textareaRef}
          className="text-sm bg-transparent resize-none outline-none min-h-[60px] w-full"
          value={variation.value}
          onChange={(e) => onChange({ ...variation, value: e.target.value })}
          onBlur={onClose}
          onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
        />
      </div>
    )
  }

  return (
    <div className="group relative">
      <button
        className="w-full text-left text-sm px-2 py-1 pr-6 rounded bg-muted hover:bg-muted/80 whitespace-pre-wrap break-words"
        onClick={onEdit}
        title={variation.value}
      >
        {variation.value || <span className="text-muted-foreground italic">empty</span>}
      </button>
      <button
        className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
        onClick={onDelete}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}
