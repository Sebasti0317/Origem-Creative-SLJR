import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import Login from '../pages/Login'
import { 
  Home, Users, Briefcase, Calculator, BarChart3, LogOut, Menu, X, 
  ChevronLeft, ChevronRight, Shield, Calendar, DollarSign, Package, 
  FileText, Settings, Bell, Search, CheckCircle2, AlertTriangle 
} from 'lucide-react'

export default function Layout({ children, activeTab, onNavigate }: { 
  children: React.ReactNode, 
  activeTab: string, 
  onNavigate: (tab: string) => void 
}) {
  const { user, role, loading, signOut, hasRole } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false)
      else setSidebarOpen(true)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-500/30 border-t-brand-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-medium">A carregar Origem Creative...</p>
        </div>
      </div>
    )
  }
  if (!user) return <Login />

  const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, roles: ['admin', 'coordenador', 'assistente'] },
  { id: 'criancas', label: 'Crianças', icon: Users, roles: ['admin', 'coordenador', 'assistente'] },
  { id: 'funcionarios', label: 'Funcionários', icon: Briefcase, roles: ['admin', 'coordenador'] },
  { id: 'folha', label: 'Folha Pagamento', icon: Calculator, roles: ['admin', 'coordenador'] },
  { id: 'presenca', label: 'Presença', icon: Calendar, roles: ['admin', 'coordenador', 'assistente'] },
  { id: 'inventario', label: 'Inventário', icon: Package, roles: ['admin', 'coordenador'] },
  { id: 'relatorios', label: 'Relatórios', icon: FileText, roles: ['admin', 'coordenador'] },
  { id: 'utilizadores', label: 'Gestão de Perfis', icon: Shield, roles: ['admin'] },
  { id: 'configuracoes', label: 'Configurações', icon: Settings, roles: ['admin'] }
]
  
  const filteredNav = navItems.filter(item => hasRole(item.roles as any))

  return (
    <div className="min-h-screen bg-dark-800 flex">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 
        bg-dark-900 border-r border-dark-700 
        transition-all duration-300 flex flex-col
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${sidebarOpen ? 'w-64' : 'w-20'}
      `}>
        {/* Logo */}
        <div className="p-5 flex items-center gap-3 border-b border-dark-700">
          <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-500/30">
            <span className="text-white font-bold text-lg">O</span>
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <span className="font-bold text-white whitespace-nowrap">ORIGEM CREATIVE</span>
              <span className="block text-xs text-slate-400 whitespace-nowrap">SLJR Management</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
          {filteredNav.map(item => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setMobileMenuOpen(false) }}
                className={`w-full sidebar-item ${isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'}`}
              >
                <Icon size={20} className="flex-shrink-0" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-dark-700 space-y-2">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="hidden lg:flex w-full items-center justify-center p-2 hover:bg-dark-700 rounded-lg text-slate-400 hover:text-white transition"
          >
            {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
          <button 
            onClick={signOut}
            className="w-full sidebar-item sidebar-item-inactive text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut size={20} className="flex-shrink-0" />
            {sidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Menu, Bell, LogOut } from 'lucide-react'
import { APP_CONFIG } from '../config/appConfig'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, role, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-dark-800 text-slate-200 flex">
      {/* Sidebar simplificada */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-dark-900 border-r border-dark-700 transform transition-transform duration-200 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 border-b border-dark-700 flex items-center gap-3">
          {APP_CONFIG.logo ? (
            <img src={APP_CONFIG.logo} alt="Logo" className="h-8 w-8 object-contain" />
          ) : (
            <div className="h-8 w-8 bg-brand-500 rounded-lg flex items-center justify-center font-bold text-white">OC</div>
          )}
          <span className="font-bold text-white text-sm truncate">{APP_CONFIG.name}</span>
        </div>
        {/* ... mantém o resto do teu menu de navegação igual ... */}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-dark-900/50 backdrop-blur border-b border-dark-700 flex items-center justify-between px-4 sticky top-0 z-30">
          <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu size={20} />
          </button>
          
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-dark-700 rounded-lg"><Bell size={18} /></button>
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

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}