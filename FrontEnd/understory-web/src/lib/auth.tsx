'use client'

import React, { createContext, useContext, useState } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'

type AuthContextValue = {
  access: string | null
  login: (email: string, password: string) => Promise<void>
  // 👇 register tager nu også phone som 4. argument (valgfrit)
  register: (
    name: string,
    email: string,
    password: string,
    phone?: string
  ) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [access, setAccess] = useState<string | null>(null)

  async function login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || 'Login failed')
    }

    const data = await res.json()
    setAccess(data.access)
  }

  async function register(
    name: string,
    email: string,
    password: string,
    phone?: string
  ) {
    // 1) Opret bruger
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        password,
        phone, // 👈 send telefonnummer med til backend
      }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || 'Registration failed')
    }

    // 2) Log automatisk ind bagefter
    await login(email, password)
  }

  async function logout() {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })
    setAccess(null)
  }

  return (
    <AuthContext.Provider value={{ access, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
