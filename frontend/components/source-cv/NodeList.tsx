'use client'

import { Node } from '@/lib/source-cv'
import { FieldRow } from './FieldRow'
import { SectionBlock } from './SectionBlock'

type Props = {
  nodes: Node[]
  depth: number
  onChange: (nodes: Node[]) => void
}

export function NodeList({ nodes, depth, onChange }: Props) {
  function updateNode(index: number, updated: Node) {
    const next = [...nodes]
    next[index] = updated
    onChange(next)
  }

  function deleteNode(index: number) {
    onChange(nodes.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-1">
      {nodes.map((node, i) =>
        node.kind === 'section' ? (
          <SectionBlock
            key={node.id}
            section={node}
            depth={depth}
            onChange={(updated) => updateNode(i, updated)}
            onDelete={() => deleteNode(i)}
          />
        ) : (
          <FieldRow
            key={node.id}
            field={node}
            onChange={(updated) => updateNode(i, updated as Node)}
            onDelete={() => deleteNode(i)}
          />
        )
      )}
    </div>
  )
}
