import { useState, useEffect, useCallback } from 'react'
import type { Session, Topic } from '../types'
import { useApi } from '../hooks/useApi'
import SessionFilters from '../components/SessionLogs/SessionFilters'
import SessionTable from '../components/SessionLogs/SessionTable'
import EditSessionModal from '../components/SessionLogs/EditSessionModal'

export default function SessionLogsPage() {
  const api = useApi()
  const topicsApi = useApi()
  const [sessions, setSessions] = useState<Session[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [search, setSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchSessions = useCallback(async () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    const qs = params.toString()
    try {
      const data = await api.get<Session[]>(`/sessions${qs ? `?${qs}` : ''}`)
      setSessions(data)
    } catch {
      // handled
    }
  }, [search, startDate, endDate, refreshKey])

  useEffect(() => {
    fetchSessions()
    topicsApi.get<Topic[]>('/topics').then(setTopics).catch(() => {})
  }, [fetchSessions])

  const handleEdit = (session: Session) => setEditingSession(session)

  const handleSaveEdit = async (id: string, data: { topicId?: string; startTime?: string; endTime?: string }) => {
    try {
      await api.put(`/sessions/${id}`, data)
      setEditingSession(null)
      setRefreshKey((k) => k + 1)
    } catch {
      // handled
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.del(`/sessions/${id}`)
      setRefreshKey((k) => k + 1)
    } catch {
      // handled
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Session Logs</h1>

      <SessionFilters
        search={search}
        onSearchChange={setSearch}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
      />

      <div className="bg-[var(--color-zinc-850)] border border-[var(--color-zinc-750)] rounded-xl overflow-hidden">
        <SessionTable sessions={sessions} onEdit={handleEdit} onDelete={handleDelete} />
      </div>

      {editingSession && (
        <EditSessionModal
          session={editingSession}
          topics={topics}
          onSave={handleSaveEdit}
          onClose={() => setEditingSession(null)}
        />
      )}
    </div>
  )
}
