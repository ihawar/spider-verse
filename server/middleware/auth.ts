import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../db.js'

export interface AuthUser {
  id: string
  username: string
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  const token = header.slice('Bearer '.length).trim()
  const row = await prisma.authToken.findUnique({
    where: { token },
    include: { user: true },
  })
  if (!row || row.expiresAt < new Date()) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  req.user = { id: row.user.id, username: row.user.username }
  next()
}
