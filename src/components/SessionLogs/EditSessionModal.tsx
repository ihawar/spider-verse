import { useState } from 'react'
import type { Session, Topic } from '../../types'
import { X } from 'lucide-react'

interface Props {
  session: Session
  topics: Topic[]
  onSave: (id: string, data: { topicId?: string; startTime?: string; endTime?: string }) => void
  onClose: () => void
}

function toLocalDatetime(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function EditSessionModal({ session, topics, onSave, onClose }: Props) {
  const [topicId, setTopicId] = useState(session.topicId)
  const [startTime, setStartTime] = useState(toLocalDatetime(session.startTime))
  const [endTime, setEndTime] = useState(toLocalDatetime(session.endTime))

  const handleSave = () => {
    onSave(session.id, {
      topicId: topicId !== session.topicId ? topicId : undefined,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--color-zinc-850)] border border-[var(--color-zinc-750)] rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-semibold">Edit Session</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-[var(--color-zinc-750)] transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-zinc-500 text-xs mb-1.5">Topic</label>
            <select
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-zinc-750)] border border-[var(--color-zinc-650)] text-white text-sm focus:outline-none focus:border-[var(--color-spider-red)] transition-colors"
            >
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.emoji} {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-zinc-500 text-xs mb-1.5">Start Time</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-zinc-750)] border border-[var(--color-zinc-650)] text-white text-sm focus:outline-none focus:border-[var(--color-spider-red)] transition-colors"
            />
          </div>

          <div>
            <label className="block text-zinc-500 text-xs mb-1.5">End Time</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-zinc-750)] border border-[var(--color-zinc-650)] text-white text-sm focus:outline-none focus:border-[var(--color-spider-red)] transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg bg-[var(--color-zinc-750)] text-zinc-400 text-sm hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 rounded-lg bg-[var(--color-spider-red)] text-white text-sm font-semibold hover:opacity-90 transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
