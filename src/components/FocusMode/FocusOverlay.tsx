import { useEffect, useState, useCallback, useRef } from 'react'
import { Pause, Play, Square, Check, Plus, Trash2 } from 'lucide-react'
import type { Topic, Task, Session, PomodoroSettings } from '../../types'
import { useTimer } from '../../hooks/useTimer'
import { usePomodoro, type FocusCompletion } from '../../hooks/usePomodoro'
import { useApi } from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import { secondsToHM } from '../../utils/formatTime'
import { playExitFocus, playAlertBeep } from '../../utils/sounds'
import { saveActiveSession, clearActiveSession, type ActiveSessionSnapshot } from '../../utils/activeSession'

interface Props {
  topic: Topic
  onFinish: () => void
  pomodoroSettings: PomodoroSettings
  initialSnapshot?: ActiveSessionSnapshot
}

function getTodayRange() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
}

export default function FocusOverlay({ topic, onFinish, pomodoroSettings, initialSnapshot }: Props) {
  const pomodoroEnabled = initialSnapshot ? initialSnapshot.mode === 'pomodoro' : pomodoroSettings.pomodoroEnabled
  const focusSeconds = pomodoroSettings.pomodoroFocusMinutes * 60
  const breakSeconds = pomodoroSettings.pomodoroBreakMinutes * 60

  const timer = useTimer()
  const api = useApi()
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [taskInput, setTaskInput] = useState('')
  const [todayBaseSeconds, setTodayBaseSeconds] = useState(0)
  const [completedFocusSeconds, setCompletedFocusSeconds] = useState(0)
  const [saving, setSaving] = useState(false)
  const finishedRef = useRef(false)

  const handleFocusComplete = useCallback((info: FocusCompletion) => {
    api.post('/sessions', {
      topicId: topic.id,
      startTime: info.startTime,
      endTime: info.endTime,
      duration: info.duration,
    }).catch(() => {})
    setCompletedFocusSeconds((s) => s + info.duration)
  }, [topic.id])

  const handleBreakComplete = useCallback(() => {
    // UI handled by the waiting panel
  }, [])

  const pomodoro = usePomodoro({
    focusSeconds,
    breakSeconds,
    onFocusComplete: handleFocusComplete,
    onBreakComplete: handleBreakComplete,
  })

  useEffect(() => {
    if (!pomodoroEnabled || !pomodoro.waiting) return
    playAlertBeep()
    const id = setInterval(playAlertBeep, 2000)
    return () => clearInterval(id)
  }, [pomodoroEnabled, pomodoro.waiting])

  const fetchTasks = useCallback(async () => {
    try {
      const data = await api.get<Task[]>(`/tasks?topicId=${topic.id}`)
      setTasks(data)
    } catch {
      // handled
    }
  }, [topic.id])

  useEffect(() => {
    fetchTasks()
    const loadToday = async () => {
      try {
        const sessions = await api.get<Session[]>(`/sessions?topicId=${topic.id}&startDate=${getTodayRange()}`)
        setTodayBaseSeconds(sessions.reduce((s, sess) => s + sess.duration, 0))
      } catch {
        // handled
      }
    }
    loadToday()
    if (initialSnapshot) {
      if (initialSnapshot.mode === 'pomodoro') {
        pomodoro.restore({
          phase: initialSnapshot.phase,
          waiting: initialSnapshot.waiting,
          remainingBase: initialSnapshot.remainingBase,
          phaseRunStartedAt: initialSnapshot.phaseRunStartedAt,
        })
      } else {
        timer.restore({ baseSeconds: initialSnapshot.baseSeconds, runStartedAt: initialSnapshot.runStartedAt })
      }
    } else if (pomodoroEnabled) {
      pomodoro.start()
    } else {
      timer.start()
    }
  }, [])

  useEffect(() => {
    if (!user || finishedRef.current) return
    const base = { userId: user.id, topicId: topic.id }
    if (pomodoroEnabled) {
      saveActiveSession({
        ...base,
        mode: 'pomodoro',
        phase: pomodoro.phase,
        waiting: pomodoro.waiting,
        remainingBase: pomodoro.remainingBase,
        phaseRunStartedAt: pomodoro.runStartedAt,
      })
    } else {
      saveActiveSession({
        ...base,
        mode: 'timer',
        baseSeconds: timer.baseSeconds,
        runStartedAt: timer.runStartedAt,
      })
    }
  }, [
    user,
    pomodoroEnabled,
    topic.id,
    pomodoro.phase,
    pomodoro.waiting,
    pomodoro.remainingBase,
    pomodoro.runStartedAt,
    timer.baseSeconds,
    timer.runStartedAt,
  ])

  const liveTotal = pomodoroEnabled
    ? todayBaseSeconds + completedFocusSeconds + (!pomodoro.waiting && pomodoro.phase === 'focus' ? Math.max(0, focusSeconds - pomodoro.remaining) : 0)
    : todayBaseSeconds + timer.seconds

  const handleFinish = async () => {
    if (saving) return
    finishedRef.current = true
    setSaving(true)
    playExitFocus()
    if (pomodoroEnabled) {
      if (!pomodoro.waiting) {
        const elapsed = pomodoro.phase === 'focus' ? Math.max(0, focusSeconds - pomodoro.remaining) : 0
        if (elapsed > 0) {
          const now = new Date()
          const startTime = new Date(now.getTime() - elapsed * 1000)
          try {
            await api.post('/sessions', {
              topicId: topic.id,
              startTime: startTime.toISOString(),
              endTime: now.toISOString(),
              duration: elapsed,
            })
          } catch {
            // handled
          }
        }
      }
    } else {
      timer.pause()
      const now = new Date()
      const startTime = new Date(now.getTime() - timer.seconds * 1000)
      try {
        await api.post('/sessions', {
          topicId: topic.id,
          startTime: startTime.toISOString(),
          endTime: now.toISOString(),
          duration: timer.seconds,
        })
      } catch {
        // handled
      }
      timer.reset()
    }
    clearActiveSession()
    onFinish()
  }

  const handleToggleTask = async (task: Task) => {
    try {
      const updated = await api.put<Task>(`/tasks/${task.id}`, { completed: !task.completed })
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)))
    } catch {
      // handled
    }
  }

  const handleAddTask = async () => {
    const title = taskInput.trim()
    if (!title) return
    try {
      const created = await api.post<Task>('/tasks', { title, topicId: topic.id })
      setTasks((prev) => [...prev, created])
      setTaskInput('')
    } catch {
      // handled
    }
  }

  const handleDeleteTask = async (id: string) => {
    try {
      await api.del(`/tasks/${id}`)
      setTasks((prev) => prev.filter((t) => t.id !== id))
    } catch {
      // handled
    }
  }

  const displayedTime = pomodoroEnabled ? pomodoro.formattedTime : timer.formattedTime
  const isPaused = pomodoroEnabled ? pomodoro.isPaused : timer.isPaused
  const handlePause = pomodoroEnabled ? pomodoro.pause : timer.pause
  const handleResume = pomodoroEnabled ? pomodoro.resume : timer.resume
  const waiting = pomodoroEnabled && pomodoro.waiting

  return (
    <div className="fixed inset-0 z-50 bg-[var(--color-void-deeper)] flex flex-col items-center justify-center overflow-hidden">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-5">
        <span className="text-zinc-500 text-sm">{pomodoroEnabled ? 'Pomodoro Mode' : 'Focus Mode'}</span>
        <button
          onClick={handleFinish}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-400 text-sm hover:bg-zinc-700 transition-colors"
        >
          <Square size={16} />
          {saving ? 'Saving...' : 'Finish Session'}
        </button>
      </div>

      {/* Center timer */}
      <div className="flex flex-col items-center gap-4">
        <span className="text-3xl">{topic.emoji}</span>
        <h1 className="text-zinc-400 text-lg font-semibold">{topic.name}</h1>

        {pomodoroEnabled && !waiting && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
              pomodoro.phase === 'focus'
                ? 'bg-[var(--color-spider-red)]/20 text-[var(--color-spider-red)]'
                : 'bg-emerald-500/20 text-emerald-400'
            }`}
          >
            {pomodoro.phase === 'focus' ? 'Focus' : 'Break'}
          </span>
        )}

        <p
          className="text-7xl font-bold text-white tracking-wider tabular-nums"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {displayedTime}
        </p>

        {!waiting && (
          <div className="flex items-center gap-4 mt-4">
            {!isPaused ? (
              <button
                onClick={handlePause}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-zinc-700 text-zinc-500 text-sm hover:border-zinc-500 hover:text-zinc-300 transition-all"
              >
                <Pause size={18} />
                Pause
              </button>
            ) : (
              <button
                onClick={handleResume}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[var(--color-spider-red)] text-white text-sm font-semibold hover:opacity-90 transition-all"
              >
                <Play size={18} />
                Resume
              </button>
            )}
          </div>
        )}

        <p className="text-white text-xl font-semibold mt-2 tabular-nums">
          Today: {secondsToHM(liveTotal)}
        </p>

        {pomodoroEnabled && !waiting && (
          <p className="text-zinc-600 text-xs">
            Focus {pomodoroSettings.pomodoroFocusMinutes}m · Break {pomodoroSettings.pomodoroBreakMinutes}m
          </p>
        )}
      </div>

      {/* Phase-complete waiting panel */}
      {waiting && (
        <>
          <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
          <div className="absolute z-50 flex flex-col items-center gap-6 bg-[var(--color-zinc-850)] border border-[var(--color-zinc-750)] rounded-2xl p-10 shadow-2xl">
            <p className="text-3xl font-bold text-white">
              {pomodoro.phase === 'focus' ? 'Focus complete!' : 'Break over!'}
            </p>
            <p className="text-zinc-400 text-base">
              {pomodoro.phase === 'focus' ? 'Time for a break.' : 'Ready for the next focus session?'}
            </p>
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={pomodoro.continuePhase}
                className="px-8 py-3 rounded-lg bg-[var(--color-spider-red)] text-white text-base font-semibold hover:opacity-90 transition-all"
              >
                {pomodoro.phase === 'focus' ? 'Start Break' : 'Start Next Focus'}
              </button>
              <button
                onClick={handleFinish}
                disabled={saving}
                className="px-8 py-3 rounded-lg bg-zinc-800 text-zinc-400 text-base hover:bg-zinc-700 hover:text-white transition-all"
              >
                End Session
              </button>
            </div>
          </div>
        </>
      )}

      {/* Task panel */}
      <div className="absolute right-8 top-24 bottom-24 w-80 bg-[var(--color-void)] border border-[var(--color-zinc-750)] rounded-2xl p-5 flex flex-col overflow-hidden">
        <h3 className="text-white font-semibold text-sm mb-4">Tasks</h3>

        <div className="flex gap-2 mb-4">
          <input
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            placeholder="Add a task..."
            className="flex-1 px-3 py-2 rounded-lg bg-[var(--color-zinc-750)] border border-[var(--color-zinc-650)] text-white text-xs focus:outline-none focus:border-[var(--color-spider-red)] transition-colors"
          />
          <button
            onClick={handleAddTask}
            className="p-2 rounded-lg bg-[var(--color-spider-red)] text-white hover:opacity-90 transition-all"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1">
          {tasks.length === 0 && (
            <p className="text-zinc-600 text-xs text-center py-8">No tasks yet</p>
          )}
          {[...tasks].sort((a, b) => Number(a.completed) - Number(b.completed)).map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-[var(--color-zinc-750)] group transition-colors"
            >
              <button
                onClick={() => handleToggleTask(task)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  task.completed
                    ? 'bg-[var(--color-spider-red)] border-[var(--color-spider-red)]'
                    : 'border-zinc-600'
                }`}
              >
                {task.completed && <Check size={12} className="text-white" />}
              </button>
              <span
                className={`text-sm flex-1 truncate ${
                  task.completed ? 'text-zinc-500 line-through' : 'text-zinc-300'
                }`}
              >
                {task.title}
              </span>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="p-1 rounded text-zinc-600 hover:text-red-400 hover:bg-[var(--color-zinc-650)] opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
