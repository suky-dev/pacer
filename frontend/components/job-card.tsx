'use client'

import { MapPin, Calendar, Bookmark } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Job } from '@/lib/types'
import { cn } from '@/lib/utils'

interface JobCardProps {
  job: Job
  isSelected?: boolean
  onClick: () => void
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return `${Math.floor(diffDays / 30)}mo ago`
}

function getWorkTypeBadgeClass(workType: string) {
  switch (workType) {
    case 'remote':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
    case 'hybrid':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
    case 'onsite':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
    default:
      return ''
  }
}

export function JobCard({ job, isSelected, onClick }: JobCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group w-full text-left rounded-lg border p-4 transition-all',
        'hover:border-primary/50 hover:bg-secondary/50',
        isSelected
          ? 'border-primary bg-secondary/50 ring-1 ring-primary/20'
          : 'border-border bg-card'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-medium text-foreground group-hover:text-primary transition-colors">
              {job.title}
            </h3>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{job.company}</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(job.postedAt)}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{job.location}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge
          variant="outline"
          className={cn('text-[10px] font-medium', getWorkTypeBadgeClass(job.workType))}
        >
          {job.workType.charAt(0).toUpperCase() + job.workType.slice(1)}
        </Badge>
        {job.tags.slice(0, 4).map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="text-[10px] font-normal"
          >
            {tag}
          </Badge>
        ))}
        {job.tags.length > 4 && (
          <span className="text-[10px] text-muted-foreground">+{job.tags.length - 4}</span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <Badge
          variant="outline"
          className={cn(
            'text-[10px] font-medium',
            job.source === 'linkedin'
              ? 'border-blue-500/30 text-blue-600 dark:text-blue-400'
              : 'border-orange-500/30 text-orange-600 dark:text-orange-400'
          )}
        >
          {job.source === 'linkedin' ? 'LinkedIn' : 'Arbeitnow'}
        </Badge>
        {job.salary && (
          <span className="text-xs font-medium text-foreground">{job.salary}</span>
        )}
      </div>
    </button>
  )
}
