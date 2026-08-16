import { Router } from 'express'
import { prisma } from '../db.js'
import { hashPassword, verifyPassword } from '../utils/password.js'
import { generateToken } from '../utils/tokens.js'
import { requireAuth } from '../middleware/auth.js'

export const authRouter = Router()

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000

function sanitize(user: { id: string; username: string }) {
  return { id: user.id, username: user.username }
}

async function issueToken(userId: string): Promise<string> {
  const token = generateToken()
  await prisma.authToken.create({
    data: { token, userId, expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
  })
  return token
}

authRouter.post('/register', async (req, res) => {
  const { username, password } = req.body ?? {}
  const uname = String(username ?? '').trim().toLowerCase()
  const pass = String(password ?? '')

  if (uname.length < 3 || uname.length > 32) {
    res.status(400).json({ error: 'Username must be 3-32 characters' })
    return
  }
  if (pass.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' })
    return
  }

  const existing = await prisma.user.findUnique({ where: { username: uname } })
  if (existing) {
    res.status(409).json({ error: 'Username already taken' })
    return
  }

  const user = await prisma.user.create({
    data: { username: uname, passwordHash: hashPassword(pass) },
  })
  const token = await issueToken(user.id)
  res.json({ token, user: sanitize(user) })
})

authRouter.post('/login', async (req, res) => {
  const { username, password } = req.body ?? {}
  const uname = String(username ?? '').trim().toLowerCase()

  const user = await prisma.user.findUnique({ where: { username: uname } })
  if (!user || !verifyPassword(String(password ?? ''), user.passwordHash)) {
    res.status(401).json({ error: 'Invalid username or password' })
    return
  }

  const token = await issueToken(user.id)
  res.json({ token, user: sanitize(user) })
})

authRouter.get('/me', requireAuth, async (req, res) => {
  res.json(sanitize(req.user!))
})

authRouter.post('/logout', requireAuth, async (req, res) => {
  const token = req.headers.authorization!.slice('Bearer '.length).trim()
  await prisma.authToken.deleteMany({ where: { token } })
  res.json({ success: true })
})
