'use client'

import { useState } from 'react'
import { Section, Field, Variation, Node } from '@/lib/source-cv'
import { NodeList } from './NodeList'
import { VariationChip } from './VariationChip'
import { Plus, ChevronDown, ChevronRight, Trash2 } from 'lucide-react'

function uid() { return Math.random().toString(36).slice(2, 10) }

type Props = {
  section: Section
  depth: number
  onChange: (updated: Section) => void
  onDelete: () => void
}

export function SectionBlock({ section, depth, onChange, onDelete }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const [editingTitleIndex, setEditingTitleIndex] = useState<number | null>(null)

  function updateTitle(index: number, updated: Variation) {
    const next = [...section.title]
    next[index] = updated
    onChange({ ...section, title: next })
  }

  function deleteTitleVariation(index: number) {
    onChange({ ...section, title: section.title.filter((_, i) => i !== index) })
  }

  function addTitleVariation() {
    const defaultRenderType = (['header1', 'header2', 'header3', 'header4'] as const)[Math.min(depth, 3)]
    const next: Variation = { renderType: defaultRenderType, value: '' }
    onChange({ ...section, title: [...section.title, next] })
    setEditingTitleIndex(section.title.length)
  }

  function updateChildren(children: Node[]) {
    onChange({ ...section, children })
  }

  function addField() {
    const newField: Field = { kind: 'field', id: uid(), type: 'bullet', value: [] }
    onChange({ ...section, children: [...section.children, newField] })
  }

  function addSection() {
    const newSection: Section = { kind: 'section', id: uid(), title: [], children: [] }
    onChange({ ...section, children: [...section.children, newSection] })
  }

  const headingClass = [
    'text-xl font-bold',
    'text-lg font-semibold',
    'text-base font-medium',
    'text-sm font-medium',
  ][Math.min(depth, 3)]

  return (
    <div className="group py-1">
      {/* Section header */}
      <div className="flex items-start gap-2">
        <button
          className="mt-1 text-muted-foreground shrink-0"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed
            ? <ChevronRight className="h-4 w-4" />
            : <ChevronDown className="h-4 w-4" />}
        </button>

        <div className="flex-1">
          <div className={`flex flex-wrap gap-2 items-center ${headingClass}`}>
            {section.title.map((v, i) => (
              <VariationChip
                key={i}
                variation={v}
                isEditing={editingTitleIndex === i}
                onEdit={() => setEditingTitleIndex(i)}
                onClose={() => setEditingTitleIndex(null)}
                onChange={(updated) => updateTitle(i, updated)}
                onDelete={() => deleteTitleVariation(i)}
              />
            ))}
            <button
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={addTitleVariation}
            >
              {section.title.length === 0 ? '+ title' : '+ var'}
            </button>
          </div>
        </div>

        <button
          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive mt-1 shrink-0"
          onClick={onDelete}
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {/* Children */}
      {!collapsed && (
        <div className="ml-6 mt-1 border-l border-border pl-4">
          <NodeList nodes={section.children} depth={depth + 1} onChange={updateChildren} />
          <div className="flex gap-3 mt-2">
            <button className="text-xs text-muted-foreground hover:text-foreground" onClick={addField}>
              <Plus className="h-3 w-3 inline mr-1" />field
            </button>
            {depth < 3 && (
              <button className="text-xs text-muted-foreground hover:text-foreground" onClick={addSection}>
                <Plus className="h-3 w-3 inline mr-1" />section
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
