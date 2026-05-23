import React, { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Criancas from './pages/Criancas'
import Funcionarios from './pages/Funcionarios'

const queryClient = new QueryClient()

function AppContent() {
  const { user, loading, signOut } = useAuth()
  const [activePage, setActivePage] = useState('dashboard')
  
  if (loading) {
    return (
      <div style={{minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'}}>
        <h1>A carregar...</h1>
      </div>
    )
  }
  
  if (!user) {
    return <Login />
  }
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'criancas', label: 'Crianças', icon: '👶' },
    { id: 'funcionarios', label: 'Funcionários', icon: '👥' },
  ]
  
  const renderPage = () => {
    switch(activePage) {
      case 'dashboard': return <Dashboard />
      case 'criancas': return <Criancas />
      case 'funcionarios': return <Funcionarios />
      default: return <Dashboard />
    }
  }
  
  return (
    <div style={{minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', display: 'flex'}}>
      {/* Sidebar */}
      <aside style={{width: '250px', background: '#1e293b', borderRight: '1px solid #334155', padding: '24px 0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
        <div>
          <h1 style={{fontSize: '20px', fontWeight: 'bold', padding: '0 24px 24px', margin: 0, color: '#6366f1'}}>Origem Creative SLJR</h1>
          
          <nav>
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  background: activePage === item.id ? '#6366f1' : 'transparent',
                  color: activePage === item.id ? 'white' : '#94a3b8',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (activePage !== item.id) {
                    e.currentTarget.style.background = '#334155'
                    e.currentTarget.style.color = '#e2e8f0'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activePage !== item.id) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#94a3b8'
                  }
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <div style={{padding: '0 24px'}}>
          <button 
            onClick={() => signOut()}
            style={{
              width: '100%',
              padding: '12px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Sair
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main style={{flex: 1, padding: '32px', overflowY: 'auto'}}>
        {renderPage()}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster position="top-right" />
    </QueryClientProvider>
  )
}
