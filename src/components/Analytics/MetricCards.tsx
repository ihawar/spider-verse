import type { AnalyticsSummary, Period } from '../../types'
import { Clock, Zap, Trophy, CheckCircle2 } from 'lucide-react'

const tabs: { key: Period; label: string }[] = [
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'all', label: 'All-Time' },
]

interface Props {
  summary: AnalyticsSummary
  period: Period
  onPeriodChange: (p: Period) => void
}

export default function MetricCards({ summary, period, onPeriodChange }: Props) {
  const totalH = Math.floor(summary.totalHours)
  const totalM = Math.round((summary.totalHours - totalH) * 60)
  const focusValue = totalH > 0 && totalM > 0
    ? `${totalH}h ${totalM}m`
    : totalH > 0
      ? `${totalH}h`
      : `${totalM}m`

  const cards = [
    {
      label: 'Total Focus',
      value: focusValue,
      icon: Clock,
      color: 'text-blue-400',
    },
    {
      label: 'Sessions',
      value: String(summary.totalSessions),
      icon: Zap,
      color: 'text-[var(--color-spider-red)]',
    },
    {
      label: 'Top Topic',
      value: summary.topTopic,
      icon: Trophy,
      color: 'text-amber-400',
    },
    {
      label: 'Tasks Done',
      value: String(summary.tasksCompleted),
      icon: CheckCircle2,
      color: 'text-emerald-400',
    },
  ]

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => onPeriodChange(t.key)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              period === t.key
                ? 'bg-[var(--color-spider-red)] text-white'
                : 'bg-[var(--color-zinc-750)] text-zinc-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-[var(--color-zinc-850)] border border-[var(--color-zinc-750)] rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <card.icon size={18} className={card.color} />
              <span className="text-zinc-500 text-xs">{card.label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
