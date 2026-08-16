import { Search, Calendar } from 'lucide-react'

interface Props {
  search: string
  onSearchChange: (v: string) => void
  startDate: string
  onStartDateChange: (v: string) => void
  endDate: string
  onEndDateChange: (v: string) => void
}

export default function SessionFilters({
  search,
  onSearchChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 max-w-xs">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by topic name..."
          className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--color-zinc-850)] border border-[var(--color-zinc-750)] text-white text-sm focus:outline-none focus:border-[var(--color-spider-red)] transition-colors"
        />
      </div>

      <div className="flex items-center gap-2">
        <Calendar size={16} className="text-zinc-500" />
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="px-3 py-2 rounded-lg bg-[var(--color-zinc-850)] border border-[var(--color-zinc-750)] text-white text-sm focus:outline-none focus:border-[var(--color-spider-red)] transition-colors"
        />
        <span className="text-zinc-600 text-sm">to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="px-3 py-2 rounded-lg bg-[var(--color-zinc-850)] border border-[var(--color-zinc-750)] text-white text-sm focus:outline-none focus:border-[var(--color-spider-red)] transition-colors"
        />
      </div>
    </div>
  )
}
