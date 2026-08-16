import { useState, useEffect, useCallback } from 'react'
import type { Analytics, Period } from '../types'
import { useApi } from '../hooks/useApi'
import MetricCards from '../components/Analytics/MetricCards'
import ChartView from '../components/Analytics/ChartView'
import DailyChart from '../components/Analytics/DailyChart'

export default function AnalyticsPage() {
  const api = useApi()
  const [period, setPeriod] = useState<Period>('weekly')
  const [data, setData] = useState<Analytics | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const result = await api.get<Analytics>(`/analytics?period=${period}`)
      setData(result)
    } catch {
      // handled
    }
  }, [period])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Analytics</h1>

      {data && (
        <>
          <MetricCards summary={data.summary} period={period} onPeriodChange={setPeriod} />
          <ChartView breakdowns={data.breakdowns} />
          {(period === 'weekly' || period === 'monthly') && (
            <DailyChart data={data.dailyBreakdown} />
          )}
        </>
      )}
    </div>
  )
}
