import type { ReactNode } from 'react'
import Sidebar from './Sidebar'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-void-deeper)] flex">
      <Sidebar />
      <main className="ml-56 flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  )
}
