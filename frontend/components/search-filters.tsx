'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { WorkType, JobSource } from '@/lib/types'
import { cn } from '@/lib/utils'

interface SearchFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedWorkTypes: WorkType[]
  onWorkTypeToggle: (type: WorkType) => void
  selectedSources: JobSource[]
  onSourceToggle: (source: JobSource) => void
}

const workTypes: { value: WorkType; label: string }[] = [
  { value: 'remote', label: 'Remote' },
  { value: 'onsite', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' },
]

const sources: { value: JobSource; label: string }[] = [
  { value: 'arbeitnow', label: 'Arbeitnow' },
  { value: 'linkedin', label: 'LinkedIn' },
]

export function SearchFilters({
  searchQuery,
  onSearchChange,
  selectedWorkTypes,
  onWorkTypeToggle,
  selectedSources,
  onSourceToggle,
}: SearchFiltersProps) {
  const hasFilters = searchQuery || selectedWorkTypes.length > 0 || selectedSources.length > 0

  const clearAll = () => {
    onSearchChange('')
    selectedWorkTypes.forEach(onWorkTypeToggle)
    selectedSources.forEach(onSourceToggle)
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by keyword (e.g. kotlin, java, frontend)"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-10 pl-9 pr-4"
        />
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Work type:</span>
        {workTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => onWorkTypeToggle(type.value)}
            className={cn(
              'inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
              selectedWorkTypes.includes(type.value)
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-foreground hover:bg-secondary'
            )}
          >
            {type.label}
          </button>
        ))}
        
        <span className="ml-2 text-xs font-medium text-muted-foreground">Source:</span>
        {sources.map((source) => (
          <button
            key={source.value}
            onClick={() => onSourceToggle(source.value)}
            className={cn(
              'inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
              selectedSources.includes(source.value)
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-foreground hover:bg-secondary'
            )}
          >
            {source.label}
          </button>
        ))}

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="ml-auto h-7 text-xs text-muted-foreground"
          >
            <X className="mr-1 h-3 w-3" />
            Clear all
          </Button>
        )}
      </div>
    </div>
  )
}
