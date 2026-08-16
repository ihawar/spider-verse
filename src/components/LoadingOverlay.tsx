import { useEffect, useRef, useState } from 'react'
import { useLoadingCount } from '../utils/loading'

const DELAY_MS = 150

export default function LoadingOverlay() {
  const count = useLoadingCount()
  const loading = count > 0
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (loading) {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setVisible(true), DELAY_MS)
    } else {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = null
      setVisible(false)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [loading])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-14 h-14 rounded-full border-4 border-[var(--color-spider-red)] border-t-transparent animate-spin" />
      <p className="mt-4 text-zinc-400 text-sm">Loading...</p>
    </div>
  )
}
