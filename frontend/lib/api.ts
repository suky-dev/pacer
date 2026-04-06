import { getToken } from './auth'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = getToken()
  return fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })
}
