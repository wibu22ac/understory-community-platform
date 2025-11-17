import { Router } from 'express'
import { prisma } from '../../lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { signAccess, signRefresh, verifyToken } from '../../lib/jwt'
import { authGuard } from '../../middlewares/authGuard'
import { sendSms } from '../../lib/sms'
import { sendMail } from '../../lib/mailer'

const r = Router()

// REGISTER
r.post('/register', async (req, res) => {
  const body = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2),
    phone: z.string().min(5).optional(), 
  }).safeParse(req.body)

  if (!body.success) {
    return res.status(400).json({ error: body.error.flatten() })
  }

  const hash = await bcrypt.hash(body.data.password, 12)

  const user = await prisma.user.create({
    data: {
      email: body.data.email,
      passwordHash: hash,
      name: body.data.name,
      phone: body.data.phone ?? null, // 👈 gem telefon
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true, // 👈 eksponér telefon i respons
    },
  })

  // 👇 Send velkomst-/test-SMS hvis der er angivet telefonnummer
  if (body.data.phone) {
    try {
      await sendSms(
        body.data.phone,
        'Velkommen til Understory Community! 🌿 Tak fordi du oprettede en bruger.'
      )
    } catch (err) {
      console.error('Fejl ved afsendelse af velkomst-SMS:', err)
      // Registreringen skal stadig lykkes selvom SMS fejler
    }
  }

try {
    await sendMail(
      body.data.email,                           // 👈 to
      'Velkommen til Understory Community 🌿',   // subject
      `Hej ${body.data.name},

Tak fordi du har oprettet en konto hos Understory Community.

Du kan nu logge ind, dele oplevelser og blive inspireret af andre værter og deltagere.

De bedste hilsner
Understory-teamet`
    )
  } catch (err) {
    console.error('Fejl ved afsendelse af velkomst-email:', err)
  }

  res.json(user)
})


// LOGIN
r.post('/login', async (req, res) => {
  const p = z.object({
    email: z.string().email(),
    password: z.string(),
  }).safeParse(req.body)

  if (!p.success) return res.status(400).json({ error: p.error.flatten() })

  const user = await prisma.user.findUnique({ where: { email: p.data.email } })
  if (!user) return res.status(401).json({ error: 'invalid creds' })

  const ok = await bcrypt.compare(p.data.password, (user as any).passwordHash)
  if (!ok) return res.status(401).json({ error: 'invalid creds' })

  const access = signAccess({ sub: user.id })
  const refresh = signRefresh({ sub: user.id })

  res.cookie('rt', refresh, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/api/auth',
  })

  res.json({ access })
})

// REFRESH
r.post('/refresh', (req, res) => {
  const rt = req.cookies?.rt
  if (!rt) return res.status(401).json({ error: 'no refresh' })

  try {
    const p = verifyToken<{ sub: string }>(rt)
    return res.json({ access: signAccess({ sub: p.sub }) })
  } catch {
    return res.status(401).json({ error: 'invalid refresh' })
  }
})

// LOGOUT
r.post('/logout', (_req, res) => {
  res.clearCookie('rt', { path: '/api/auth' })
  res.status(204).end()
})

// Hent nuværende bruger
r.get('/me', authGuard, async (req, res) => {
  const userId = (req as any).user.sub as string

  const user = await prisma.user.findUnique({
    where: { id: userId },
       select: {
      id: true,
      email: true,
      name: true,
      phone: true,     // 👈 tilføj denne linje
      createdAt: true,
    },
  })

  if (!user) return res.status(404).json({ error: 'not found' })

  return res.json(user)
})

// Opdater nuværende bruger (navn + evt. password + phone)
r.put('/me', authGuard, async (req, res) => {
  const userId = (req as any).user.sub as string
  const { name, password, phone } = req.body || {}

  const data: any = {}
  if (name) data.name = name
  if (typeof phone !== 'undefined') data.phone = phone // 👈 tillad også null/"" for at rydde det
  if (password) data.passwordHash = await bcrypt.hash(password, 12)

  if (!Object.keys(data).length) {
    return res.status(400).json({ error: 'nothing to update' })
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,      // 👈 tilføjet
      createdAt: true,
    },
  })

  return res.json(user)
})


// Slet nuværende bruger
r.delete('/me', authGuard, async (req, res) => {
  const userId = (req as any).user.sub as string

  await prisma.user.delete({
    where: { id: userId },
  })

  return res.status(204).end()
})

export default r
