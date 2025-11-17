'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'

const navItems = [
  { href: '/', label: 'Feed' },
  { href: '/upload', label: 'Upload' },
]

export default function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const { access, user, logout } = useAuth()

  const initial = user?.name?.[0]?.toUpperCase() ?? 'U'

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <button
          type="button"
          onClick={() => router.push('/')}
          className="brand-button"
        >
          <span className="brand-avatar">U</span>
          <span className="brand-text">Understory</span>
        </button>

        {/* Links */}
        <nav className="nav-links">
          {navItems.map((item) => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  'nav-link' + (active ? ' nav-link--active' : '')
                }
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Profil / login */}
        <div className="nav-right">
          {access ? (
            <>
              <Link href="/profile" className="nav-profile">
                <span className="nav-profile-badge">{initial}</span>
                <span className="nav-profile-name">
                  {user?.name ?? 'Profil'}
                </span>
              </Link>
              <button
                type="button"
                onClick={logout}
                className="nav-text-button"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="nav-text-button">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
