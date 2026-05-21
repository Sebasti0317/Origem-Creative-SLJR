import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import Login from './pages/Login'
import CriancasList from './pages/CriancasList'
import CriancasForm from './pages/CriancasForm'
import FuncionariosList from './pages/FuncionariosList'
import FuncionariosForm from './pages/FuncionariosForm'
import FolhaCalculator from './pages/FolhaCalculator'
import Dashboard from './pages/Dashboard'
import UserManagement from './pages/UserManagement'
import Presenca from './pages/Presenca'
import Inventario from './pages/Inventario'
import Relatorios from './pages/Relatorios'
import Configuracoes from './pages/Configuracoes'

const queryClient = new QueryClient()
type Tab = 'dashboard' | 'criancas' | 'funcionarios' | 'folha' | 'presenca' | 'inventario' | 'relatorios' | 'utilizadores' | 'configuracoes'

function AppContent() {
  const { user, role, loading, signOut, hasRole } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [showForm, setShowForm] = useState(false)

  const canManage = hasRole(['admin', 'coordenador'])

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      
      case 'criancas':
        return (
          <>
            <CriancasList onAdd={() => canManage && setShowForm(true)} />
            {showForm && canManage && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <CriancasForm onCancel={() => setShowForm(false)} />
              </div>
            )}
          </>
        )
      
      case 'funcionarios':
        return (
          <>
            <FuncionariosList onAdd={() => canManage && setShowForm(true)} />
            {showForm && canManage && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <FuncionariosForm onCancel={() => setShowForm(false)} />
              </div>
            )}
          </>
        )
      
      case 'folha':
        return <FolhaCalculator />
      
      case 'presenca':
        return <Presenca />
      
      case 'inventario':
        return <Inventario />
      
      case 'relatorios':
        return <Relatorios />
      
      case 'utilizadores':
        return <UserManagement />
      
      case 'configuracoes':
        return <Configuracoes />
      
      default:
        return <Dashboard />
    }
  }

  return (
    <Layout activeTab={activeTab} onNavigate={setActiveTab}>
      {renderContent()}
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