'use client'

type Props = {
  value: string
  onChange: (value: string) => void
}

export function MarkdownEditor({ value, onChange }: Props) {
  return (
    <textarea
      className="w-full min-h-[600px] font-mono text-sm bg-background text-foreground border border-border rounded-md p-4 resize-y outline-none focus:ring-1 focus:ring-ring"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`# Experience\n## Company · 2023–2024\nSeoul, Korea\n- Built something great\n  - Extended detail for this bullet\n- Another achievement`}
      spellCheck={false}
    />
  )
}
