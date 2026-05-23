import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Criancas from './pages/Criancas'

const queryClient = new QueryClient()

function AppContent() {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-dark-800 flex items-center justify-center text-white">A carregar...</div>
  if (!user) return <Login />
  
  const pages: Record<string, React.ReactNode> = {
    dashboard: <Dashboard />,
    criancas: <Criancas />,
  }
  
  const [activePage] = React.useState('dashboard')
  
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