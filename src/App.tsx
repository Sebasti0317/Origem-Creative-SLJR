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
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        if (session) await fetchUserRole(session.user)
      } catch (err) {
        // ✅ SE O TOKEN ESTIVER CORROMPIDO, LIMPA E FORÇA LOGIN
        console.warn('Sessão inválida, a limpar...', err)
        await supabase.auth.signOut()
      } finally {
        setCarregandoAuth(false)
      }
    }
    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      if (event === 'SIGNED_IN' && session) await fetchUserRole(session.user)
      if (event === 'SIGNED_OUT') { setRole('educador'); setCarregandoAuth(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserRole = async (user) => {
    try {
      //  EMERGÊNCIA: Força admin se o email bater (substitui pelo teu)
      if (user.email === 'admin@teucentro.com') {
        setRole('admin')
        return
      }
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (data?.role) setRole(data.role)
      else setRole('educador')
    } catch (e) { setRole('educador') }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setRole('educador')
    setActivePage('dashboard')
  }

  if (carregandoAuth) return <div style={{minHeight:'100vh',background:'#0f172a',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff'}}><h1>A verificar sessão...</h1></div>
  if (!session) return <Login />

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', roles: ['admin','educador'] },
    { id: 'criancas', label: 'Crianças', icon: '👶', roles: ['admin','educador'] },
    { id: 'funcionarios', label: 'Funcionários', icon: '', roles: ['admin'] },
    { id: 'folha_salarial', label: 'Folha Salarial', icon: '', roles: ['admin'] },
    { id: 'relatorios', label: 'Relatórios', icon: '', roles: ['admin','educador'] },
    { id: 'configuracoes', label: 'Configurações', icon: '', roles: ['admin'] },
    { id: 'usuarios', label: 'Utilizadores', icon: '', roles: ['admin'] },
  ]

  const visibleMenu = menuItems.filter(item => item.roles.includes(role))

  const renderPage = () => {
    switch(activePage) {
      case 'dashboard': return <Dashboard />
      case 'criancas': return <Criancas />
      case 'funcionarios': return <Funcionarios />
      case 'folha_salarial': return <FolhaSalarial />
      case 'relatorios': return <Relatorios />
      case 'configuracoes': return <Configuracoes />
      case 'usuarios': return <Usuarios />
      default: return <Dashboard />
    }
  }

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#e2e8f0',display:'flex'}}>
      <aside style={{width:250,background:'#1e293b',borderRight:'1px solid #334155',display:'flex',flexDirection:'column'}}>
        <div style={{padding:20,borderBottom:'1px solid #334155'}}>
          <h1 style={{fontSize:18,fontWeight:'bold',margin:'0 0 15px',color:'#6366f1'}}>Origem Creative SLJR</h1>
          <div style={{fontSize:12,color:'#94a3b8',marginBottom:4}}>Sessão ativa como:</div>
          <div style={{padding:'6px 10px',background:'#0f172a',border:'1px solid #475569',borderRadius:6,color:'#fff',fontSize:13,textAlign:'center',fontWeight:500}}>
            {role === 'admin' ? '👑 Administrador' : '👨‍ Educador'}
          </div>
        </div>
        <nav style={{flex:1,padding:'20px 0'}}>
          {visibleMenu.map(item => (
            <button key={item.id} onClick={()=>setActivePage(item.id)} style={{width:'100%',padding:'12px 20px',background:activePage===item.id?'#6366f1':'transparent',color:activePage===item.id?'#fff':'#94a3b8',border:'none',textAlign:'left',cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',gap:12}}>
              <span>{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div style={{padding:20,borderTop:'1px solid #334155'}}>
          <button onClick={handleLogout} style={{width:'100%',padding:10,background:'#ef4444',color:'#fff',border:'none',borderRadius:6,cursor:'pointer',fontWeight:500}}>🚪 Sair</button>
        </div>
      </aside>
      <main style={{flex:1,padding:30,overflowY:'auto'}}>{renderPage()}</main>
    </div>
  )
}

export default function App() {
  return <QueryClientProvider client={queryClient}><AppContent /><Toaster position="top-right" /></QueryClientProvider>
}
