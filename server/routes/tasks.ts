import { Router } from 'express'
import { prisma } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

export const tasksRouter = Router()

tasksRouter.get('/', requireAuth, async (req, res) => {
  const { topicId } = req.query
  const where: Record<string, unknown> = { userId: req.user!.id }
  if (topicId) where.topicId = String(topicId)
  const tasks = await prisma.task.findMany({
    where,
    include: { topic: true },
    orderBy: { createdAt: 'desc' },
  })
  res.json(tasks)
})

tasksRouter.post('/', requireAuth, async (req, res) => {
  const { title, topicId } = req.body
  const topic = await prisma.topic.findFirst({ where: { id: topicId, userId: req.user!.id } })
  if (!topic) {
    res.status(404).json({ error: 'Topic not found' })
    return
  }
  const task = await prisma.task.create({
    data: { title, topicId, userId: req.user!.id },
  })
  res.json(task)
})

tasksRouter.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  const { title, completed } = req.body
  const existing = await prisma.task.findFirst({ where: { id, userId: req.user!.id } })
  if (!existing) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  const data: Record<string, unknown> = {}
  if (title !== undefined) data.title = title
  if (completed !== undefined) data.completed = completed
  const task = await prisma.task.update({ where: { id }, data })
  res.json(task)
})

tasksRouter.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  const existing = await prisma.task.findFirst({ where: { id, userId: req.user!.id } })
  if (!existing) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  await prisma.task.delete({ where: { id } })
  res.json({ success: true })
})
