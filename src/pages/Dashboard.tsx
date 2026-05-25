import { useState, useEffect } from 'react'

export default function Dashboard() {
  const [stats, setStats] = useState({ criancas: 0, ativas: 0, saidas: 0, funcionarios: 0 })

  useEffect(() => {
    try {
      const criancas = JSON.parse(localStorage.getItem('criancas_db') || '[]')
      const funcionarios = JSON.parse(localStorage.getItem('funcionarios_db') || '[]')
      const ativas = criancas.filter((c: any) => !c.dataSaida).length
      const saidas = criancas.filter((c: any) => c.dataSaida).length
      setStats({ criancas: criancas.length, ativas, saidas, funcionarios: funcionarios.length })
    } catch (e) {
      setStats({ criancas: 0, ativas: 0, saidas: 0, funcionarios: 0 })
    }
  }, [])

  return (
    <div>
      <h2 style={{fontSize:28,fontWeight:'bold',marginBottom:24}}>Dashboard</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16,marginBottom:24}}>
        <div style={{background:'#1e293b',padding:20,borderRadius:12,border:'1px solid #334155'}}>
          <h3 style={{fontSize:14,color:'#94a3b8',margin:'0 0 8px'}}>Total Crianças</h3>
          <p style={{fontSize:32,fontWeight:'bold',color:'#6366f1',margin:0}}>{stats.criancas}</p>
        </div>
        <div style={{background:'#1e293b',padding:20,borderRadius:12,border:'1px solid #334155'}}>
          <h3 style={{fontSize:14,color:'#94a3b8',margin:'0 0 8px'}}>Ativas no Centro</h3>
          <p style={{fontSize:32,fontWeight:'bold',color:'#10b981',margin:0}}>{stats.ativas}</p>
        </div>
        <div style={{background:'#1e293b',padding:20,borderRadius:12,border:'1px solid #334155'}}>
          <h3 style={{fontSize:14,color:'#94a3b8',margin:'0 0 8px'>Com Saída Registada</h3>
          <p style={{fontSize:32,fontWeight:'bold',color:'#ef4444',margin:0}}>{stats.saidas}</p>
        </div>
        <div style={{background:'#1e293b',padding:20,borderRadius:12,border:'1px solid #334155'}}>
          <h3 style={{fontSize:14,color:'#94a3b8',margin:'0 0 8px}}>Funcionários</h3>
          <p style={{fontSize:32,fontWeight:'bold',color:'#f59e0b',margin:0}}>{stats.funcionarios}</p>
        </div>
      </div>
      <div style={{background:'#1e293b',padding:20,borderRadius:12,border:'1px solid #334155'}}>
        <h3 style={{fontSize:18,fontWeight:'bold',margin:'0 0 12px'}}>Bem-vindo ao Sistema</h3>
        <p style={{color:'#94a3b8',margin:0,lineHeight:1.6}}>Gestão centralizada de crianças, funcionários e finanças. Utiliza o menu lateral para navegar.</p>
      </div>
    </div>
  )
}
