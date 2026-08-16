export type ActiveSessionSnapshot =
  | {
      mode: 'timer'
      userId: string
      topicId: string
      baseSeconds: number
      runStartedAt: number | null
    }
  | {
      mode: 'pomodoro'
      userId: string
      topicId: string
      phase: 'focus' | 'break'
      waiting: boolean
      remainingBase: number
      phaseRunStartedAt: number | null
    }

const KEY = 'spiderverse.activeSession'

export function saveActiveSession(snapshot: ActiveSessionSnapshot): void {
  localStorage.setItem(KEY, JSON.stringify(snapshot))
}

export function getActiveSession(): ActiveSessionSnapshot | null {
  const raw = localStorage.getItem(KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as ActiveSessionSnapshot
  } catch {
    return null
  }
}

export function clearActiveSession(): void {
  localStorage.removeItem(KEY)
}

export function computeElapsed(baseSeconds: number, runStartedAt: number | null, now = Date.now()): number {
  return baseSeconds + (runStartedAt != null ? Math.floor((now - runStartedAt) / 1000) : 0)
}
