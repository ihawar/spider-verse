import { useState, useRef, useCallback } from 'react'
import { useCountdown } from './useCountdown'

export type PomodoroPhase = 'focus' | 'break'

export interface FocusCompletion {
  duration: number
  startTime: string
  endTime: string
}

export interface PomodoroState {
  phase: PomodoroPhase
  waiting: boolean
  remainingBase: number
  phaseRunStartedAt: number | null
}

interface Options {
  focusSeconds: number
  breakSeconds: number
  onFocusComplete: (info: FocusCompletion) => void
  onBreakComplete: () => void
}

export function usePomodoro({ focusSeconds, breakSeconds, onFocusComplete, onBreakComplete }: Options) {
  const [phase, setPhase] = useState<PomodoroPhase>('focus')
  const [waiting, setWaiting] = useState(false)
  const phaseRef = useRef<PomodoroPhase>('focus')
  const waitingRef = useRef(false)
  const focusStartRef = useRef<number>(Date.now())

  const onFocusCompleteRef = useRef(onFocusComplete)
  const onBreakCompleteRef = useRef(onBreakComplete)
  const focusSecondsRef = useRef(focusSeconds)
  const breakSecondsRef = useRef(breakSeconds)
  onFocusCompleteRef.current = onFocusComplete
  onBreakCompleteRef.current = onBreakComplete
  focusSecondsRef.current = focusSeconds
  breakSecondsRef.current = breakSeconds

  const handleCompleteRef = useRef<() => void>(() => {})
  const countdown = useCountdown(focusSeconds, () => handleCompleteRef.current())

  const handleComplete = useCallback(() => {
    if (waitingRef.current) return
    waitingRef.current = true
    setWaiting(true)
    if (phaseRef.current === 'focus') {
      const now = Date.now()
      onFocusCompleteRef.current({
        duration: focusSecondsRef.current,
        startTime: new Date(focusStartRef.current).toISOString(),
        endTime: new Date(now).toISOString(),
      })
    } else {
      onBreakCompleteRef.current()
    }
  }, [])

  handleCompleteRef.current = handleComplete

  const start = useCallback(() => {
    waitingRef.current = false
    setWaiting(false)
    phaseRef.current = 'focus'
    setPhase('focus')
    focusStartRef.current = Date.now()
    countdown.reset(focusSecondsRef.current)
    countdown.start()
  }, [countdown])

  const continuePhase = useCallback(() => {
    if (!waitingRef.current) return
    waitingRef.current = false
    setWaiting(false)
    if (phaseRef.current === 'focus') {
      phaseRef.current = 'break'
      setPhase('break')
      countdown.reset(breakSecondsRef.current)
      countdown.start()
    } else {
      phaseRef.current = 'focus'
      setPhase('focus')
      focusStartRef.current = Date.now()
      countdown.reset(focusSecondsRef.current)
      countdown.start()
    }
  }, [countdown])

  const restore = useCallback((state: PomodoroState) => {
    phaseRef.current = state.phase
    setPhase(state.phase)
    waitingRef.current = state.waiting
    setWaiting(state.waiting)
    if (state.phase === 'focus') {
      focusStartRef.current = Date.now() - (focusSecondsRef.current - state.remainingBase) * 1000
    }
    countdown.restore({ remainingBase: state.remainingBase, runStartedAt: state.phaseRunStartedAt })
  }, [countdown])

  const pause = countdown.pause
  const resume = countdown.resume

  return {
    phase,
    waiting,
    remaining: countdown.remaining,
    remainingBase: countdown.remainingBase,
    runStartedAt: countdown.runStartedAt,
    isRunning: countdown.isRunning,
    isPaused: countdown.isPaused,
    formattedTime: countdown.formattedTime,
    start,
    pause,
    resume,
    continuePhase,
    restore,
  }
}
