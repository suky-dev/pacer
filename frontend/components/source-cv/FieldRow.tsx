'use client'

import { useState } from 'react'
import { Field, Variation } from '@/lib/source-cv'
import { VariationChip } from './VariationChip'
import { Plus, Trash2 } from 'lucide-react'

type Props = {
  field: Field
  onChange: (updated: Field) => void
  onDelete: () => void
}

export function FieldRow({ field, onChange, onDelete }: Props) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingType, setEditingType] = useState(false)

  function updateVariation(index: number, updated: Variation) {
    const next = [...field.value]
    next[index] = updated
    onChange({ ...field, value: next })
  }

  function deleteVariation(index: number) {
    const next = field.value.filter((_, i) => i !== index)
    if (next.length === 0) { onDelete(); return }
    onChange({ ...field, value: next })
  }

  function addVariation() {
    const next: Variation = { renderType: 'text', value: '' }
    onChange({ ...field, value: [...field.value, next] })
    setEditingIndex(field.value.length)
  }

  return (
    <div className="group flex gap-3 py-1">
      {/* Field type label */}
      <div className="w-24 shrink-0 pt-1">
        {editingType ? (
          <input
            autoFocus
            className="w-full text-xs text-muted-foreground bg-transparent border-b border-border outline-none"
            value={field.type}
            onChange={(e) => onChange({ ...field, type: e.target.value })}
            onBlur={() => setEditingType(false)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') setEditingType(false) }}
          />
        ) : (
          <button
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setEditingType(true)}
          >
            {field.type || 'type'}
          </button>
        )}
      </div>

      {/* Variations */}
      <div className="flex-1 flex flex-col gap-1">
        {field.value.map((variation, i) => (
          <VariationChip
            key={i}
            variation={variation}
            isEditing={editingIndex === i}
            onEdit={() => setEditingIndex(i)}
            onClose={() => setEditingIndex(null)}
            onChange={(updated) => updateVariation(i, updated)}
            onDelete={() => deleteVariation(i)}
          />
        ))}
        {field.type !== 'text' && (
          <button
            className="text-xs text-muted-foreground hover:text-foreground text-left px-2"
            onClick={addVariation}
          >
            <Plus className="h-3 w-3 inline mr-1" />
            variation
          </button>
        )}
      </div>

      {/* Delete field */}
      <button
        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive mt-1 shrink-0"
        onClick={onDelete}
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  )
}
