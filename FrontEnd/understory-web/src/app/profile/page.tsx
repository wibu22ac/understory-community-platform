'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'

type Me = {
  id: string
  email: string
  name: string
  createdAt: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'

export default function ProfilePage() {
  const { access, logout } = useAuth()
  const router = useRouter()

  const [me, setMe] = useState<Me | null>(null)
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  // Hvis ingen access-token -> vis besked
  useEffect(() => {
    if (!access) {
      setLoading(false)
    }
  }, [access])

  // Hent /me når vi har et access token
  useEffect(() => {
    if (!access) return

    const fetchMe = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${access}`,
          },
        })
        if (!res.ok) {
          throw new Error(`Fejl ved hentning af profil: ${res.status}`)
        }
        const data: Me = await res.json()
        setMe(data)
        setName(data.name)
      } catch (err: any) {
        console.error(err)
        setError(err.message || 'Kunne ikke hente profil')
      } finally {
        setLoading(false)
      }
    }

    fetchMe()
  }, [access])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!access) return

    setError(null)
    setMessage(null)

    const payload: any = {}
    if (name.trim() && name !== me?.name) payload.name = name.trim()
    if (password.trim()) payload.password = password

    if (!Object.keys(payload).length) {
      setError('Der er ikke noget at opdatere')
      return
    }

    try {
      setSaving(true)
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Fejl ved opdatering: ${res.status}`)
      }
      const updated: Me = await res.json()
      setMe(updated)
      setName(updated.name)
      setPassword('')
      setMessage('Profil opdateret ✅')
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Kunne ikke opdatere profil')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!access || !me) return
    if (!confirm('Er du sikker på, at du vil slette din konto? Dette kan ikke fortrydes.')) {
      return
    }

    try {
      setDeleting(true)
      setError(null)
      setMessage(null)

      const res = await fetch(`${API_BASE}/api/auth/me`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${access}`,
        },
      })

      if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Fejl ved sletning: ${res.status}`)
      }

      // Log ud i frontend og send til login
      logout()
      router.push('/login')
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Kunne ikke slette konto')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 600, margin: '32px auto', padding: 16 }}>
        <h1>Profil</h1>
        <p>Henter dine oplysninger…</p>
      </div>
    )
  }

  if (!access) {
    return (
      <div style={{ maxWidth: 600, margin: '32px auto', padding: 16 }}>
        <h1>Profil</h1>
        <p>Du skal være logget ind for at se din profil.</p>
        <button onClick={() => router.push('/login')}>Gå til login</button>
      </div>
    )
  }

  if (!me) {
    return (
      <div style={{ maxWidth: 600, margin: '32px auto', padding: 16 }}>
        <h1>Profil</h1>
        <p>Kunne ikke finde brugerdata.</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 600, margin: '32px auto', padding: 16, display: 'grid', gap: 16 }}>
      <h1>Profil</h1>

      <div style={{ padding: 12, borderRadius: 8, border: '1px solid #eee', background: '#fafafa' }}>
        <p><strong>Email:</strong> {me.email}</p>
        <p><strong>Navn:</strong> {me.name}</p>
        <p style={{ fontSize: 12, color: '#777' }}>
          Oprettet: {new Date(me.createdAt).toLocaleString()}
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'grid', gap: 12 }}>
        <h2>Opdater profil</h2>

        <label style={{ display: 'grid', gap: 4 }}>
          <span>Navn</span>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ padding: 8, borderRadius: 6, border: '1px solid #ddd' }}
          />
        </label>

        <label style={{ display: 'grid', gap: 4 }}>
          <span>Nyt password (valgfrit)</span>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Lad feltet være tomt hvis det ikke skal ændres"
            style={{ padding: 8, borderRadius: 6, border: '1px solid #ddd' }}
          />
        </label>

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            border: 'none',
            background: saving ? '#888' : '#111',
            color: '#fff',
            cursor: saving ? 'default' : 'pointer',
          }}
        >
          {saving ? 'Gemmer…' : 'Gem ændringer'}
        </button>
      </form>

      <div style={{ borderTop: '1px solid #eee', paddingTop: 12 }}>
        <h2 style={{ color: '#b00020' }}>Farezone</h2>
        <p style={{ fontSize: 14, color: '#555' }}>
          Slet din konto permanent. Dette kan ikke fortrydes.
        </p>
        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{
            marginTop: 8,
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid #b00020',
            background: deleting ? '#eee' : '#fff5f5',
            color: '#b00020',
            cursor: deleting ? 'default' : 'pointer',
          }}
        >
          {deleting ? 'Sletter…' : 'Slet konto'}
        </button>
      </div>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}
    </div>
  )
}
