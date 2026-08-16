import path from 'node:path'
import { existsSync } from 'node:fs'
import express from 'express'
import cors from 'cors'
import { topicsRouter } from './routes/topics.js'
import { tasksRouter } from './routes/tasks.js'
import { sessionsRouter } from './routes/sessions.js'
import { analyticsRouter } from './routes/analytics.js'
import { settingsRouter } from './routes/settings.js'
import { authRouter } from './routes/auth.js'

const app = express()
const PORT = Number(process.env.PORT) || 3001

app.use(cors())
app.use(express.json())

app.use('/api/topics', topicsRouter)
app.use('/api/tasks', tasksRouter)
app.use('/api/sessions', sessionsRouter)
app.use('/api/analytics', analyticsRouter)
app.use('/api/settings', settingsRouter)
app.use('/api/auth', authRouter)

const distPath = path.join(process.cwd(), 'dist')
if (existsSync(path.join(distPath, 'index.html'))) {
  app.use(express.static(distPath))
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) return next()
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
