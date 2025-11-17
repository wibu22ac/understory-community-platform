import type { Metadata } from 'next'
import { AuthProvider } from '@/lib/auth'
import Nav from '@/components/Nav'
import './globals.css'

export const metadata: Metadata = {
  title: 'Understory',
  description: 'Community prototype',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Nav />
          <main className="page-shell">{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
