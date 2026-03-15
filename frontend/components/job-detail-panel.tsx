'use client'

import { ExternalLink, MapPin, Calendar, Building2, Bookmark } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Job } from '@/lib/types'
import { cn } from '@/lib/utils'

interface JobDetailPanelProps {
  job: Job | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
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

export function JobDetailPanel({ job, open, onOpenChange }: JobDetailPanelProps) {
  if (!job) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-lg">
        <SheetHeader className="border-b border-border px-6 py-4">
          <div className="flex items-start justify-between gap-4 pr-8">
            <div>
              <SheetTitle className="text-left text-lg font-semibold text-foreground">
                {job.title}
              </SheetTitle>
              <SheetDescription className="mt-1 flex items-center gap-2 text-left">
                <Building2 className="h-4 w-4" />
                {job.company}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="py-4">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>Posted {formatDate(job.postedAt)}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn('font-medium', getWorkTypeBadgeClass(job.workType))}
                >
                  {job.workType.charAt(0).toUpperCase() + job.workType.slice(1)}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    'font-medium',
                    job.source === 'linkedin'
                      ? 'border-blue-500/30 text-blue-600 dark:text-blue-400'
                      : 'border-orange-500/30 text-orange-600 dark:text-orange-400'
                  )}
                >
                  {job.source === 'linkedin' ? 'LinkedIn' : 'Arbeitnow'}
                </Badge>
                {job.salary && (
                  <Badge variant="secondary" className="font-medium">
                    {job.salary}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {job.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="mb-3 text-sm font-medium text-foreground">Description</h4>
                <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {job.description}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={() => window.open(job.url, '_blank')}
            >
              Apply on {job.source === 'linkedin' ? 'LinkedIn' : 'Arbeitnow'}
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Bookmark className="h-4 w-4" />
              <span className="sr-only">Save job</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
