'use client'

import { useRef } from 'react'

type Props = {
  value: string
  onChange: (value: string) => void
}

export function MarkdownEditor({ value, onChange }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== 'Enter') return

    const el = ref.current!
    const { selectionStart } = el
    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
    const currentLine = value.slice(lineStart, selectionStart)
    const bulletMatch = currentLine.match(/^(  )?[-*] /)
    if (!bulletMatch) return

    e.preventDefault()
    const prefix = bulletMatch[0]
    const before = value.slice(0, selectionStart)
    const after = value.slice(selectionStart)
    const next = `${before}\n${prefix}${after}`
    onChange(next)

    // Move cursor after the inserted prefix
    const newPos = selectionStart + 1 + prefix.length
    requestAnimationFrame(() => {
      el.selectionStart = newPos
      el.selectionEnd = newPos
    })
  }

  return (
    <textarea
      ref={ref}
      className="w-full min-h-[600px] font-mono text-sm bg-background text-foreground border border-border rounded-md p-4 resize-y outline-none focus:ring-1 focus:ring-ring"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={`# Experience\n## Company · 2023–2024\nSeoul, Korea\n- Built something great\n  - Extended detail for this bullet\n- Another achievement`}
      spellCheck={false}
    />
  )
}
