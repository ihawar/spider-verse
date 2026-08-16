import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { AnalyticsBreakdown } from '../../types'
import { secondsToHours } from '../../utils/formatTime'

const COLORS = ['#e3363f', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316']

interface Props {
  breakdowns: AnalyticsBreakdown[]
}

export default function ChartView({ breakdowns }: Props) {
  if (breakdowns.length === 0) {
    return (
      <div className="flex items-center justify-center h-72 bg-[var(--color-zinc-850)] border border-[var(--color-zinc-750)] rounded-xl">
        <p className="text-zinc-500 text-sm">No data for this period</p>
      </div>
    )
  }

  const chartData = [
    {
      name: 'Focus Hours',
      ...Object.fromEntries(breakdowns.map((b) => [b.topicName, secondsToHours(b.totalSeconds)])),
    },
  ]

  return (
    <div className="bg-[var(--color-zinc-850)] border border-[var(--color-zinc-750)] rounded-xl p-5">
      <h3 className="text-white font-semibold text-sm mb-4">Focus Breakdown by Topic</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} barSize={48}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
          <XAxis dataKey="name" tick={{ fill: '#71717A', fontSize: 12 }} />
          <YAxis
            tick={{ fill: '#71717A', fontSize: 12 }}
            label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: '#71717A', fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            contentStyle={{
              backgroundColor: '#18181B',
              border: '1px solid #27272A',
              borderRadius: '12px',
              color: '#FAFAFA',
              fontSize: '13px',
              boxShadow: 'none',
            }}
            labelStyle={{ color: '#71717A', fontWeight: 600 }}
            formatter={(value: number) => [`${value}h`, '']}
          />
          <Legend wrapperStyle={{ fontSize: '12px', color: '#71717A' }} />
          {breakdowns.map((b, i) => (
            <Bar
              key={b.topicId}
              dataKey={b.topicName}
              fill={COLORS[i % COLORS.length]}
              radius={[6, 6, 0, 0]}
              name={`${b.emoji} ${b.topicName}`}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
