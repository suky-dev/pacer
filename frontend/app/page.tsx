'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight, Zap, Globe, Cpu } from 'lucide-react'
import { Header } from '@/components/header'

const SUGGESTIONS = [
  'Senior React Engineer',
  'Kotlin / Android',
  'Remote DevOps',
  'Staff Backend Engineer',
  'Machine Learning',
  'Full Stack TypeScript',
]

const STATS = [
  { label: 'Live jobs', value: '12,400+' },
  { label: 'Sources', value: '2' },
  { label: 'Updated', value: 'Hourly' },
]

export default function LandingPage() {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleSearch = (q?: string) => {
    const term = (q ?? query).trim()
    if (term) {
      router.push(`/jobs?q=${encodeURIComponent(term)}`)
    } else {
      router.push('/jobs')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header minimal />

      <main className="flex flex-1 flex-col items-center justify-center px-4">
        {/* Hero */}
        <div className="w-full max-w-2xl space-y-10 text-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Zap className="h-3 w-3 text-primary" />
              Jobs refreshed hourly from top sources
            </div>
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Find your next{' '}
              <span className="text-primary">engineering role</span>
            </h1>
            <p className="text-balance text-base text-muted-foreground sm:text-lg">
              Aggregated from LinkedIn and Arbeitnow. No noise, no sponsored listings — just jobs.
            </p>
          </div>

          {/* Search box */}
          <div className="relative">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 shadow-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search by role, skill, or tech stack…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
                autoFocus
              />
              <button
                onClick={() => handleSearch()}
                className="flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 active:opacity-75"
              >
                Search
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Suggestions */}
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSearch(s)}
                  className="rounded-md border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-secondary hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 border-t border-border pt-8">
            {STATS.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-xl font-semibold text-foreground">{stat.value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        Pacer — built for engineers, by engineers
      </footer>
    </div>
  )
}
