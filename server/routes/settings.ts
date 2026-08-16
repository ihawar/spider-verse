import { Router } from 'express'
import { prisma } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

export const settingsRouter = Router()

const DEFAULTS = {
  pomodoroEnabled: 'false',
  pomodoroFocusMinutes: '25',
  pomodoroBreakMinutes: '5',
}

const KEYS = ['pomodoroEnabled', 'pomodoroFocusMinutes', 'pomodoroBreakMinutes']

async function readSettings(userId: string) {
  const rows = await prisma.appSetting.findMany({ where: { userId, key: { in: KEYS } } })
  const map = new Map(rows.map((r) => [r.key, r.value]))
  const get = (key: string) => map.get(key) ?? DEFAULTS[key]
  return {
    pomodoroEnabled: get('pomodoroEnabled') === 'true',
    pomodoroFocusMinutes: Number(get('pomodoroFocusMinutes')),
    pomodoroBreakMinutes: Number(get('pomodoroBreakMinutes')),
  }
}

settingsRouter.get('/', requireAuth, async (req, res) => {
  res.json(await readSettings(req.user!.id))
})

settingsRouter.put('/', requireAuth, async (req, res) => {
  const { pomodoroEnabled, pomodoroFocusMinutes, pomodoroBreakMinutes } = req.body
  const userId = req.user!.id

  const focusMinutes = Math.max(1, Math.floor(Number(pomodoroFocusMinutes) || 1))
  const breakMinutes = Math.max(1, Math.floor(Number(pomodoroBreakMinutes) || 1))

  const entries: Record<string, string> = {
    pomodoroEnabled: pomodoroEnabled ? 'true' : 'false',
    pomodoroFocusMinutes: String(focusMinutes),
    pomodoroBreakMinutes: String(breakMinutes),
  }

  for (const [key, value] of Object.entries(entries)) {
    await prisma.appSetting.upsert({
      where: { userId_key: { userId, key } },
      update: { value },
      create: { userId, key, value },
    })
  }

  res.json(await readSettings(userId))
})
