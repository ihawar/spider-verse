import type { Session } from '../../types'
import { formatTime, secondsToHM, toPersianDate } from '../../utils/formatTime'
import { Pencil, Trash2 } from 'lucide-react'

interface Props {
  sessions: Session[]
  onEdit: (s: Session) => void
  onDelete: (id: string) => void
}

export default function SessionTable({ sessions, onEdit, onDelete }: Props) {
  if (sessions.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-zinc-500 text-sm">
        No sessions found
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-zinc-750)] text-zinc-500 text-xs uppercase tracking-wider">
            <th className="text-left py-3 px-4">Date</th>
            <th className="text-left py-3 px-4">Topic</th>
            <th className="text-left py-3 px-4">Start</th>
            <th className="text-left py-3 px-4">End</th>
            <th className="text-left py-3 px-4">Duration</th>
            <th className="text-right py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr
              key={s.id}
              className="border-b border-[var(--color-zinc-750)]/50 hover:bg-[var(--color-zinc-850)] transition-colors"
            >
              <td className="py-3 px-4 text-zinc-300 whitespace-nowrap">{toPersianDate(new Date(s.startTime))}</td>
              <td className="py-3 px-4 text-zinc-300 whitespace-nowrap">
                {s.topic.emoji} {s.topic.name}
              </td>
              <td className="py-3 px-4 text-zinc-400 whitespace-nowrap">{formatTime(s.startTime)}</td>
              <td className="py-3 px-4 text-zinc-400 whitespace-nowrap">{formatTime(s.endTime)}</td>
              <td className="py-3 px-4 text-white font-mono whitespace-nowrap">{secondsToHM(s.duration)}</td>
              <td className="py-3 px-4 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => onEdit(s)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-400 hover:bg-[var(--color-zinc-750)] transition-colors"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => onDelete(s.id)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-[var(--color-zinc-750)] transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
