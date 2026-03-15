import { Skeleton } from '@/components/ui/skeleton'

export function JobCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="mt-3">
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="mt-3 flex gap-1.5">
        <Skeleton className="h-5 w-16 rounded-md" />
        <Skeleton className="h-5 w-14 rounded-md" />
        <Skeleton className="h-5 w-18 rounded-md" />
        <Skeleton className="h-5 w-12 rounded-md" />
      </div>
      <div className="mt-3 flex justify-between">
        <Skeleton className="h-5 w-20 rounded-md" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  )
}
