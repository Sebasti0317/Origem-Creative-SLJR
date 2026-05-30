import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Dashboard({ role }) {
  const [stats, setStats] = useState({
    criancas: 0,
    criancasAtivas: 0,
    funcionarios: 0,
    folhaMes: 0,
    aniversariantes: [],
    recentes: []
  })
  const [carregando, setCarregando] = useState(true)
  const isEducador = role === 'educador'

  useEffect(() => { carregarDashboard() }, [isEducador])

  const carregarDashboard = async () => {
    setCarregando(true)
    try {
      // 1. Estatísticas de Crianças (Todos veem)
      const { count: totalCriancas } = await supabase.from('criancas').select('*', { count: 'exact', head: true })
      const { count: criancasAtivas } = await supabase.from('criancas').select('*', { count: 'exact', head: true }).eq('ativo', true)
      
      // 2. Aniversariantes do Mês (Todos veem)
      const mesAtual = new Date().getMonth()
      const { data: anivs } = await supabase.from('criancas').select('nome_completo, data_nascimento').not('data_nascimento', 'is', null)
      const aniversariantes = (anivs || [])
        .filter(c => new Date(c.data_nascimento).getMonth() === mesAtual)
        .map(c => ({
          nome: c.nome_completo,
          dia: new Date(c.data_nascimento).getDate(),
          idade: new Date().getFullYear() - new Date(c.data_nascimento).getFullYear()
        }))
        .sort((a, b) => a.dia - b.dia)
        .slice(0, 5)

      // 3. Dados exclusivos para Admin
      let funcionarios = 0, folhaMes = 0, recentes = []
      if (!isEducador) {
        // Total funcionários
        const { count: totalFunc } = await supabase.from('funcionarios').select('*', { count: 'exact', head: true })
        funcionarios = totalFunc || 0
        
        // Folha do mês atual
        const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
        const { data: folha } = await supabase.from('folha_salarial')
          .select('salario_liquido')
          .gte('data_pagamento', inicioMes)
        folhaMes = folha?.reduce((acc, i) => acc + parseFloat(i.salario_liquido || 0), 0) || 0
        
        // Atividades recentes (últimos 5 registos de qualquer tabela)
        const [ultimasCriancas, ultimosFunc] = await Promise.all([
          supabase.from('criancas').select('nome_completo, created_at').order('created_at', { ascending: false }).limit(3),
          supabase.from('funcionarios').select('nome_completo, created_at').order('created_at', { ascending: false }).limit(3)
        ])
        recentes = [
          ...(ultimasCriancas.data || []).map(c => ({ tipo: 'Criança', nome: c.nome_completo, data: c.created_at })),
          ...(ultimosFunc.data || []).map(f => ({ tipo: 'Funcionário', nome: f.nome_completo, data: f.created_at }))
        ].sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 5)
      }

      setStats({
        criancas: totalCriancas || 0,
        criancasAtivas: criancasAtivas || 0,
        funcionarios,
        folhaMes,
        aniversariantes,
        recentes
      })
    } catch (e) {
      console.error('Erro dashboard:', e)
    } finally {
      setCarregando(false)
    }
  }

  // Componente Card de Estatística
  const StatCard = ({ titulo, valor, subtitulo, cor, icone }) => (
    <div style={{ 
      background: '#1e293b', padding: 20, borderRadius: 12, border: '1px solid #334155',
      display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <div style={{ 
        width: 50, height: 50, borderRadius: 10, 
        background: `${cor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, color: cor 
      }}>{icone}</div>
      <div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>{titulo}</div>
        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#e2e8f0' }}>{valor}</div>
        {subtitulo && <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{subtitulo}</div>}
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 'bold', margin: 0, color: '#e2e8f0' }}>Dashboard</h1>
        <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: 14 }}>Visão geral do centro • {new Date().toLocaleDateString('pt-PT')}</p>
      </div>

      {carregando ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>A carregar estatísticas...</div>
      ) : (
        <>
          {/* Cards de Estatísticas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
            <StatCard 
              titulo="Total de Crianças" 
              valor={stats.criancas} 
              subtitulo={`${stats.criancasAtivas} ativas no momento`}
              cor="#6366f1" 
              icone="👶" 
            />
            {!isEducador && (
              <>
                <StatCard 
                  titulo="Funcionários" 
                  valor={stats.funcionarios} 
                  subtitulo="Equipa ativa"
                  cor="#10b981" 
                  icone="👥" 
                />
                <StatCard 
                  titulo="Folha Salarial (Mês)" 
                  valor={`${stats.folhaMes.toLocaleString('pt-AO')} Kz`} 
                  subtitulo="Total líquido pago"
                  cor="#f59e0b" 
                  icone="💰" 
                />
              </>
            )}
            <StatCard 
              titulo="Aniversariantes" 
              valor={stats.aniversariantes.length} 
              subtitulo="Este mês"
              cor="#ec4899" 
              icone="🎂" 
            />
          </div>

          {/* Secção Principal: 2 Colunas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            
            {/* Aniversariantes do Mês */}
            <div style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155', overflow: 'hidden' }}>
              <div style={{ padding: 16, borderBottom: '1px solid #334155', background: '#0f172a' }}>
                <h3 style={{ margin: 0, fontSize: 16, color: '#e2e8f0' }}>🎂 Aniversariantes</h3>
              </div>
              <div style={{ padding: 16 }}>
                {stats.aniversariantes.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>Nenhum aniversário este mês.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {stats.aniversariantes.map((a, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, background: '#0f172a', borderRadius: 8 }}>
                        <div style={{ 
                          width: 36, height: 36, borderRadius: '50%', 
                          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontWeight: 'bold', fontSize: 13
                        }}>{a.dia}</div>
                        <div>
                          <div style={{ fontWeight: 500, color: '#e2e8f0' }}>{a.nome}</div>
                          <div style={{ fontSize: 12, color: '#94a3b8' }}>Faz {a.idade} anos</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Atividades Recentes (Apenas Admin) */}
            {!isEducador && (
              <div style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155', overflow: 'hidden' }}>
                <div style={{ padding: 16, borderBottom: '1px solid #334155', background: '#0f172a' }}>
                  <h3 style={{ margin: 0, fontSize: 16, color: '#e2e8f0' }}>📋 Atividades Recentes</h3>
                </div>
                <div style={{ padding: 16 }}>
                  {stats.recentes.length === 0 ? (
                    <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>Sem atividades recentes.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {stats.recentes.map((at, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, background: '#0f172a', borderRadius: 8 }}>
                          <div style={{ 
                            width: 32, height: 32, borderRadius: 6, 
                            background: at.tipo === 'Criança' ? '#6366f120' : '#10b98120',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: at.tipo === 'Criança' ? '#6366f1' : '#10b981', fontSize: 14
                          }}>{at.tipo === 'Criança' ? '👶' : '👤'}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500, color: '#e2e8f0', fontSize: 13 }}>{at.nome}</div>
                            <div style={{ fontSize: 11, color: '#64748b' }}>Novo registo de {at.tipo}</div>
                          </div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>
                            {new Date(at.data).toLocaleDateString('pt-PT')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Acesso Rápido */}
            <div style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155', overflow: 'hidden', gridColumn: '1 / -1' }}>
              <div style={{ padding: 16, borderBottom: '1px solid #334155', background: '#0f172a' }}>
                <h3 style={{ margin: 0, fontSize: 16, color: '#e2e8f0' }}>⚡ Acesso Rápido</h3>
              </div>
              <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                <button style={{ padding: 14, background: '#6366f1', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span>👶</span> Nova Criança
                </button>
                {!isEducador && (
                  <>
                    <button style={{ padding: 14, background: '#10b981', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <span>👤</span> Novo Funcionário
                    </button>
                    <button style={{ padding: 14, background: '#f59e0b', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <span>💰</span> Gerar Folha
                    </button>
                  </>
                )}
                <button style={{ padding: 14, background: '#334155', color: '#e2e8f0', border: '1px solid #475569', borderRadius: 8, cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span>📊</span> Ver Relatórios
                </button>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  )
}
