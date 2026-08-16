import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { DailyBreakdown } from '../../types'
import { secondsToHours, secondsToHM, toPersianDate } from '../../utils/formatTime'

interface Props {
  data: DailyBreakdown[]
}

export default function DailyChart({ data }: Props) {
  const total = data.reduce((s, d) => s + d.totalSeconds, 0)
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-72 bg-[var(--color-zinc-850)] border border-[var(--color-zinc-750)] rounded-xl">
        <p className="text-zinc-500 text-sm">No data for this period</p>
      </div>
    )
  }

  const chartData = data.map((d) => ({ ...d, hours: secondsToHours(d.totalSeconds) }))

  return (
    <div className="bg-[var(--color-zinc-850)] border border-[var(--color-zinc-750)] rounded-xl p-5">
      <h3 className="text-white font-semibold text-sm mb-4">Focus by Day</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} barSize={data.length > 10 ? 18 : 40}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
          <XAxis dataKey="label" tick={{ fill: '#71717A', fontSize: 12 }} />
          <YAxis
            tick={{ fill: '#71717A', fontSize: 12 }}
            label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: '#71717A', fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            labelStyle={{ color: '#71717A', fontWeight: 600 }}
            formatter={(value) => [`${secondsToHM(Number(value) * 3600)}`, '']}
            labelFormatter={(label, payload) => {
              const entry = payload?.[0]?.payload as DailyBreakdown | undefined
              return entry ? toPersianDate(new Date(`${entry.date}T00:00:00`)) : label
            }}
          />
          <Bar dataKey="hours" fill="#e3363f" radius={[6, 6, 0, 0]} name="Focus Hours" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
