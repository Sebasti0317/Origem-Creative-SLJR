import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'

const queryClient = new QueryClient()

function AppContent() {
  const { user, loading, signOut } = useAuth()
  
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
  
  return (
    <div style={{minHeight: '100vh', background: '#0f172a', color: '#e2e8f0'}}>
      {/* Header */}
      <header style={{background: '#1e293b', padding: '16px 24px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h1 style={{fontSize: '20px', fontWeight: 'bold', margin: 0}}>Origem Creative SLJR</h1>
        <button 
          onClick={() => signOut()}
          style={{background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer'}}
        >
          Sair
        </button>
      </header>
      
      {/* Conteúdo */}
      <main style={{padding: '24px'}}>
        <h2 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '24px'}}>Dashboard</h2>
        
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '32px'}}>
          <div style={{background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155'}}>
            <h3 style={{fontSize: '16px', color: '#94a3b8', margin: '0 0 8px 0'}}>Crianças</h3>
            <p style={{fontSize: '32px', fontWeight: 'bold', color: '#6366f1', margin: 0}}>0</p>
          </div>
          
          <div style={{background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155'}}>
            <h3 style={{fontSize: '16px', color: '#94a3b8', margin: '0 0 8px 0'}}>Funcionários</h3>
            <p style={{fontSize: '32px', fontWeight: 'bold', color: '#6366f1', margin: 0}}>0</p>
          </div>
          
          <div style={{background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155'}}>
            <h3 style={{fontSize: '16px', color: '#94a3b8', margin: '0 0 8px 0'}}>Centro</h3>
            <p style={{fontSize: '16px', color: '#e2e8f0', margin: 0}}>Origem Creative SLJR</p>
          </div>
        </div>
        
        <div style={{background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155'}}>
          <h3 style={{fontSize: '18px', fontWeight: 'bold', margin: '0 0 16px 0'}}>Bem-vindo, {user.email}</h3>
          <p style={{color: '#94a3b8', margin: 0}}>Sistema de Gestão de Centro de Acolhimento</p>
        </div>
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
