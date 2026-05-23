import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

const queryClient = new QueryClient()

function AppContent() {
  // ✅ TODOS OS HOOKS NO TOPO, ANTES DE QUALQUER RETURN
  const { user, loading } = useAuth()
  const [activePage] = React.useState('dashboard')
  
  // ✅ Agora podes ter returns condicionais
  if (loading) return <div className="min-h-screen bg-dark-800 flex items-center justify-center text-white">A carregar...</div>
  if (!user) return <Login />
  
  const pages: Record<string, React.ReactNode> = {
    dashboard: <Dashboard />,
  }
  
  return (
    <Layout>
      {pages[activePage] || <Dashboard />}
    </Layout>
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
