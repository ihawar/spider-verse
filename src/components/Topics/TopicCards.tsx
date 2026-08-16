import { useState } from 'react'
import type { Topic } from '../../types'
import { Pencil, Trash2, Plus, Check, X } from 'lucide-react'
import { useApi } from '../../hooks/useApi'

interface Props {
  topics: Topic[]
  onRefresh: () => void
  onSelectTopic: (id: string) => void
}

export default function TopicCards({ topics, onRefresh, onSelectTopic }: Props) {
  const api = useApi()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmoji, setEditEmoji] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('')

  const handleAdd = async () => {
    if (!newName.trim()) return
    try {
      await api.post('/topics', { name: newName.trim(), emoji: newEmoji || '📌' })
      setNewName('')
      setNewEmoji('')
      setShowAdd(false)
      onRefresh()
    } catch {
      // handled
    }
  }

  const handleEditStart = (topic: Topic) => {
    setEditingId(topic.id)
    setEditName(topic.name)
    setEditEmoji(topic.emoji)
  }

  const handleEditSave = async () => {
    if (!editingId || !editName.trim()) return
    try {
      await api.put(`/topics/${editingId}`, { name: editName.trim(), emoji: editEmoji || '📌' })
      setEditingId(null)
      onRefresh()
    } catch {
      // handled
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.del(`/topics/${id}`)
      onRefresh()
    } catch {
      // handled
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Topics</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--color-spider-red)] text-white text-sm font-semibold hover:opacity-90 transition-all"
        >
          <Plus size={16} />
          New Topic
        </button>
      </div>

      {showAdd && (
        <div className="flex items-center gap-3 p-4 bg-[var(--color-zinc-750)]/50 border border-[var(--color-zinc-650)] rounded-xl">
          <input
            value={newEmoji}
            onChange={(e) => setNewEmoji(e.target.value)}
            placeholder="📌"
            maxLength={4}
            className="w-14 px-2 py-2 rounded-lg bg-[var(--color-zinc-750)] border border-[var(--color-zinc-650)] text-white text-lg text-center focus:outline-none focus:border-[var(--color-spider-red)] transition-colors"
          />
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Topic name..."
            className="flex-1 px-3 py-2 rounded-lg bg-[var(--color-zinc-750)] border border-[var(--color-zinc-650)] text-white text-sm focus:outline-none focus:border-[var(--color-spider-red)] transition-colors"
          />
          <button onClick={handleAdd} className="p-2 rounded-lg text-emerald-400 hover:bg-[var(--color-zinc-750)] transition-colors">
            <Check size={18} />
          </button>
          <button onClick={() => setShowAdd(false)} className="p-2 rounded-lg text-zinc-500 hover:bg-[var(--color-zinc-750)] transition-colors">
            <X size={18} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="bg-[var(--color-zinc-750)]/50 border border-[var(--color-zinc-750)] rounded-xl p-3 hover:border-[var(--color-zinc-650)] transition-all cursor-pointer group"
            onClick={() => onSelectTopic(topic.id)}
          >
            {editingId === topic.id ? (
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <input
                  value={editEmoji}
                  onChange={(e) => setEditEmoji(e.target.value)}
                  placeholder="📌"
                  maxLength={4}
                  className="w-12 px-1 py-1.5 rounded-lg bg-[var(--color-zinc-750)] border border-[var(--color-zinc-650)] text-white text-lg text-center focus:outline-none"
                />
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleEditSave()}
                  className="flex-1 px-2 py-1.5 rounded-lg bg-[var(--color-zinc-750)] border border-[var(--color-zinc-650)] text-white text-sm focus:outline-none"
                />
                <button onClick={handleEditSave} className="p-1 rounded text-emerald-400 hover:bg-[var(--color-zinc-750)]">
                  <Check size={16} />
                </button>
                <button onClick={() => setEditingId(null)} className="p-1 rounded text-zinc-500 hover:bg-[var(--color-zinc-750)]">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-white text-sm font-medium flex items-center gap-1.5">
                  <span className="text-base">{topic.emoji}</span>
                  {topic.name}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditStart(topic)
                    }}
                    className="p-1 rounded text-zinc-500 hover:text-blue-400 hover:bg-[var(--color-zinc-750)] transition-colors"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(topic.id)
                    }}
                    className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-[var(--color-zinc-750)] transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {topics.length === 0 && !showAdd && (
          <p className="text-zinc-600 text-sm col-span-full text-center py-6">
            No topics yet. Create one to get started!
          </p>
        )}
      </div>
    </div>
  )
}
