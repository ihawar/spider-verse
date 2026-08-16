import { useState, useRef, useCallback, useEffect } from 'react'
import { secondsToHMS } from '../utils/formatTime'

export function useTimer() {
  const [baseSeconds, setBaseSeconds] = useState(0)
  const [runStartedAt, setRunStartedAt] = useState<number | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [, setTick] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const baseRef = useRef(0)
  const runStartedAtRef = useRef<number | null>(null)
  baseRef.current = baseSeconds
  runStartedAtRef.current = runStartedAt

  const seconds = baseSeconds + (runStartedAt != null ? Math.floor((Date.now() - runStartedAt) / 1000) : 0)

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const startTicking = useCallback(() => {
    if (intervalRef.current) return
    intervalRef.current = setInterval(() => {
      setTick((t) => t + 1)
    }, 1000)
  }, [])

  const start = useCallback(() => {
    if (intervalRef.current) return
    setBaseSeconds(0)
    setIsRunning(true)
    setIsPaused(false)
    setRunStartedAt(Date.now())
    startTicking()
  }, [startTicking])

  const pause = useCallback(() => {
    if (runStartedAtRef.current != null) {
      const now = Date.now()
      setBaseSeconds((b) => b + Math.floor((now - (runStartedAtRef.current as number)) / 1000))
    }
    stopInterval()
    setRunStartedAt(null)
    setIsPaused(true)
  }, [stopInterval])

  const resume = useCallback(() => {
    if (intervalRef.current) return
    setIsPaused(false)
    setRunStartedAt(Date.now())
    startTicking()
  }, [startTicking])

  const reset = useCallback(() => {
    stopInterval()
    setBaseSeconds(0)
    setRunStartedAt(null)
    setIsRunning(false)
    setIsPaused(false)
  }, [stopInterval])

  const restore = useCallback((state: { baseSeconds: number; runStartedAt: number | null }) => {
    setBaseSeconds(state.baseSeconds)
    setRunStartedAt(state.runStartedAt)
    setIsRunning(state.runStartedAt != null)
    setIsPaused(state.runStartedAt == null)
    if (state.runStartedAt != null) startTicking()
  }, [startTicking])

  useEffect(() => stopInterval, [stopInterval])

  return {
    seconds,
    baseSeconds,
    runStartedAt,
    isRunning,
    isPaused,
    formattedTime: secondsToHMS(seconds),
    start,
    pause,
    resume,
    reset,
    restore,
  }
}
