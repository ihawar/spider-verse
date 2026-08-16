import { secondsToHM } from '../../utils/formatTime'

interface Breakdown {
  topicId: string
  topicName: string
  emoji: string
  totalSeconds: number
}

interface Props {
  totalToday: number
  breakdowns: Breakdown[]
}

export default function TodayProgress({ totalToday, breakdowns }: Props) {

  if (totalToday === 0) return null

  const totalHours = Math.floor(totalToday / 3600)
  const totalMinutes = Math.round((totalToday % 3600) / 60)

  return (
    <div className="pt-4 mt-4 border-t border-[var(--color-zinc-750)]">
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-2xl font-bold text-white tabular-nums">
          {totalHours}h {totalMinutes}m
        </span>
        <span className="text-zinc-500 text-sm">focused today</span>
      </div>

      <div className="space-y-3">
        {breakdowns.map((b) => {
          const pct = totalToday > 0 ? Math.round((b.totalSeconds / totalToday) * 100) : 0
          return (
            <div key={b.topicId}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-zinc-300 text-sm flex items-center gap-1.5">
                  <span>{b.emoji}</span> {b.topicName}
                </span>
                <span className="text-zinc-400 text-xs font-mono">
                  {secondsToHM(b.totalSeconds)} ({pct}%)
                </span>
              </div>
              <div className="w-full h-1.5 bg-[var(--color-zinc-750)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    background: `var(--color-spider-red)`,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
