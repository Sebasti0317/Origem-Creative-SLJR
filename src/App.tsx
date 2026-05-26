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
  
  // Estado da função (inicializa como educador)
  const [role, setRole] = useState('educador')

  // Ao carregar, verifica se há uma função guardada
  useEffect(() => {
    const savedRole = localStorage.getItem('user_role')
    if (savedRole) {
      setRole(savedRole)
    }
  }, [])

  // Função para mudar de perfil
  const mudarPerfil = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const novoPerfil = e.target.value
    setRole(novoPerfil)
    localStorage.setItem('user_role', novoPerfil)
    // Volta para o dashboard ao mudar de perfil
    setActivePage('dashboard') 
  }

  if (loading) return <div style={{minHeight:'100vh',background:'#0f172a',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff'}}><h1>A carregar...</h1></div>
  if (!user) return <Login />

  // LISTA COMPLETA DE MENU
  const menuCompleto = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', roles: ['admin', 'educador'] },
    { id: 'criancas', label: 'Crianças', icon: '👶', roles: ['admin', 'educador'] },
    { id: 'funcionarios', label: 'Funcionários', icon: '', roles: ['admin'] },
    { id: 'folha_salarial', label: 'Folha Salarial', icon: '', roles: ['admin'] },
    { id: 'relatorios', label: 'Relatórios', icon: '', roles: ['admin', 'educador'] },
    { id: 'configuracoes', label: 'Configurações', icon: '⚙️', roles: ['admin'] },
  ]

  // FILTRAR MENU CONFORME O PERFIL
  const menuVisivel = menuCompleto.filter(item => item.roles.includes(role))

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
      
      {/* BARRA LATERAL */}
      <aside style={{width:250,background:'#1e293b',borderRight:'1px solid #334155',display:'flex',flexDirection:'column'}}>
        
        {/* TOPO: TÍTULO E SELETOR */}
        <div style={{padding:20, borderBottom:'1px solid #334155'}}>
          <h1 style={{fontSize:18,fontWeight:'bold',margin:'0 0 15px',color:'#6366f1'}}>Origem Creative SLJR</h1>
          
          <label style={{fontSize:11,color:'#94a3b8',display:'block',marginBottom:4}}>Perfil Atual:</label>
          <select 
            value={role} 
            onChange={mudarPerfil}
            style={{
              width:'100%',
              padding:'8px',
              background:'#0f172a',
              border:'1px solid #475569',
              borderRadius:6,
              color:'#fff',
              fontWeight:'bold',
              cursor:'pointer'
            }}
          >
            <option value="educador">👤 Educador Social</option>
            <option value="admin">🔑 Administrador</option>
          </select>
          <p style={{fontSize:10,color:'#64748b',marginTop:6}}>Mudar perfil altera o menu.</p>
        </div>

        {/* MENU DE NAVEGAÇÃO */}
        <nav style={{flex:1,padding:'20px 0'}}>
          {menuVisivel.map(item => (
            <button 
              key={item.id} 
              onClick={()=>setActivePage(item.id)}
              style={{
                width:'100%',
                padding:'12px 20px',
                background:activePage===item.id?'#6366f1':'transparent',
                color:activePage===item.id?'#fff':'#94a3b8',
                border:'none',
                textAlign:'left',
                cursor:'pointer',
                fontSize:14,
                display:'flex',
                alignItems:'center',
                gap:12
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* BOTÃO SAIR */}
        <div style={{padding:20,borderTop:'1px solid #334155'}}>
          <button onClick={()=>signOut()} style={{width:'100%',padding:10,background:'#ef4444',color:'#fff',border:'none',borderRadius:6,cursor:'pointer',fontWeight:500}}>Sair da Conta</button>
        </div>

      </aside>

      {/* ÁREA PRINCIPAL */}
      <main style={{flex:1,padding:30,overflowY:'auto'}}>
        {renderPage()}
      </main>
    </div>
  )
}

export default function App() {
  return <QueryClientProvider client={queryClient}><AppContent /><Toaster position="top-right" /></QueryClientProvider>
}
