import React, { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Criancas from './pages/Criancas'
import Funcionarios from './pages/Funcionarios'
import FolhaSalarial from './pages/FolhaSalarial'
import Relatorios from './pages/Relatorios'
import Configuracoes from './pages/Configuracoes'
import Usuarios from './pages/Usuarios'

const queryClient = new QueryClient()

function AppContent() {
  const [session, setSession] = useState(null)
  const [role, setRole] = useState('educador')
  const [activePage, setActivePage] = useState('dashboard')
  const [carregandoAuth, setCarregandoAuth] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setCarregandoAuth(false)
      if (session) fetchUserRole(session.user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setCarregandoAuth(false)
      if (event === 'SIGNED_IN' && session) fetchUserRole(session.user)
      if (event === 'SIGNED_OUT') { setRole('educador'); setActivePage('dashboard') }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserRole = async (user) => {
    try {
      if (user.email === 'admin@teucentro.com' || user.email === 'admin@origem.sljr') {
        setRole('admin'); return
      }
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      setRole(data?.role || 'educador')
    } catch (e) { setRole('educador') }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setRole('educador')
    setActivePage('dashboard')
  }

  if (carregandoAuth) return <div style={{minHeight:'100vh',background:'#0f172a',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff'}}><h1>A iniciar...</h1></div>
  if (!session) return <Login />

  // ✅ RESTRIÇÃO ESTRITA DE PERMISSÕES
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', roles: ['admin','educador'] },
    { id: 'criancas', label: 'Crianças', icon: '👶', roles: ['admin','educador'] },
    { id: 'relatorios', label: 'Relatórios', icon: '', roles: ['admin','educador'] },
    // 👇 Apenas Admin
    { id: 'funcionarios', label: 'Funcionários', icon: '👥', roles: ['admin'] },
    { id: 'folha_salarial', label: 'Folha Salarial', icon: '💰', roles: ['admin'] },
    { id: 'configuracoes', label: 'Configurações', icon: '⚙️', roles: ['admin'] },
    { id: 'usuarios', label: 'Utilizadores', icon: '🔐', roles: ['admin'] },
  ]

  const visibleMenu = menuItems.filter(item => item.roles.includes(role))

  const renderPage = () => {
    // Proteção extra: se educador tentar aceder a rota admin via URL
    if (role === 'educador' && ['funcionarios','folha_salarial','configuracoes','usuarios'].includes(activePage)) {
      setActivePage('dashboard')
      return <Dashboard />
    }
    switch(activePage) {
      case 'dashboard': return <Dashboard />
      case 'criancas': return <Criancas />
      case 'funcionarios': return <Funcionarios />
      case 'folha_salarial': return <FolhaSalarial />
      case 'relatorios': return <Relatorios role={role} />
      case 'configuracoes': return <Configuracoes />
      case 'usuarios': return <Usuarios />
      default: return <Dashboard />
    }
  }

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#e2e8f0',display:'flex'}}>
      <aside style={{width:240,background:'#1e293b',borderRight:'1px solid #334155',display:'flex',flexDirection:'column'}}>
        <div style={{padding:20,borderBottom:'1px solid #334155'}}>
          <h1 style={{fontSize:17,fontWeight:'bold',margin:'0 0 12px',color:'#6366f1'}}>Origem Creative</h1>
          <div style={{padding:'6px 10px',background:'#0f172a',border:'1px solid #475569',borderRadius:6,color:'#fff',fontSize:12,textAlign:'center',fontWeight:500}}>
            {role === 'admin' ? ' Administrador' : '👨‍🏫 Educador'}
          </div>
        </div>
        <nav style={{flex:1,padding:'16px 0'}}>
          {visibleMenu.map(item => (
            <button key={item.id} onClick={()=>setActivePage(item.id)} style={{width:'100%',padding:'11px 20px',background:activePage===item.id?'#6366f1':'transparent',color:activePage===item.id?'#fff':'#94a3b8',border:'none',textAlign:'left',cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',gap:10}}>
              <span>{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div style={{padding:16,borderTop:'1px solid #334155'}}>
          <button onClick={handleLogout} style={{width:'100%',padding:10,background:'#ef444415',color:'#ef4444',border:'1px solid #ef444430',borderRadius:6,cursor:'pointer',fontWeight:500,fontSize:13}}> Terminar Sessão</button>
        </div>
      </aside>
      <main style={{flex:1,padding:24,overflowY:'auto',maxHeight:'100vh'}}>{renderPage()}</main>
    </div>
  )
}

export default function App() {
  return <QueryClientProvider client={queryClient}><AppContent /><Toaster position="top-right" /></QueryClientProvider>
}
