import { Router } from 'express'
import { prisma } from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { jalaliMonthStart, jalaliMonthLength, toJalali, PERSIAN_WEEKDAYS } from '../utils/jalali.js'

export const analyticsRouter = Router()

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

analyticsRouter.get('/', requireAuth, async (req, res) => {
  const { period } = req.query
  const periodStr = String(period || 'weekly')
  const userId = req.user!.id

  const now = new Date()
  let startDate: Date
  let dailyRange: Date[] = []

  switch (periodStr) {
    case 'weekly': {
      const day = now.getDay()
      const diff = now.getDate() - ((day + 1) % 7)
      startDate = new Date(now.getFullYear(), now.getMonth(), diff)
      for (let i = 0; i < 7; i++) {
        dailyRange.push(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i))
      }
      break
    }
    case 'monthly': {
      startDate = jalaliMonthStart(now)
      const length = jalaliMonthLength(now)
      for (let i = 0; i < length; i++) {
        dailyRange.push(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i))
      }
      break
    }
    case 'all':
    default:
      startDate = new Date(0)
      break
  }

  const sessions = await prisma.session.findMany({
    where: { userId, startTime: { gte: startDate } },
    include: { topic: true },
  })

  const totalSeconds = sessions.reduce((sum, s) => sum + s.duration, 0)
  const totalHours = +(totalSeconds / 3600).toFixed(2)

  const tasksCompleted = await prisma.task.count({
    where: { completed: true, userId },
  })

  const longestSession = sessions.length
    ? Math.max(...sessions.map((s) => s.duration))
    : 0

  const topicMap = new Map<string, { topicId: string; topicName: string; emoji: string; totalSeconds: number }>()
  const dayTotalMap = new Map<string, number>()
  for (const s of sessions) {
    const existing = topicMap.get(s.topicId)
    if (existing) {
      existing.totalSeconds += s.duration
    } else {
      topicMap.set(s.topicId, {
        topicId: s.topicId,
        topicName: s.topic.name,
        emoji: s.topic.emoji,
        totalSeconds: s.duration,
      })
    }
    const key = dayKey(s.startTime)
    dayTotalMap.set(key, (dayTotalMap.get(key) ?? 0) + s.duration)
  }

  let topTopic = null
  let maxSeconds = 0
  for (const t of topicMap.values()) {
    if (t.totalSeconds > maxSeconds) {
      maxSeconds = t.totalSeconds
      topTopic = t
    }
  }

  const dailyBreakdown = dailyRange.map((d) => {
    const pad = (n: number) => String(n).padStart(2, '0')
    const label = periodStr === 'weekly'
      ? PERSIAN_WEEKDAYS[(d.getDay() + 1) % 7]
      : String(toJalali(d).day)
    return {
      date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      label,
      totalSeconds: dayTotalMap.get(dayKey(d)) ?? 0,
    }
  })

  res.json({
    summary: {
      totalHours,
      totalSessions: sessions.length,
      topTopic: topTopic ? `${topTopic.emoji} ${topTopic.topicName}` : '—',
      longestSession,
      tasksCompleted,
    },
    breakdowns: Array.from(topicMap.values()),
    dailyBreakdown,
  })
})
