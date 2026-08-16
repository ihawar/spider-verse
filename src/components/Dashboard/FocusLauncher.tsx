import { useState } from 'react'
import type { Topic } from '../../types'
import { Play } from 'lucide-react'
import { playEnterFocus, playHover } from '../../utils/sounds'

interface Props {
  topics: Topic[]
  onStart: (topicId: string) => void
}

export default function FocusLauncher({ topics, onStart }: Props) {
  const [selectedId, setSelectedId] = useState('')

  const handleStart = () => {
    if (!selectedId) return
    playEnterFocus()
    onStart(selectedId)
  }

  return (
    <div className="flex items-center gap-3">
      <select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className="flex-1 px-4 py-3 rounded-lg bg-[var(--color-zinc-750)] border border-[var(--color-zinc-650)] text-white text-sm focus:outline-none focus:border-[var(--color-spider-red)] transition-colors appearance-none cursor-pointer"
      >
        <option value="" disabled>Select a topic...</option>
        {topics.map((t) => (
          <option key={t.id} value={t.id}>
            {t.emoji} {t.name}
          </option>
        ))}
      </select>
      <button
        disabled={!selectedId}
        onClick={handleStart}
        className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--color-spider-red)] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all whitespace-nowrap"
      >
        <Play size={18} />
        Enter Focus Mode
      </button>
    </div>
  )
}
