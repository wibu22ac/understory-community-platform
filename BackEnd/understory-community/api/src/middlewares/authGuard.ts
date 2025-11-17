import type { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../lib/jwt'

export function authGuard(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : undefined
  if (!token) return res.status(401).json({ error: 'missing token' })
  try {
    (req as any).user = verifyToken(token)
    next()
  } catch {
    return res.status(401).json({ error: 'invalid token' })
  }
}
