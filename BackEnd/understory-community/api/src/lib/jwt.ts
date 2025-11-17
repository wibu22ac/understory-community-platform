import jwt from 'jsonwebtoken'
const PRIV = (process.env.JWT_PRIVATE_KEY || '').replace(/\\n/g, '\n')
const PUB  = (process.env.JWT_PUBLIC_KEY  || '').replace(/\\n/g, '\n')
export function signAccess(payload: object, ttlSec = Number(process.env.JWT_ACCESS_TTL || 900)) {
  return jwt.sign(payload, PRIV, { algorithm: 'RS256', expiresIn: ttlSec })
}
export function signRefresh(payload: object, ttlSec = Number(process.env.JWT_REFRESH_TTL || 60*60*24*14)) {
  return jwt.sign(payload, PRIV, { algorithm: 'RS256', expiresIn: ttlSec })
}
export function verifyToken<T=any>(token: string) {
  return jwt.verify(token, PUB) as T
}
