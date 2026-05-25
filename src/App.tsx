import React, { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Criancas from './pages/Criancas'
import Funcionarios from './pages/Funcionarios'
import FolhaSalarial from './pages/FolhaSalarial'
import Relatorios from './pages/Relatorios'
import Configuracoes from './pages/Configuracoes'

const queryClient = new QueryClient()

function AppContent() {
  const { user, loading, signOut } = useAuth()
  const [activePage, setActivePage] = useState('dashboard')
  
  // Estado do Perfil (Admin ou Educador)
  const [userRole, setUserRole] = useState<'admin' | 'educador'>('educador')
  
  // Carregar perfil guardado ao iniciar
  useEffect(() => {
    const savedRole = localStorage.getItem('user_role')
    if (savedRole === 'admin' || savedRole === 'educador') {
      setUserRole(savedRole)
    }
  }, [])

  // Guardar perfil sempre que mudar
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as 'admin' | 'educador'
    setUserRole(newRole)
    localStorage.setItem('user_role', newRole)
  }

  if (loading) return <div style={{minHeight:'100vh',background:'#0f172a',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff'}}><h1>A carregar...</h1></div>
  if (!user) return <Login />
  
  // Definição de permissões por módulo
  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', roles: ['admin', 'educador'] },
    { id: 'criancas', label: 'Crianças', icon: '👶', roles: ['admin', 'educador'] },
    { id: 'funcionarios', label: 'Funcionários', icon: '👥', roles: ['admin'] },
    { id: 'folha_salarial', label: 'Folha Salarial', icon: '', roles: ['admin'] },
    { id: 'relatorios', label: 'Relatórios', icon: '📈', roles: ['admin', 'educador'] },
    { id: 'configuracoes', label: 'Configurações', icon: '⚙️', roles: ['admin'] },
  ]
  
  // Filtrar menu conforme o perfil selecionado
  const menuItems = allMenuItems.filter(m => m.roles.includes(userRole))
  
  const renderPage = () => {
    switch(activePage) {
      case 'dashboard': return <Dashboard />
      case 'criancas': return <Criancas />
      case 'funcionarios': return <Funcionarios />
      case 'folha_salarial': return <FolhaSalarial />
      case 'relatorios': return <Relatorios />
      case 'configuracoes': return <Configuracoes />
      default: return <Dashboard />
    }
  }
  
  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#e2e8f0',display:'flex'}}>
      <aside style={{width:240,background:'#1e293b',borderRight:'1px solid #334155',padding:'20px 0',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
        <div>
          <div style={{padding:'0 20px 16px',borderBottom:'1px solid #334155',marginBottom:16}}>
            <h1 style={{fontSize:16,fontWeight:'bold',margin:'0 0 8px',color:'#6366f1'}}>Origem Creative SLJR</h1>
            
            {/* SELETOR DE PERFIL VISÍVEL */}
            <select 
              value={userRole} 
              onChange={handleRoleChange}
              style={{
                width:'100%',
                padding:'6px 8px',
                background:'#0f172a',
                border:'1px solid #475569',
                borderRadius:6,
                color:'#e2e8f0',
                fontSize:12,
                cursor:'pointer'
              }}
            >
              <option value="educador">👤 Educador Social</option>
              <option value="admin"> Administrador</option>
            </select>
          </div>
          
          <nav>
            {menuItems.map(item => (
              <button key={item.id} onClick={()=>setActivePage(item.id)} style={{
                width:'100%',padding:'10px 20px',background:activePage===item.id?'#6366f1':'transparent',
                color:activePage===item.id?'#fff':'#94a3b8',border:'none',textAlign:'left',cursor:'pointer',
                fontSize:14,display:'flex',alignItems:'center',gap:10,transition:'all 0.2s'
              }}
              onMouseEnter={e=>{if(activePage!==item.id){e.currentTarget.style.background='#334155';e.currentTarget.style.color='#e2e8f0'}}}
              onMouseLeave={e=>{if(activePage!==item.id){e.currentTarget.style.background='transparent';e.currentTarget.style.color='#94a3b8'}}}
              >
                <span>{item.icon}</span><span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div style={{padding:'0 20px'}}>
          <button onClick={()=>signOut()} style={{width:'100%',padding:10,background:'#ef4444',color:'#fff',border:'none',borderRadius:6,cursor:'pointer',fontSize:13}}>Sair</button>
        </div>
      </aside>
      <main style={{flex:1,padding:24,overflowY:'auto'}}>{renderPage()}</main>
    </div>
  )
}

export default function App() {
  return <QueryClientProvider client={queryClient}><AppContent /><Toaster position="top-right" /></QueryClientProvider>
}
