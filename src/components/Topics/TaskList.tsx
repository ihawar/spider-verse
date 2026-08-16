import { useState, useEffect, useCallback } from 'react'
import type { Task, Topic } from '../../types'
import { Plus, Check, Trash2, ArrowLeft } from 'lucide-react'
import { useApi } from '../../hooks/useApi'

interface Props {
  topic: Topic
  onBack: () => void
}

export default function TaskList({ topic, onBack }: Props) {
  const api = useApi()
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchTasks = useCallback(async () => {
    try {
      const data = await api.get<Task[]>(`/tasks?topicId=${topic.id}`)
      setTasks(data)
    } catch {
      // handled
    }
  }, [topic.id, refreshKey])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleAdd = async () => {
    if (!newTitle.trim()) return
    try {
      await api.post('/tasks', { title: newTitle.trim(), topicId: topic.id })
      setNewTitle('')
      setRefreshKey((k) => k + 1)
    } catch {
      // handled
    }
  }

  const handleToggle = async (task: Task) => {
    try {
      await api.put(`/tasks/${task.id}`, { completed: !task.completed })
      setRefreshKey((k) => k + 1)
    } catch {
      // handled
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.del(`/tasks/${id}`)
      setRefreshKey((k) => k + 1)
    } catch {
      // handled
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-[var(--color-zinc-750)] transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-base font-semibold text-white flex items-center gap-1.5">
          <span>{topic.emoji}</span> {topic.name} — Tasks
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Add a new task..."
          className="flex-1 px-4 py-2.5 rounded-lg bg-[var(--color-zinc-750)] border border-[var(--color-zinc-650)] text-white text-sm focus:outline-none focus:border-[var(--color-spider-red)] transition-colors"
        />
        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[var(--color-spider-red)] text-white text-sm font-semibold hover:opacity-90 transition-all"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      <div className="space-y-1 max-h-64 overflow-y-auto">
        {tasks.length === 0 && (
          <p className="text-zinc-600 text-sm text-center py-6">No tasks yet for this topic</p>
        )}
        {[...tasks].sort((a, b) => Number(a.completed) - Number(b.completed)).map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 px-3 py-2.5 bg-[var(--color-zinc-750)]/50 border border-[var(--color-zinc-750)] rounded-xl group hover:border-[var(--color-zinc-650)] transition-all"
          >
            <button
              onClick={() => handleToggle(task)}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                task.completed
                  ? 'bg-[var(--color-spider-red)] border-[var(--color-spider-red)]'
                  : 'border-zinc-600'
              }`}
            >
              {task.completed && <Check size={12} className="text-white" />}
            </button>
            <span
              className={`text-sm flex-1 ${
                task.completed ? 'text-zinc-500 line-through' : 'text-zinc-300'
              }`}
            >
              {task.title}
            </span>
            <button
              onClick={() => handleDelete(task.id)}
              className="p-1 rounded text-zinc-600 hover:text-red-400 hover:bg-[var(--color-zinc-750)] opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
