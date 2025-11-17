export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'

export async function api<T>(path: string, opts: RequestInit = {}, access?: string): Promise<T> {
  const headers = new Headers(opts.headers || {})
  if (!headers.has('Content-Type') && !(opts.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  if (access) headers.set('Authorization', `Bearer ${access}`)
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers, credentials: 'include' })
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`
    try { const j = await res.json(); msg = j?.error || msg } catch {}
    throw new Error(msg)
  }
  const txt = await res.text()
  return txt ? (JSON.parse(txt) as T) : (undefined as T)
}
