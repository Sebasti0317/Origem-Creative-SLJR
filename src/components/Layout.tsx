import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Menu, LogOut, Home, Users } from 'lucide-react'
import { APP_CONFIG } from '../config/appConfig'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [active, setActive] = useState('dashboard')

  const nav = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'criancas', label: 'Crianças', icon: Users },
  ]

  return (
    <div className="min-h-screen bg-dark-800 text-slate-200 flex">
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-dark-900 border-r border-dark-700 transform transition-transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 border-b border-dark-700 flex items-center gap-3">
          <div className="h-8 w-8 bg-brand-500 rounded-lg flex items-center justify-center font-bold text-white">OC</div>
          <span className="font-bold text-white text-sm">{APP_CONFIG.name}</span>
        </div>
        <nav className="p-4 space-y-1">
          {nav.map((item) => {
            const Icon = item.icon
            return (
              <button key={item.id} onClick={() => { setActive(item.id); setMobileOpen(false) }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${active === item.id ? 'bg-brand-500 text-white' : 'text-slate-400 hover:bg-dark-700'}`}>
                <Icon size={18} />
                <span className="text-sm">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-dark-900/50 border-b border-dark-700 flex items-center justify-between px-4">
          <button className="lg:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}><Menu size={20} /></button>
          <button onClick={signOut} className="p-2 hover:bg-red-500/20 rounded-lg"><LogOut size={18} /></button>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}