import { useState, useEffect, type ReactNode } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useApi } from './hooks/useApi'
import Layout from './components/Layout/Layout'
import DashboardPage from './pages/DashboardPage'
import AnalyticsPage from './pages/AnalyticsPage'
import SessionLogsPage from './pages/SessionLogsPage'
import LoginPage from './pages/LoginPage'
import FocusOverlay from './components/FocusMode/FocusOverlay'
import { getActiveSession, clearActiveSession, type ActiveSessionSnapshot } from './utils/activeSession'
import type { Topic, PomodoroSettings } from './types'

interface PendingSession {
  snapshot: ActiveSessionSnapshot
  topic: Topic
  settings: PomodoroSettings
}

function SessionRecovery({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const api = useApi()
  const [pending, setPending] = useState<PendingSession | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    const snap = getActiveSession()
    if (!snap || snap.userId !== user.id) {
      setChecked(true)
      return
    }
    ;(async () => {
      try {
        const topics = await api.get<Topic[]>('/topics')
        const topic = topics.find((t) => t.id === snap.topicId)
        if (!topic) {
          clearActiveSession()
          return
        }
        const settings = await api.get<PomodoroSettings>('/settings')
        if (!cancelled) setPending({ snapshot: snap, topic, settings })
      } catch {
        // fall through to the normal app
      } finally {
        if (!cancelled) setChecked(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user])

  if (!checked) return null
  if (pending) {
    return (
      <FocusOverlay
        topic={pending.topic}
        pomodoroSettings={pending.settings}
        initialSnapshot={pending.snapshot}
        onFinish={() => setPending(null)}
      />
    )
  }
  return <>{children}</>
}

function ProtectedLayout() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return (
    <SessionRecovery>
      <Layout>
        <Outlet />
      </Layout>
    </SessionRecovery>
  )
}

export default function App() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/sessions" element={<SessionLogsPage />} />
      </Route>
    </Routes>
  )
}
