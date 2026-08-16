import { useSyncExternalStore } from 'react'

let count = 0
const listeners = new Set<() => void>()

function emit() {
  for (const fn of listeners) fn()
}

export function beginLoading(): void {
  count += 1
  emit()
}

export function endLoading(): void {
  count = Math.max(0, count - 1)
  emit()
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function getCount(): number {
  return count
}

export function useLoadingCount(): number {
  return useSyncExternalStore(subscribe, getCount)
}
