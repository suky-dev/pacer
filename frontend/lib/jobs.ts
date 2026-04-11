import type { JobSource, WorkType } from './types'

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function getSourceLabel(source: JobSource): string {
  return source === 'linkedin' ? 'LinkedIn' : 'Arbeitnow'
}

export function getWorkTypeBadgeClass(workType: WorkType): string {
  switch (workType) {
    case 'remote':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
    case 'hybrid':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
    case 'onsite':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
  }
}
