import { Field, Node, RenderType, Section, SourceCvData, Variation } from '@/lib/source-cv'

function uid() { return Math.random().toString(36).slice(2, 10) }

// ─── Tree → Markdown ────────────────────────────────────────────────────────

function sectionToLines(section: Section, depth: number): string[] {
  const prefix = '#'.repeat(depth + 1)
  const title = section.title[0]?.value ?? ''
  const lines: string[] = [`${prefix} ${title}`]

  for (const child of section.children) {
    if (child.kind === 'section') {
      lines.push('')
      lines.push(...sectionToLines(child, depth + 1))
    } else {
      const field = child as Field
      const primary = field.value[0]
      if (!primary) continue

      if (primary.renderType === 'list') {
        lines.push(`- ${primary.value}`)
        for (const v of field.value.slice(1)) {
          lines.push(`  - ${v.value}`)
        }
      } else {
        lines.push(primary.value)
      }
    }
  }

  return lines
}

export function treeToMarkdown(data: SourceCvData): string {
  return data.sections
    .map((s) => sectionToLines(s, 0).join('\n'))
    .join('\n\n')
}

// ─── Markdown → Tree ────────────────────────────────────────────────────────

export function markdownToTree(markdown: string): SourceCvData {
  const lines = markdown.split('\n')
  const root: Section[] = []
  const stack: (Section | null)[] = []
  let lastBulletField: Field | null = null

  function currentSection(): Section | null {
    for (let i = stack.length - 1; i >= 0; i--) {
      if (stack[i]) return stack[i]!
    }
    return null
  }

  function addNode(node: Node) {
    const section = currentSection()
    if (section) section.children.push(node)
  }

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,4}) (.+)$/)
    if (headingMatch) {
      const depth = headingMatch[1].length - 1
      const title = headingMatch[2].trim()
      const renderType = `header${depth + 1}` as RenderType
      const section: Section = {
        kind: 'section',
        id: uid(),
        title: [{ renderType, value: title }],
        children: [],
      }

      stack.splice(depth, stack.length - depth, section)

      if (depth === 0) {
        root.push(section)
      } else {
        const parent = stack[depth - 1]
        if (parent) {
          parent.children.push(section)
        } else {
          root.push(section)
        }
      }

      lastBulletField = null
      continue
    }

    const indentedBullet = line.match(/^ {2,}- (.+)$/)
    if (indentedBullet && lastBulletField) {
      lastBulletField.value.push({ renderType: 'list', value: indentedBullet[1].trim() })
      continue
    }

    const bullet = line.match(/^- (.+)$/)
    if (bullet) {
      const field: Field = {
        kind: 'field',
        id: uid(),
        type: 'bullet',
        value: [{ renderType: 'list', value: bullet[1].trim() }],
      }
      addNode(field)
      lastBulletField = field
      continue
    }

    if (line.trim() === '') {
      lastBulletField = null
      continue
    }

    const field: Field = {
      kind: 'field',
      id: uid(),
      type: 'text',
      value: [{ renderType: 'text', value: line.trim() }],
    }
    addNode(field)
    lastBulletField = null
  }

  return { sections: root }
}
