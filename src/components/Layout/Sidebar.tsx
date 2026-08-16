import { useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  BarChart3,
  ListTodo,
  LogOut,
} from 'lucide-react'
import { playHover, playClick } from '../../utils/sounds'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/sessions', label: 'Session Logs', icon: ListTodo },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-[var(--color-void)] border-r border-[var(--color-zinc-750)] flex flex-col z-40">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[var(--color-zinc-750)]">
        <img src="/icon.png" alt="Spider-Verse" className="w-8 h-8 rounded-lg" />
        <span className="text-white text-sm font-bold tracking-wide">SPIDER-VERSE</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to
          return (
            <button
              key={item.to}
              onClick={() => {
                playClick()
                navigate(item.to)
              }}
              onMouseEnter={playHover}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-[var(--color-spider-red)] text-white font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-[var(--color-zinc-750)]'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-[var(--color-zinc-750)]">
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-8 h-8 rounded-full bg-[var(--color-spider-red)]/20 flex items-center justify-center text-[var(--color-spider-red)] font-bold text-sm flex-shrink-0">
            {(user?.username ?? '?')[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user?.username}</p>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-[var(--color-zinc-750)] transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
