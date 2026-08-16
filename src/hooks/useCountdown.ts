import { useState, useRef, useCallback, useEffect } from 'react'
import { secondsToHMS } from '../utils/formatTime'

export function useCountdown(initialSeconds: number, onComplete?: () => void) {
  const [remainingBase, setRemainingBase] = useState(initialSeconds)
  const [runStartedAt, setRunStartedAt] = useState<number | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [, setTick] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onCompleteRef = useRef(onComplete)
  const completedRef = useRef(false)
  const remainingBaseRef = useRef(initialSeconds)
  const runStartedAtRef = useRef<number | null>(null)
  onCompleteRef.current = onComplete
  remainingBaseRef.current = remainingBase
  runStartedAtRef.current = runStartedAt

  const remaining = runStartedAt != null
    ? Math.max(0, remainingBase - Math.floor((Date.now() - runStartedAt) / 1000))
    : remainingBase

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
    }, 500)
  }, [])

  const start = useCallback(() => {
    if (intervalRef.current) return
    completedRef.current = false
    setRunStartedAt(Date.now())
    setIsRunning(true)
    setIsPaused(false)
    startTicking()
  }, [startTicking])

  useEffect(() => {
    if (remaining === 0 && isRunning && !completedRef.current) {
      completedRef.current = true
      stopInterval()
      setRunStartedAt(null)
      setIsRunning(false)
      setIsPaused(false)
      onCompleteRef.current?.()
    }
  }, [remaining, isRunning, stopInterval])

  const pause = useCallback(() => {
    if (runStartedAtRef.current != null) {
      const now = Date.now()
      setRemainingBase((b) => Math.max(0, b - Math.floor((now - (runStartedAtRef.current as number)) / 1000)))
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

  const reset = useCallback((seconds = initialSeconds) => {
    stopInterval()
    completedRef.current = false
    setRemainingBase(seconds)
    setRunStartedAt(null)
    setIsRunning(false)
    setIsPaused(false)
  }, [initialSeconds, stopInterval])

  const restore = useCallback((state: { remainingBase: number; runStartedAt: number | null }) => {
    setRemainingBase(state.remainingBase)
    setRunStartedAt(state.runStartedAt)
    setIsRunning(state.runStartedAt != null)
    setIsPaused(state.runStartedAt == null)
    if (state.runStartedAt != null) startTicking()
  }, [startTicking])

  useEffect(() => stopInterval, [stopInterval])

  return {
    remaining,
    remainingBase,
    runStartedAt,
    isRunning,
    isPaused,
    formattedTime: secondsToHMS(remaining),
    start,
    pause,
    resume,
    reset,
    restore,
  }
}
