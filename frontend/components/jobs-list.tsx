'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { SearchFilters } from '@/components/search-filters'
import { JobCard } from '@/components/job-card'
import { JobCardSkeleton } from '@/components/job-card-skeleton'
import { JobDetailPanel } from '@/components/job-detail-panel'
import { EmptyState } from '@/components/empty-state'
import { mockJobs } from '@/lib/mock-jobs'
import { Job, WorkType, JobSource } from '@/lib/types'

export function JobsList() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') ?? ''

  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [selectedWorkTypes, setSelectedWorkTypes] = useState<WorkType[]>([])
  const [selectedSources, setSelectedSources] = useState<JobSource[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleWorkTypeToggle = (type: WorkType) => {
    setSelectedWorkTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const handleSourceToggle = (source: JobSource) => {
    setSelectedSources((prev) =>
      prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]
    )
  }

  const handleJobClick = (job: Job) => {
    setSelectedJob(job)
    setIsPanelOpen(true)
  }

  const filteredJobs = useMemo(() => {
    return mockJobs.filter((job) => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesTitle = job.title.toLowerCase().includes(query)
        const matchesCompany = job.company.toLowerCase().includes(query)
        const matchesTags = job.tags.some((tag) => tag.toLowerCase().includes(query))
        const matchesLocation = job.location.toLowerCase().includes(query)
        
        if (!matchesTitle && !matchesCompany && !matchesTags && !matchesLocation) {
          return false
        }
      }

      // Work type filter
      if (selectedWorkTypes.length > 0 && !selectedWorkTypes.includes(job.workType)) {
        return false
      }

      // Source filter
      if (selectedSources.length > 0 && !selectedSources.includes(job.source)) {
        return false
      }

      return true
    })
  }, [searchQuery, selectedWorkTypes, selectedSources])

  return (
    <>
      <div className="space-y-6">
        <SearchFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedWorkTypes={selectedWorkTypes}
          onWorkTypeToggle={handleWorkTypeToggle}
          selectedSources={selectedSources}
          onSourceToggle={handleSourceToggle}
        />

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isLoading ? (
              'Loading jobs...'
            ) : (
              <>
                <span className="font-medium text-foreground">{filteredJobs.length}</span>{' '}
                {filteredJobs.length === 1 ? 'job' : 'jobs'} found
              </>
            )}
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-3">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSelected={selectedJob?.id === job.id}
                onClick={() => handleJobClick(job)}
              />
            ))}
          </div>
        )}
      </div>

      <JobDetailPanel
        job={selectedJob}
        open={isPanelOpen}
        onOpenChange={setIsPanelOpen}
      />
    </>
  )
}
