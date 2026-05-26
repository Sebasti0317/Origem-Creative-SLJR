import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export default function Relatorios() {
  const role = localStorage.getItem('user_role') || 'educador'
  const isEducador = role === 'educador'
  
  const [modulo, setModulo] = useState(isEducador ? 'criancas' : 'geral')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [busca, setBusca] = useState('')
  const [dados, setDados] = useState<any[]>([])
  const [resumo, setResumo] = useState({ total: 0, valor: 0, media: 0 })
  const [carregando, setCarregando] = useState(false)

  useEffect(() => { carregarDados() }, [modulo, dataInicio, dataFim])

  const carregarDados = () => {
    setCarregando(true)
    try {
      let lista: any[] = []
      const inicio = dataInicio ? new Date(dataInicio) : null
      const fim = dataFim ? new Date(dataFim) : null

      if (modulo === 'criancas' || isEducador) {
        lista = JSON.parse(localStorage.getItem('criancas_db') || '[]')
      } else if (modulo === 'funcionarios') {
        lista = JSON.parse(localStorage.getItem('funcionarios_db') || '[]')
      } else if (modulo === 'folha') {
        lista = JSON.parse(localStorage.getItem('folha_salarial_db') || '[]')
      } else {
        const c = JSON.parse(localStorage.getItem('criancas_db') || '[]')
        const f = JSON.parse(localStorage.getItem('funcionarios_db') || '[]')
        const p = JSON.parse(localStorage.getItem('folha_salarial_db') || '[]')
        lista = [...c.map((x:any)=>({...x,tipo:'Crianca'})), ...f.map((x:any)=>({...x,tipo:'Funcionario'})), ...p.map((x:any)=>({...x,tipo:'Pagamento'}))]
      }

      // Filtro por data
      if (inicio || fim) {
        lista = lista.filter(item => {
          const d = new Date(item.data_entrada || item.dataAdmissao || item.dataPagamento || item.createdAt || Date.now())
          return (!inicio || d >= inicio) && (!fim || d <= new Date(fim + 'T23:59:59'))
        })
      }

      // Filtro por busca textual
      if (busca.trim()) {
        const termo = busca.toLowerCase()
        lista = lista.filter(item => 
          (item.nome && item.nome.toLowerCase().includes(termo)) ||
          (item.funcionarioNome && item.funcionarioNome.toLowerCase().includes(termo)) ||
          (item.cargo && item.cargo.toLowerCase().includes(termo))
        )
      }

      setDados(lista)
      
      // Cálculos de resumo
      let totalVal = 0
      lista.forEach((i:any) => { 
        if (modulo === 'folha' || i.tipo === 'Pagamento') totalVal += parseFloat(i.salarioLiquido || 0) 
      })
      setResumo({ 
        total: lista.length, 
        valor: totalVal, 
        media: lista.length ? totalVal / lista.length : 0 
      })
    } catch(e) { 
      setDados([])
      setResumo({ total: 0, valor: 0, media: 0 })
      toast.error('Erro ao carregar dados')
    } finally {
      setCarregando(false)
    }
  }

  const exportarCSV = () => {
    if (!dados.length) return toast.error('Sem dados para exportar')
    const headers = Object.keys(dados[0]).filter((k:any) => k !== 'id' && k !== 'observacoes')
    const csv = [
      headers.join(','),
      ...dados.map((r:any) => headers.map((h:any) => '"' + String(r[h] || '').replace(/"/g, '""') + '"').join(','))
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'relatorio_' + modulo + '_' + new Date().toISOString().slice(0,10) + '.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exportado com sucesso!')
  }

  const imprimirRelatorio = () => {
    window.print()
  }

  const limparFiltros = () => {
    setDataInicio('')
    setDataFim('')
    setBusca('')
    setModulo(isEducador ? 'criancas' : 'geral')
  }

  const formatarMoeda = (valor: number) => valor.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })
  const formatarData = (dataStr: string) => {
    if (!dataStr) return '-'
    return new Date(dataStr).toLocaleDateString('pt-PT')
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #334155' }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 'bold', margin: 0, color: '#e2e8f0' }}>Relatórios</h2>
          <p style={{ fontSize: 14, color: '#94a3b8', margin: '4px 0 0' }}>Consulte e exporte dados do sistema</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={exportarCSV} style={{ padding: '10px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Exportar CSV</button>
          <button onClick={imprimirRelatorio} style={{ padding: '10px 16px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Imprimir</button>
        </div>
      </div>

      {/* Painel de Filtros */}
      <div style={{ background: '#1e293b', padding: 20, borderRadius: 12, border: '1px solid #334155', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, color: '#e2e8f0' }}>Filtros</h3>
          <button onClick={limparFiltros} style={{ padding: '6px 12px', background: 'transparent', color: '#94a3b8', border: '1px solid #475569', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Limpar</button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          {!isEducador && (
            <div>
              <label style={{ display: 'block', marginBottom: 6, color: '#94a3b8', fontSize: 12 }}>Módulo</label>
              <select value={modulo} onChange={(e:any) => setModulo(e.target.value)} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0', fontSize: 14 }}>
                <option value="geral">Todos os módulos</option>
                <option value="criancas">Crianças</option>
                <option value="funcionarios">Funcionários</option>
                <option value="folha">Folha Salarial</option>
              </select>
            </div>
          )}
          {isEducador && (
            <div>
              <label style={{ display: 'block', marginBottom: 6, color: '#94a3b8', fontSize: 12 }}>Módulo</label>
              <div style={{ padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#6366f1', fontSize: 14 }}>Crianças (acesso restrito)</div>
            </div>
          )}
          
          <div>
            <label style={{ display: 'block', marginBottom: 6, color: '#94a3b8', fontSize: 12 }}>Data Início</label>
            <input type="date" value={dataInicio} onChange={(e:any) => setDataInicio(e.target.value)} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0', fontSize: 14 }} />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 6, color: '#94a3b8', fontSize: 12 }}>Data Fim</label>
            <input type="date" value={dataFim} onChange={(e:any) => setDataFim(e.target.value)} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0', fontSize: 14 }} />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 6, color: '#94a3b8', fontSize: 12 }}>Buscar</label>
            <input type="text" placeholder="Nome, cargo..." value={busca} onChange={(e:any) => setBusca(e.target.value)} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0', fontSize: 14 }} />
          </div>
        </div>
        
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <button onClick={carregarDados} disabled={carregando} style={{ padding: '10px 24px', background: carregando ? '#475569' : '#334155', color: '#e2e8f0', border: 'none', borderRadius: 6, cursor: carregando ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 500 }}>
            {carregando ? 'A carregar...' : 'Atualizar Resultados'}
          </button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#1e293b', padding: 20, borderRadius: 12, border: '1px solid #334155', borderLeft: '4px solid #6366f1' }}>
          <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>Total de Registos</div>
          <div style={{ fontSize: 32, fontWeight: 'bold', color: '#e2e8f0' }}>{resumo.total}</div>
        </div>
        <div style={{ background: '#1e293b', padding: 20, borderRadius: 12, border: '1px solid #334155', borderLeft: '4px solid #10b981' }}>
          <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>Valor Total (Folha)</div>
          <div style={{ fontSize: 32, fontWeight: 'bold', color: '#10b981' }}>{formatarMoeda(resumo.valor)}</div>
        </div>
        <div style={{ background: '#1e293b', padding: 20, borderRadius: 12, border: '1px solid #334155', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>Média por Registo</div>
          <div style={{ fontSize: 32, fontWeight: 'bold', color: '#f59e0b' }}>{formatarMoeda(resumo.media)}</div>
        </div>
      </div>

      {/* Tabela de Resultados */}
      <div style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155', overflow: 'hidden' }}>
        <div style={{ padding: 16, borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 16, color: '#e2e8f0' }}>Resultados</h3>
          <span style={{ fontSize: 13, color: '#94a3b8' }}>{dados.length} registo(s) encontrado(s)</span>
        </div>
        
        {dados.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>
            <p style={{ fontSize: 16, marginBottom: 8 }}>Nenhum dado encontrado</p>
            <p style={{ fontSize: 13 }}>Ajuste os filtros ou registe novos dados no sistema</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead style={{ background: '#0f172a' }}>
                <tr>
                  <th style={{ padding: 14, textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8', fontWeight: 600 }}>Nome / ID</th>
                  <th style={{ padding: 14, textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8', fontWeight: 600 }}>Tipo</th>
                  <th style={{ padding: 14, textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8', fontWeight: 600 }}>Data</th>
                  <th style={{ padding: 14, textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8', fontWeight: 600 }}>Detalhes</th>
                  {modulo === 'folha' && <th style={{ padding: 14, textAlign: 'right', borderBottom: '1px solid #334155', color: '#94a3b8', fontWeight: 600 }}>Valor</th>}
                </tr>
              </thead>
              <tbody>
                {dados.map((item: any, i: number) => (
                  <tr key={i} style={{ borderTop: '1px solid #334155', background: i % 2 === 0 ? 'transparent' : 'rgba(30,41,59,0.3)' }}>
                    <td style={{ padding: 14, color: '#e2e8f0', fontWeight: 500 }}>{item.nome || item.funcionarioNome || item.id?.slice(0, 10) || '-'}</td>
                    <td style={{ padding: 14, color: '#94a3b8' }}>
                      <span style={{ padding: '4px 10px', background: item.tipo === 'Crianca' ? '#6366f120' : item.tipo === 'Funcionario' ? '#10b98120' : '#f59e0b20', color: item.tipo === 'Crianca' ? '#6366f1' : item.tipo === 'Funcionario' ? '#10b981' : '#f59e0b', borderRadius: 4, fontSize: 12 }}>
                        {item.tipo || modulo}
                      </span>
                    </td>
                    <td style={{ padding: 14, color: '#94a3b8' }}>{formatarData(item.data_entrada || item.dataAdmissao || item.dataPagamento)}</td>
                    <td style={{ padding: 14, color: '#64748b', fontSize: 13 }}>
                      {item.cargo && <div>Cargo: {item.cargo}</div>}
                      {item.genero && <div>Género: {item.genero}</div>}
                      {item.salarioBase && <div>Base: {parseFloat(item.salarioBase).toLocaleString()} Kz</div>}
                    </td>
                    {modulo === 'folha' && (
                      <td style={{ padding: 14, textAlign: 'right', color: '#10b981', fontWeight: 600 }}>
                        {item.salarioLiquido ? formatarMoeda(parseFloat(item.salarioLiquido)) : '-'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rodapé com informações */}
      <div style={{ marginTop: 24, padding: 16, background: '#0f172a', borderRadius: 8, border: '1px solid #334155', fontSize: 12, color: '#64748b' }}>
        <p style={{ margin: 0 }}>Relatório gerado em {new Date().toLocaleDateString('pt-PT')} às {new Date().toLocaleTimeString('pt-PT')}</p>
        <p style={{ margin: '4px 0 0' }}>Dados armazenados localmente no navegador. Para persistência permanente, configure a ligação ao Supabase.</p>
      </div>
    </div>
  )
}
