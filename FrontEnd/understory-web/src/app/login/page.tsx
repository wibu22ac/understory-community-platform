'use client'

import { FormEvent, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const search = useSearchParams()
  const { login, register } = useAuth()

  const initialMode =
    (search.get('mode') === 'signup' ? 'signup' : 'login') as 'login' | 'signup'

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('') // 👈 NY STATE
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(name, email, password, phone) // 👈 SEND PHONE MED
      }
      router.push('/')
    } catch (err: any) {
      setError(err.message || 'Noget gik galt')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center pt-10">
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-900/70">
        <h1 className="text-lg font-semibold text-slate-50">
          {mode === 'login' ? 'Log ind' : 'Opret bruger'}
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          {mode === 'login'
            ? 'Log ind for at dele og se oplevelser.'
            : 'Opret en konto for at begynde at dele oplevelser.'}
        </p>

        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                Navn
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                required={mode === 'signup'}
                placeholder="Dit navn"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="dig@eksempel.dk"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Mindst 8 tegn"
            />
          </div>

          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                Telefon (til SMS)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+45 12 34 56 78"
                required={mode === 'signup'}
              />
            </div>
          )}

          {error && (
            <p className="rounded-xl border border-red-500/40 bg-red-950/40 px-3 py-2 text-xs text-red-100">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 shadow-sm shadow-emerald-500/40 transition hover:bg-emerald-400 disabled:cursor-wait disabled:opacity-70"
          >
            {loading
              ? 'Arbejder…'
              : mode === 'login'
              ? 'Log ind'
              : 'Opret bruger'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <>
              Har du ikke en konto?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup')
                  setError(null)
                }}
                className="font-medium text-emerald-300 hover:text-emerald-200"
              >
                Opret bruger
              </button>
            </>
          ) : (
            <>
              Har du allerede en konto?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setError(null)
                }}
                className="font-medium text-emerald-300 hover:text-emerald-200"
              >
                Log ind
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
