import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

export default function Relatorios() {
  const role = localStorage.getItem('user_role') || 'educador'
  const isEducador = role === 'educador'
  
  const [modulo, setModulo] = useState(isEducador ? 'criancas' : 'geral')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [busca, setBusca] = useState('')
  const [dados, setDados] = useState([])
  const [resumo, setResumo] = useState({ total: 0, valor: 0, media: 0 })
  const [carregando, setCarregando] = useState(false)
  const [aniversariantes, setAniversariantes] = useState([])

  useEffect(() => { 
    carregarDados()
    carregarAniversariantes()
  }, [modulo, dataInicio, dataFim])

  const carregarDados = async () => {
    setCarregando(true)
    try {
      let lista = []
      const inicio = dataInicio ? new Date(dataInicio) : null
      const fim = dataFim ? new Date(dataFim) : null

      if (modulo === 'criancas' || isEducador) {
        const { data } = await supabase.from('criancas').select('*')
        lista = (data || []).map(c => ({...c, tipo: 'Criança'}))
      } else if (modulo === 'funcionarios') {
        const { data } = await supabase.from('funcionarios').select('*')
        lista = (data || []).map(f => ({...f, tipo: 'Funcionário'}))
      } else if (modulo === 'folha') {
        const { data } = await supabase.from('folha_salarial').select('*')
        lista = (data || []).map(p => ({...p, tipo: 'Pagamento'}))
      } else {
        // Geral: combina os 3 módulos
        const [cRes, fRes, pRes] = await Promise.all([
          supabase.from('criancas').select('*'),
          supabase.from('funcionarios').select('*'),
          supabase.from('folha_salarial').select('*')
        ])
        lista = [
          ...(cRes.data || []).map(c => ({...c, tipo: 'Criança'})),
          ...(fRes.data || []).map(f => ({...f, tipo: 'Funcionário'})),
          ...(pRes.data || []).map(p => ({...p, tipo: 'Pagamento'}))
        ]
      }

      // Filtro por data
      if (inicio || fim) {
        lista = lista.filter(item => {
          const dataRef = new Date(item.data_entrada || item.data_admissao || item.data_pagamento || item.created_at || Date.now())
          return (!inicio || dataRef >= inicio) && (!fim || dataRef <= new Date(fim + 'T23:59:59'))
        })
      }

      // Filtro por busca
      if (busca.trim()) {
        const termo = busca.toLowerCase()
        lista = lista.filter(item => 
          (item.nome_completo && item.nome_completo.toLowerCase().includes(termo)) ||
          (item.funcionario_nome && item.funcionario_nome.toLowerCase().includes(termo)) ||
          (item.cargo && item.cargo.toLowerCase().includes(termo))
        )
      }

      setDados(lista)
      
      // Cálculos
      let totalVal = 0
      lista.forEach(i => { if (i.tipo === 'Pagamento') totalVal += parseFloat(i.salario_liquido || 0) })
      setResumo({ total: lista.length, valor: totalVal, media: lista.length ? totalVal / lista.length : 0 })
    } catch(e) { 
      console.error('Erro ao carregar relatórios:', e)
      toast.error('Erro ao carregar dados')
    } finally {
      setCarregando(false)
    }
  }

  const carregarAniversariantes = async () => {
    try {
      const mesAtual = new Date().getMonth()
      const [cRes, fRes] = await Promise.all([
        supabase.from('criancas').select('nome_completo, data_nascimento'),
        supabase.from('funcionarios').select('nome_completo, data_nascimento')
      ])
      
      const filtrarMes = (lista, tipo) => 
        (lista.data || []).filter(x => x.data_nascimento && new Date(x.data_nascimento).getMonth() === mesAtual)
          .map(x => ({...x, tipo}))
      
      const todos = [...filtrarMes(cRes, 'Criança'), ...filtrarMes(fRes, 'Funcionário')]
        .sort((a,b) => new Date(a.data_nascimento).getDate() - new Date(b.data_nascimento).getDate())
      
      setAniversariantes(todos)
    } catch(e) { setAniversariantes([]) }
  }

  const exportarCSV = () => {
    if (!dados.length) return toast.error('Sem dados para exportar')
    const headers = Object.keys(dados[0]).filter(k => !['id','created_at','observacoes','morada'].includes(k))
    const csv = [
      headers.join(','),
      ...dados.map(r => headers.map(h => `"${String(r[h] || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio_${modulo}_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exportado!')
  }

  const exportarPDF = () => {
    if (!dados.length) return toast.error('Sem dados para exportar')
    const conteudo = `<!DOCTYPE html><html><head><title>Relatório</title>
    <style>body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:0 auto}
    h1{color:#1e293b;border-bottom:3px solid #6366f1;padding-bottom:10px}
    .info{background:#f1f5f9;padding:15px;border-radius:8px;margin:20px 0}
    table{width:100%;border-collapse:collapse;margin-top:20px}
    th{background:#6366f1;color:white;padding:12px;text-align:left}
    td{padding:10px;border-bottom:1px solid #e2e8f0}
    tr:nth-child(even){background:#f8fafc}
    .footer{margin-top:40px;text-align:center;color:#64748b;font-size:12px}</style></head><body>
    <h1>Relatório - ${modulo === 'criancas' ? 'Crianças' : modulo === 'funcionarios' ? 'Funcionários' : modulo === 'folha' ? 'Folha Salarial' : 'Geral'}</h1>
    <div class="info"><b>Total:</b> ${resumo.total} | <b>Valor Total:</b> ${resumo.valor.toLocaleString('pt-AO')} Kz | <b>Média:</b> ${resumo.media.toLocaleString('pt-AO')} Kz</div>
    <table><thead><tr><th>Nome</th><th>Tipo</th><th>Data</th><th>Detalhes</th></tr></thead><tbody>
    ${dados.map(i => `<tr><td>${i.nome_completo||i.funcionario_nome||'-'}</td><td>${i.tipo||modulo}</td><td>${new Date(i.data_entrada||i.data_admissao||i.data_pagamento||Date.now()).toLocaleDateString('pt-PT')}</td><td>${i.cargo?'Cargo:'+i.cargo+'<br>':''}${i.salario_liquido?'Líquido:'+parseFloat(i.salario_liquido).toLocaleString()+' Kz':''}</td></tr>`).join('')}
    </tbody></table><div class="footer">Origem Creative SLJR | Gerado em ${new Date().toLocaleString('pt-PT')}</div></body></html>`
    
    const blob = new Blob([conteudo], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const win = window.open('', '_blank')
    if (win) { win.document.write(conteudo); win.document.close(); win.print() }
    toast.success('PDF pronto para imprimir/guardar!')
  }

  const limparFiltros = () => { setDataInicio(''); setDataFim(''); setBusca(''); setModulo(isEducador ? 'criancas' : 'geral') }
  const formatarMoeda = (v) => v.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })
  const calcularIdade = (d) => { if(!d)return'-'; const h=new Date(),n=new Date(d); let i=h.getFullYear()-n.getFullYear(); if(h.getMonth()<n.getMonth()||(h.getMonth()===n.getMonth()&&h.getDate()<n.getDate()))i--; return i }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {aniversariantes.length > 0 && (
        <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', padding: 20, borderRadius: 12, marginBottom: 24, color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 28 }}>🎂</span>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 'bold' }}>Aniversariantes do Mês</h3>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: 12, fontSize: 13 }}>{aniversariantes.length}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {aniversariantes.map((a, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.15)', padding: '8px 14px', borderRadius: 8, fontSize: 13 }}>
                <b>{a.nome_completo}</b> • {new Date(a.data_nascimento).getDate()} de {new Date(a.data_nascimento).toLocaleDateString('pt-PT', {month:'long'})} ({calcularIdade(a.data_nascimento)} anos)
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #334155' }}>
        <div><h2 style={{ fontSize: 24, fontWeight: 'bold', margin: 0, color: '#e2e8f0' }}>Relatórios</h2><p style={{ fontSize: 14, color: '#94a3b8', margin: '4px 0 0' }}>Dados sincronizados com Supabase</p></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={exportarCSV} style={{ padding: '10px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>CSV</button>
          <button onClick={exportarPDF} style={{ padding: '10px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>PDF</button>
        </div>
      </div>

      <div style={{ background: '#1e293b', padding: 20, borderRadius: 12, border: '1px solid #334155', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, color: '#e2e8f0' }}>Filtros</h3>
          <button onClick={limparFiltros} style={{ padding: '6px 12px', background: 'transparent', color: '#94a3b8', border: '1px solid #475569', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Limpar</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          {!isEducador && (
            <div><label style={{ display: 'block', marginBottom: 6, color: '#94a3b8', fontSize: 12 }}>Módulo</label>
              <select value={modulo} onChange={(e) => setModulo(e.target.value)} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0', fontSize: 14 }}>
                <option value="geral">Todos os módulos</option><option value="criancas">Crianças</option><option value="funcionarios">Funcionários</option><option value="folha">Folha Salarial</option>
              </select></div>
          )}
          {isEducador && <div><label style={{ display: 'block', marginBottom: 6, color: '#94a3b8', fontSize: 12 }}>Módulo</label><div style={{ padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#6366f1', fontSize: 14 }}>Crianças (restrito)</div></div>}
          <div><label style={{ display: 'block', marginBottom: 6, color: '#94a3b8', fontSize: 12 }}>Data Início</label><input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0', fontSize: 14 }} /></div>
          <div><label style={{ display: 'block', marginBottom: 6, color: '#94a3b8', fontSize: 12 }}>Data Fim</label><input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0', fontSize: 14 }} /></div>
          <div><label style={{ display: 'block', marginBottom: 6, color: '#94a3b8', fontSize: 12 }}>Buscar</label><input type="text" placeholder="Nome, cargo..." value={busca} onChange={(e) => setBusca(e.target.value)} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0', fontSize: 14 }} /></div>
        </div>
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <button onClick={carregarDados} disabled={carregando} style={{ padding: '10px 24px', background: carregando ? '#475569' : '#334155', color: '#e2e8f0', border: 'none', borderRadius: 6, cursor: carregando ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 500 }}>
            {carregando ? 'A carregar...' : 'Atualizar Resultados'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#1e293b', padding: 20, borderRadius: 12, border: '1px solid #334155', borderLeft: '4px solid #6366f1' }}><div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>Total de Registos</div><div style={{ fontSize: 32, fontWeight: 'bold', color: '#e2e8f0' }}>{resumo.total}</div></div>
        <div style={{ background: '#1e293b', padding: 20, borderRadius: 12, border: '1px solid #334155', borderLeft: '4px solid #10b981' }}><div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>Valor Total (Folha)</div><div style={{ fontSize: 32, fontWeight: 'bold', color: '#10b981' }}>{formatarMoeda(resumo.valor)}</div></div>
        <div style={{ background: '#1e293b', padding: 20, borderRadius: 12, border: '1px solid #334155', borderLeft: '4px solid #f59e0b' }}><div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>Média por Registo</div><div style={{ fontSize: 32, fontWeight: 'bold', color: '#f59e0b' }}>{formatarMoeda(resumo.media)}</div></div>
      </div>

      <div style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155', overflow: 'hidden' }}>
        <div style={{ padding: 16, borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 16, color: '#e2e8f0' }}>Resultados</h3>
          <span style={{ fontSize: 13, color: '#94a3b8' }}>{dados.length} registo(s)</span>
        </div>
        {dados.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}><p style={{ fontSize: 16, marginBottom: 8 }}>Nenhum dado encontrado</p><p style={{ fontSize: 13 }}>Ajuste os filtros ou registe dados no sistema</p></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead style={{ background: '#0f172a' }}>
                <tr>
                  <th style={{ padding: 14, textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8', fontWeight: 600 }}>Nome</th>
                  <th style={{ padding: 14, textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8', fontWeight: 600 }}>Tipo</th>
                  <th style={{ padding: 14, textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8', fontWeight: 600 }}>Data</th>
                  <th style={{ padding: 14, textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8', fontWeight: 600 }}>Detalhes</th>
                  {modulo === 'folha' && <th style={{ padding: 14, textAlign: 'right', borderBottom: '1px solid #334155', color: '#94a3b8', fontWeight: 600 }}>Valor</th>}
                </tr>
              </thead>
              <tbody>
                {dados.map((item, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #334155', background: i % 2 === 0 ? 'transparent' : 'rgba(30,41,59,0.3)' }}>
                    <td style={{ padding: 14, color: '#e2e8f0', fontWeight: 500 }}>{item.nome_completo || item.funcionario_nome || '-'}</td>
                    <td style={{ padding: 14, color: '#94a3b8' }}>
                      <span style={{ padding: '4px 10px', background: item.tipo === 'Criança' ? '#6366f120' : item.tipo === 'Funcionário' ? '#10b98120' : '#f59e0b20', color: item.tipo === 'Criança' ? '#6366f1' : item.tipo === 'Funcionário' ? '#10b981' : '#f59e0b', borderRadius: 4, fontSize: 12 }}>
                        {item.tipo || modulo}
                      </span>
                    </td>
                    <td style={{ padding: 14, color: '#94a3b8' }}>{new Date(item.data_entrada || item.data_admissao || item.data_pagamento || Date.now()).toLocaleDateString('pt-PT')}</td>
                    <td style={{ padding: 14, color: '#64748b', fontSize: 13 }}>
                      {item.cargo && <div>Cargo: {item.cargo}</div>}
                      {item.salario_base && <div>Base: {parseFloat(item.salario_base).toLocaleString()} Kz</div>}
                    </td>
                    {modulo === 'folha' && (
                      <td style={{ padding: 14, textAlign: 'right', color: '#10b981', fontWeight: 600 }}>
                        {item.salario_liquido ? formatarMoeda(parseFloat(item.salario_liquido)) : '-'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
