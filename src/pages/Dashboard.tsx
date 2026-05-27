import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const [stats, setStats] = useState({ criancas: 0, ativas: 0, saidas: 0, funcionarios: 0, folhaTotal: 0 })
  const [carregando, setCarregando] = useState(true)
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(new Date().toLocaleTimeString('pt-PT'))

  useEffect(() => { carregarEstatisticas() }, [])

  const carregarEstatisticas = async () => {
    setCarregando(true)
    try {
      // 1. Crianças
      const { data: criancas } = await supabase.from('criancas').select('data_saida')
      const totalC = criancas?.length || 0
      const ativas = criancas?.filter(c => !c.data_saida).length || 0
      const saidas = criancas?.filter(c => c.data_saida).length || 0

      // 2. Funcionários
      const { count: totalF } = await supabase.from('funcionarios').select('*', { count: 'exact', head: true })

      // 3. Folha Salarial (Soma dos líquidos)
      const { data: folha } = await supabase.from('folha_salarial').select('salario_liquido')
      const totalFolha = folha?.reduce((acc, curr) => acc + (parseFloat(curr.salario_liquido) || 0), 0) || 0

      setStats({
        criancas: totalC,
        ativas,
        saidas,
        funcionarios: totalF || 0,
        folhaTotal: totalFolha
      })
      setUltimaAtualizacao(new Date().toLocaleTimeString('pt-PT'))
    } catch (e) {
      console.error('Erro ao carregar dashboard:', e)
    } finally {
      setCarregando(false)
    }
  }

  const formatMoney = (v) => v.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <div>
          <h2 style={{fontSize:28,fontWeight:'bold',margin:0}}>Dashboard</h2>
          <p style={{fontSize:14,color:'#94a3b8',margin:'4px 0 0'}}>Visão geral do centro • Atualizado às {ultimaAtualizacao}</p>
        </div>
        <button onClick={carregarEstatisticas} disabled={carregando} style={{padding:'10px 18px',background:'#334155',color:'#e2e8f0',border:'none',borderRadius:8,cursor:'pointer',fontSize:13}}>
          {carregando ? 'A atualizar...' : '🔄 Atualizar Dados'}
        </button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16,marginBottom:24}}>
        <div style={{background:'#1e293b',padding:20,borderRadius:12,border:'1px solid #334155',borderLeft:'4px solid #6366f1'}}>
          <h3 style={{fontSize:14,color:'#94a3b8',margin:'0 0 8px'}}>Total Crianças</h3>
          <p style={{fontSize:32,fontWeight:'bold',color:'#6366f1',margin:0}}>{stats.criancas}</p>
        </div>
        <div style={{background:'#1e293b',padding:20,borderRadius:12,border:'1px solid #334155',borderLeft:'4px solid #10b981'}}>
          <h3 style={{fontSize:14,color:'#94a3b8',margin:'0 0 8px'}}>Ativas no Centro</h3>
          <p style={{fontSize:32,fontWeight:'bold',color:'#10b981',margin:0}}>{stats.ativas}</p>
        </div>
        <div style={{background:'#1e293b',padding:20,borderRadius:12,border:'1px solid #334155',borderLeft:'4px solid #ef4444'}}>
          <h3 style={{fontSize:14,color:'#94a3b8',margin:'0 0 8px'}}>Com Saída</h3>
          <p style={{fontSize:32,fontWeight:'bold',color:'#ef4444',margin:0}}>{stats.saidas}</p>
        </div>
        <div style={{background:'#1e293b',padding:20,borderRadius:12,border:'1px solid #334155',borderLeft:'4px solid #f59e0b'}}>
          <h3 style={{fontSize:14,color:'#94a3b8',margin:'0 0 8px'}}>Funcionários</h3>
          <p style={{fontSize:32,fontWeight:'bold',color:'#f59e0b',margin:0}}>{stats.funcionarios}</p>
        </div>
      </div>

      <div style={{background:'#1e293b',padding:20,borderRadius:12,border:'1px solid #334155'}}>
        <h3 style={{fontSize:18,fontWeight:'bold',margin:'0 0 12px'}}>💰 Resumo Financeiro (Folha)</h3>
        <p style={{fontSize:24,fontWeight:'bold',color:'#10b981',margin:0}}>{formatMoney(stats.folhaTotal)} Kz</p>
        <p style={{fontSize:13,color:'#64748b',marginTop:4}}>Soma dos salários líquidos registados</p>
      </div>
    </div>
  )
}
