import { Router } from 'express'
import { prisma } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

export const topicsRouter = Router()

topicsRouter.get('/', requireAuth, async (req, res) => {
  const topics = await prisma.topic.findMany({
    where: { userId: req.user!.id },
    include: { tasks: true, _count: { select: { sessions: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(topics)
})

topicsRouter.post('/', requireAuth, async (req, res) => {
  const { name, emoji } = req.body
  const topic = await prisma.topic.create({
    data: { name, emoji, userId: req.user!.id },
  })
  res.json(topic)
})

topicsRouter.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  const { name, emoji } = req.body
  const existing = await prisma.topic.findFirst({ where: { id, userId: req.user!.id } })
  if (!existing) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  const topic = await prisma.topic.update({ where: { id }, data: { name, emoji } })
  res.json(topic)
})

topicsRouter.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  const existing = await prisma.topic.findFirst({ where: { id, userId: req.user!.id } })
  if (!existing) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  await prisma.topic.delete({ where: { id } })
  res.json({ success: true })
})
