import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogIn, UserPlus } from 'lucide-react'

type Mode = 'login' | 'register'

export default function LoginPage() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError(null)
    try {
      if (mode === 'login') {
        await login(username, password)
      } else {
        await register(username, password)
      }
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-void-deeper)] flex flex-col items-center justify-center px-6">
      <div className="flex items-center gap-3 mb-8">
        <img src="/icon.png" alt="Spider-Verse" className="w-10 h-10 rounded-lg" />
        <span className="text-white text-xl font-bold tracking-wide">SPIDER-VERSE</span>
      </div>

      <div className="w-full max-w-sm bg-[var(--color-zinc-850)] border border-[var(--color-zinc-750)] rounded-2xl p-6 shadow-2xl">
        <div className="flex gap-2 mb-6">
          {(['login', 'register'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null) }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === m
                  ? 'bg-[var(--color-spider-red)] text-white'
                  : 'bg-[var(--color-zinc-750)] text-zinc-400 hover:text-white'
              }`}
            >
              {m === 'login' ? <LogIn size={16} /> : <UserPlus size={16} />}
              {m === 'login' ? 'Login' : 'Create Account'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-zinc-500 text-xs mb-1.5">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-zinc-750)] border border-[var(--color-zinc-650)] text-white text-sm focus:outline-none focus:border-[var(--color-spider-red)] transition-colors"
            />
          </div>

          <div>
            <label className="block text-zinc-500 text-xs mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-zinc-750)] border border-[var(--color-zinc-650)] text-white text-sm focus:outline-none focus:border-[var(--color-spider-red)] transition-colors"
            />
          </div>

          {mode === 'register' && (
            <p className="text-zinc-600 text-xs">Username: 3-32 chars · Password: at least 8 chars</p>
          )}

          {error && (
            <p className="text-red-400 text-xs bg-[var(--color-spider-red)]/10 border border-[var(--color-spider-red)]/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--color-spider-red)] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {mode === 'login' ? <LogIn size={16} /> : <UserPlus size={16} />}
            {submitting ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}
