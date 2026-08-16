import { useState, useEffect } from 'react'
import type { PomodoroSettings } from '../../types'
import { useApi } from '../../hooks/useApi'
import { Timer } from 'lucide-react'

interface Props {
  settings: PomodoroSettings
  onUpdate: (s: PomodoroSettings) => void
}

export default function PomodoroSettings({ settings, onUpdate }: Props) {
  const api = useApi()
  const [enabled, setEnabled] = useState(settings.pomodoroEnabled)
  const [focusMinutes, setFocusMinutes] = useState(settings.pomodoroFocusMinutes)
  const [breakMinutes, setBreakMinutes] = useState(settings.pomodoroBreakMinutes)

  useEffect(() => {
    setEnabled(settings.pomodoroEnabled)
    setFocusMinutes(settings.pomodoroFocusMinutes)
    setBreakMinutes(settings.pomodoroBreakMinutes)
  }, [settings])

  const save = async (next: PomodoroSettings) => {
    try {
      const updated = await api.put<PomodoroSettings>('/settings', next)
      onUpdate(updated)
    } catch {
      // handled
    }
  }

  const handleToggle = () => {
    const next = { pomodoroEnabled: !enabled, pomodoroFocusMinutes: focusMinutes, pomodoroBreakMinutes: breakMinutes }
    setEnabled(next.pomodoroEnabled)
    save(next)
  }

  const handleFocusChange = (v: number) => {
    const clamped = Math.max(1, Math.floor(v || 1))
    setFocusMinutes(clamped)
    save({ pomodoroEnabled: enabled, pomodoroFocusMinutes: clamped, pomodoroBreakMinutes: breakMinutes })
  }

  const handleBreakChange = (v: number) => {
    const clamped = Math.max(1, Math.floor(v || 1))
    setBreakMinutes(clamped)
    save({ pomodoroEnabled: enabled, pomodoroFocusMinutes: focusMinutes, pomodoroBreakMinutes: clamped })
  }

  return (
    <div className="mt-4 pt-4 border-t border-[var(--color-zinc-750)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Timer size={16} className="text-[var(--color-spider-red)]" />
          <span className="text-sm text-white font-semibold">Pomodoro Mode</span>
        </div>
        <button
          onClick={handleToggle}
          aria-pressed={enabled}
          className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-[var(--color-spider-red)]' : 'bg-[var(--color-zinc-650)]'}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${enabled ? 'translate-x-5' : ''}`}
          />
        </button>
      </div>

      {enabled && (
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-500">Focus</label>
            <input
              type="number"
              min={1}
              value={focusMinutes}
              onChange={(e) => handleFocusChange(Number(e.target.value))}
              className="w-20 px-3 py-1.5 rounded-lg bg-[var(--color-zinc-750)] border border-[var(--color-zinc-650)] text-white text-sm focus:outline-none focus:border-[var(--color-spider-red)] transition-colors"
            />
            <span className="text-xs text-zinc-500">min</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-500">Break</label>
            <input
              type="number"
              min={1}
              value={breakMinutes}
              onChange={(e) => handleBreakChange(Number(e.target.value))}
              className="w-20 px-3 py-1.5 rounded-lg bg-[var(--color-zinc-750)] border border-[var(--color-zinc-650)] text-white text-sm focus:outline-none focus:border-[var(--color-spider-red)] transition-colors"
            />
            <span className="text-xs text-zinc-500">min</span>
          </div>
          <p className="text-xs text-zinc-600">Sessions cycle automatically, chime at each switch.</p>
        </div>
      )}
    </div>
  )
}
