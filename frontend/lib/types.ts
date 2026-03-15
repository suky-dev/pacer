export type JobSource = 'arbeitnow' | 'linkedin'

export type WorkType = 'remote' | 'onsite' | 'hybrid'

export interface Job {
  id: string
  title: string
  company: string
  location: string
  description: string
  tags: string[]
  source: JobSource
  workType: WorkType
  url: string
  postedAt: string
  salary?: string
}
