import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Menu, Bell, LogOut, Users, UserCheck, Home, Package, Settings } from 'lucide-react'
import { APP_CONFIG } from '../config/appConfig'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, role, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'criancas', label: 'Crianças', icon: Users },
    { id: 'funcionarios', label: 'Funcionários', icon: UserCheck },
    { id: 'folha', label: 'Folha Salarial', icon: Package },
    { id: 'presenca', label: 'Presenças', icon: UserCheck },
    { id: 'inventario', label: 'Inventário', icon: Package },
  ]

  return (
    <div className="min-h-screen bg-dark-800 text-slate-200 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-dark-900 border-r border-dark-700 transform transition-transform duration-200 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 border-b border-dark-700 flex items-center gap-3">
          {APP_CONFIG.logo ? (
            <img src={APP_CONFIG.logo} alt="Logo" className="h-8 w-8 object-contain" />
          ) : (
            <div className="h-8 w-8 bg-brand-500 rounded-lg flex items-center justify-center font-bold text-white">OC</div>
          )}
          <span className="font-bold text-white text-sm truncate">{APP_CONFIG.name}</span>
        </div>
        
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false) }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === item.id ? 'bg-brand-500 text-white' : 'text-slate-400 hover:bg-dark-700 hover:text-white'}`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-dark-900/50 backdrop-blur border-b border-dark-700 flex items-center justify-between px-4 sticky top-0 z-30">
          <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu size={20} />
          </button>
          
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-dark-700 rounded-lg">
              <Bell size={18} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center text-sm font-bold">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <button onClick={() => signOut()} className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>
        
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}