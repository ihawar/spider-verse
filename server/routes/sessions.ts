import { Router } from 'express'
import { prisma } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

export const sessionsRouter = Router()

sessionsRouter.get('/', requireAuth, async (req, res) => {
  const { topicId, startDate, endDate, search } = req.query

  const where: Record<string, unknown> = { userId: req.user!.id }
  if (topicId) where.topicId = String(topicId)
  if (startDate || endDate) {
    where.startTime = {} as Record<string, Date>
    if (startDate) (where.startTime as Record<string, Date>).gte = new Date(String(startDate))
    if (endDate) {
      const end = new Date(String(endDate))
      end.setHours(23, 59, 59, 999)
      ;(where.startTime as Record<string, Date>).lte = end
    }
  }
  if (search) {
    where.topic = { name: { contains: String(search) } }
  }

  const sessions = await prisma.session.findMany({
    where,
    include: { topic: true },
    orderBy: { startTime: 'desc' },
  })
  res.json(sessions)
})

sessionsRouter.post('/', requireAuth, async (req, res) => {
  const { topicId, startTime, endTime, duration } = req.body
  const topic = await prisma.topic.findFirst({ where: { id: topicId, userId: req.user!.id } })
  if (!topic) {
    res.status(404).json({ error: 'Topic not found' })
    return
  }
  const session = await prisma.session.create({
    data: {
      userId: req.user!.id,
      topicId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      duration,
    },
    include: { topic: true },
  })
  res.json(session)
})

sessionsRouter.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  const { topicId, startTime, endTime } = req.body

  const existing = await prisma.session.findFirst({ where: { id, userId: req.user!.id } })
  if (!existing) {
    res.status(404).json({ error: 'Not found' })
    return
  }

  const data: Record<string, unknown> = {}
  if (topicId) data.topicId = topicId
  if (startTime) data.startTime = new Date(startTime)
  if (endTime) data.endTime = new Date(endTime)

  if (startTime || endTime) {
    const s = startTime ? new Date(startTime) : existing.startTime
    const e = endTime ? new Date(endTime) : existing.endTime
    data.duration = Math.round((e.getTime() - s.getTime()) / 1000)
  }

  const session = await prisma.session.update({
    where: { id },
    data,
    include: { topic: true },
  })
  res.json(session)
})

sessionsRouter.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  const existing = await prisma.session.findFirst({ where: { id, userId: req.user!.id } })
  if (!existing) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  await prisma.session.delete({ where: { id } })
  res.json({ success: true })
})
