'use client'

import { FormEvent, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'

export default function UploadPage() {
  const { access } = useAuth()
  const router = useRouter()
  const search = useSearchParams()
  const ref = search.get('ref') || undefined

  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!access) {
    return (
      <div className="rounded-2xl border border-amber-500/40 bg-amber-950/30 px-4 py-4 text-sm text-amber-100">
        Du skal være logget ind for at uploade. Gå til <span className="font-semibold">Login</span> og prøv igen.
      </div>
    )
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!file) {
      setError('Vælg et billede først')
      return
    }
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      const form = new FormData()
      form.append('file', file)
      form.append('caption', caption)
      if (tags.trim()) form.append('tags', tags)
      if (ref) form.append('experienceRef', ref)

      const res = await fetch(`${API_BASE}/api/posts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${access}`,
        },
        body: form,
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Upload fejlede')
      }

      setSuccess(true)
      setCaption('')
      setTags('')
      setFile(null)
      router.push('/')
    } catch (err: any) {
      setError(err.message || 'Noget gik galt')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-50">Upload oplevelse</h1>
        <p className="text-xs text-slate-400">
          Del et billede og en kort tekst fra din seneste Understory-oplevelse.
        </p>
        {ref && (
          <p className="mt-1 text-xs text-emerald-300">
            Oprettes som svar på booking: <span className="font-mono">{ref}</span>
          </p>
        )}
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-md shadow-slate-900/60"
      >
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-300">
            Billede
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setFile(e.target.files?.[0] ?? null)}
            className="block w-full cursor-pointer bg-slate-950/40 text-xs file:mr-3 file:rounded-full file:border-none file:bg-emerald-500 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-900 hover:file:bg-emerald-400"
          />
          {file && (
            <p className="text-xs text-slate-400">
              Valgt: <span className="font-medium text-slate-200">{file.name}</span>
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-300">
            Beskrivelse
          </label>
          <textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            rows={3}
            placeholder="Kort beskrivelse af oplevelsen…"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-300">
            Tags (kommasepareret)
          </label>
          <input
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="fx skov, hike, venner"
          />
        </div>

        {error && (
          <p className="rounded-xl border border-red-500/40 bg-red-950/40 px-3 py-2 text-xs text-red-100">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-100">
            Dit opslag er oprettet 🎉
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 shadow-sm shadow-emerald-500/40 transition hover:bg-emerald-400 disabled:cursor-wait disabled:opacity-70"
        >
          {loading ? 'Uploader…' : 'Del oplevelse'}
        </button>
      </form>
    </div>
  )
}
