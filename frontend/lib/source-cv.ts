import { apiFetch } from '@/lib/api'

export type RenderType =
  | 'header1' | 'header2' | 'header3' | 'header4'
  | 'text' | 'list' | 'table' | 'location' | 'period'

export type Variation = {
  renderType: RenderType
  value: string
}

export type Field = {
  kind: 'field'
  id: string
  type: string
  value: Variation[]
}

export type Section = {
  kind: 'section'
  id: string
  title: Variation[]
  children: Node[]
}

export type Node = Section | Field

export type SourceCvData = {
  sections: Section[]
}

export type SourceCvResponse = {
  id: string | null
  version: number | null
  label: string | null
  data: SourceCvData
  updatedAt: string | null
}

export type VersionSummary = {
  id: string
  version: number
  label: string | null
  updatedAt: string
}

export function emptySourceCv(): SourceCvData {
  return { sections: [] }
}

export async function getSourceCv(): Promise<SourceCvResponse> {
  const res = await apiFetch('/api/users/me/source-cv')
  if (!res.ok) throw new Error('Failed to load Source CV')
  return res.json()
}

export async function putSourceCv(data: SourceCvData): Promise<SourceCvResponse> {
  const res = await apiFetch('/api/users/me/source-cv', {
    method: 'PUT',
    body: JSON.stringify({ data }),
  })
  if (!res.ok) throw new Error('Failed to save Source CV')
  return res.json()
}

export async function getVersions(): Promise<VersionSummary[]> {
  const res = await apiFetch('/api/users/me/source-cv/versions')
  if (!res.ok) throw new Error('Failed to load versions')
  return res.json()
}

export async function createVersion(label?: string): Promise<VersionSummary> {
  const res = await apiFetch('/api/users/me/source-cv/versions', {
    method: 'POST',
    body: JSON.stringify({ label: label ?? null }),
  })
  if (!res.ok) throw new Error('Failed to create version')
  return res.json()
}

export async function restoreVersion(id: string): Promise<VersionSummary> {
  const res = await apiFetch(`/api/users/me/source-cv/versions/${id}/restore`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error('Failed to restore version')
  return res.json()
}
