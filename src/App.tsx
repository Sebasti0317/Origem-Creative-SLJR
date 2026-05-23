import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'

const queryClient = new QueryClient()

function AppContent() {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div style={{minHeight: '100vh', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'}}>
        <h1>A carregar...</h1>
      </div>
    )
  }
  
  if (!user) {
    return <Login />
  }
  
  return (
    <div style={{minHeight: '100vh', background: '#1e293b', padding: '20px', color: 'white'}}>
      <h1>✅ SUCESSO! Dashboard a funcionar!</h1>
      <p>Bem-vindo: {user.email}</p>
      <button onClick={() => window.location.reload()}>Recarregar</button>
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
