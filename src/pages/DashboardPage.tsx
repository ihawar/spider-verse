import { useState, useEffect, useCallback } from 'react'
import type { Topic, Session, PomodoroSettings as PomodoroSettingsType } from '../types'
import { useApi } from '../hooks/useApi'
import FigureDisplay from '../components/Dashboard/FigureDisplay'
import FocusLauncher from '../components/Dashboard/FocusLauncher'
import PomodoroSettings from '../components/Dashboard/PomodoroSettings'
import TodayProgress from '../components/Dashboard/TodayProgress'
import FocusOverlay from '../components/FocusMode/FocusOverlay'
import TopicCards from '../components/Topics/TopicCards'
import TaskList from '../components/Topics/TaskList'

const DEFAULT_POMODORO: PomodoroSettingsType = {
  pomodoroEnabled: false,
  pomodoroFocusMinutes: 25,
  pomodoroBreakMinutes: 5,
}

function getTodayRange() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
}

export default function DashboardPage() {
  const api = useApi()
  const [topics, setTopics] = useState<Topic[]>([])
  const [todaySessions, setTodaySessions] = useState<Session[]>([])
  const [focusTopicId, setFocusTopicId] = useState<string | null>(null)
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [pomodoroSettings, setPomodoroSettings] = useState<PomodoroSettingsType>(DEFAULT_POMODORO)

  const fetchData = useCallback(async () => {
    try {
      const [t, s, settings] = await Promise.all([
        api.get('/topics'),
        api.get(`/sessions?startDate=${getTodayRange()}`),
        api.get<PomodoroSettingsType>('/settings'),
      ])
      setTopics(t)
      setTodaySessions(s)
      setPomodoroSettings(settings)
    } catch {
      // errors handled in hook
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [refreshKey])

  const focusTopic = topics.find((t) => t.id === focusTopicId)

  if (focusTopicId && focusTopic) {
    return (
      <FocusOverlay
        topic={focusTopic}
        pomodoroSettings={pomodoroSettings}
        onFinish={() => {
          setFocusTopicId(null)
          setRefreshKey((k) => k + 1)
        }}
      />
    )
  }

  const breakdownMap = new Map<string, { topicId: string; topicName: string; emoji: string; totalSeconds: number }>()
  for (const s of todaySessions) {
    const existing = breakdownMap.get(s.topicId)
    if (existing) {
      existing.totalSeconds += s.duration
    } else {
      breakdownMap.set(s.topicId, {
        topicId: s.topicId,
        topicName: s.topic.name,
        emoji: s.topic.emoji,
        totalSeconds: s.duration,
      })
    }
  }

  const breakdowns = Array.from(breakdownMap.values())
  const totalToday = breakdowns.reduce((sum, b) => sum + b.totalSeconds, 0)


  const selectedTopic = topics.find((t) => t.id === selectedTopicId) || null

  return (
    <div className="flex gap-6 h-[calc(100vh-3rem)]">
      {/* Left: Spider Figure */}
      <div className="w-[45%] flex-shrink-0">
        <FigureDisplay />
      </div>

      {/* Right: Two boxes, 50/50 height */}
      <div className="flex-1 flex flex-col gap-5 min-w-0">
        {/* Top Box: Focus Session */}
        <div className="flex-1 bg-[var(--color-zinc-850)] border border-[var(--color-zinc-750)] rounded-xl p-6 overflow-y-auto min-h-0">
          <h2 className="text-sm font-semibold text-white mb-4">Start a Focus Session</h2>
          <FocusLauncher topics={topics} onStart={setFocusTopicId} />
          <PomodoroSettings settings={pomodoroSettings} onUpdate={setPomodoroSettings} />
          <TodayProgress totalToday={totalToday} breakdowns={breakdowns} />
        </div>

        {/* Bottom Box: Topics & Tasks */}
        <div className="flex-1 bg-[var(--color-zinc-850)] border border-[var(--color-zinc-750)] rounded-xl p-6 overflow-y-auto min-h-0">
          {selectedTopic ? (
            <TaskList
              topic={selectedTopic}
              onBack={() => setSelectedTopicId(null)}
            />
          ) : (
            <TopicCards
              topics={topics}
              onRefresh={() => setRefreshKey((k) => k + 1)}
              onSelectTopic={setSelectedTopicId}
            />
          )}
        </div>
      </div>
    </div>
  )
}
