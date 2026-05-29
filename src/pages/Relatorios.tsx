import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

// ✅ Componente agora recebe a 'role' do App.tsx para garantir segurança
export default function Relatorios({ role }) {
  const isEducador = role === 'educador'
  const [modulo, setModulo] = useState(isEducador ? 'criancas' : 'geral')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [busca, setBusca] = useState('')
  const [dados, setDados] = useState([])
  const [resumo, setResumo] = useState({ total: 0, valor: 0 })
  const [carregando, setCarregando] = useState(false)
  const [aniversariantes, setAniversariantes] = useState([])

  useEffect(() => { 
    carregarDados()
    carregarAniversariantes()
  }, [modulo, dataInicio, dataFim, isEducador]) // Recarrega se role mudar

  const carregarDados = async () => {
    setCarregando(true)
    try {
      let lista = []
      const inicio = dataInicio ? new Date(dataInicio) : null
      const fim = dataFim ? new Date(dataFim) : null

      // 🔒 SEGURANÇA CRÍTICA: Se for Educador, FORÇA a tabela de crianças.
      // Não importa o que o estado 'modulo' diga.
      const moduloReal = isEducador ? 'criancas' : modulo

      if (moduloReal === 'criancas') {
        const { data } = await supabase.from('criancas').select('*')
        lista = (data || []).map(c => ({...c, tipo: 'Criança'}))
      } else if (moduloReal === 'funcionarios') {
        const { data } = await supabase.from('funcionarios').select('*')
        lista = (data || []).map(f => ({...f, tipo: 'Funcionário'}))
      } else if (moduloReal === 'folha') {
        const { data } = await supabase.from('folha_salarial').select('*')
        lista = (data || []).map(p => ({...p, tipo: 'Pagamento'}))
      } else {
        // Geral (apenas para Admin)
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

      // Filtros (Data e Busca)
      if (inicio || fim) {
        lista = lista.filter(item => {
          const dataRef = new Date(item.data_entrada || item.data_admissao || item.data_pagamento || item.created_at || Date.now())
          return (!inicio || dataRef >= inicio) && (!fim || dataRef <= new Date(fim + 'T23:59:59'))
        })
      }

      if (busca.trim()) {
        const termo = busca.toLowerCase()
        lista = lista.filter(item => 
          (item.nome_completo && item.nome_completo.toLowerCase().includes(termo)) ||
          (item.funcionario_nome && item.funcionario_nome.toLowerCase().includes(termo)) ||
          (item.cargo && item.cargo.toLowerCase().includes(termo))
        )
      }

      setDados(lista)
      
      // Resumo (Se for folha, soma os valores)
      let totalVal = 0
      if (moduloReal === 'folha' || (moduloReal === 'geral' && !isEducador)) {
        lista.forEach(i => { if (i.tipo === 'Pagamento') totalVal += parseFloat(i.salario_liquido || 0) })
      }
      setResumo({ total: lista.length, valor: totalVal })
    } catch(e) { 
      console.error('Erro relatório:', e)
      toast.error('Erro ao carregar dados')
    } finally {
      setCarregando(false)
    }
  }

  const carregarAniversariantes = async () => {
    try {
      const mesAtual = new Date().getMonth()
      const [cRes] = await Promise.all([
        supabase.from('criancas').select('nome_completo, data_nascimento')
      ])
      
      // Admin busca também funcionários
      let fRes = { data: [] }
      if (!isEducador) {
        fRes = await supabase.from('funcionarios').select('nome_completo, data_nascimento')
      }
      
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
    <h1>Relatório - ${modulo}</h1>
    <div class="info"><b>Total:</b> ${resumo.total} | <b>Valor Total:</b> ${resumo.valor.toLocaleString('pt-AO')} Kz</div>
    <table><thead><tr><th>Nome</th><th>Tipo</th><th>Data</th><th>Detalhes</th></tr></thead><tbody>
    ${dados.map(i => `<tr><td>${i.nome_completo||i.funcionario_nome||'-'}</td><td>${i.tipo}</td><td>${new Date(i.data_entrada||i.data_admissao||i.data_pagamento||Date.now()).toLocaleDateString('pt-PT')}</td><td>${i.cargo?'Cargo:'+i.cargo:''}</td></tr>`).join('')}
    </tbody></table><div class="footer">Origem Creative SLJR | ${new Date().toLocaleDateString('pt-PT')}</div></body></html>`
    
    const blob = new Blob([conteudo], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const win = window.open('', '_blank')
    if (win) { win.document.write(conteudo); win.document.close(); win.print() }
    toast.success('PDF pronto!')
  }

  const limparFiltros = () => { setDataInicio(''); setDataFim(''); setBusca(''); }
  const calcularIdade = (d) => { if(!d)return'-'; const h=new Date(),n=new Date(d); let i=h.getFullYear()-n.getFullYear(); if(h.getMonth()<n.getMonth()||(h.getMonth()===n.getMonth()&&h.getDate()<n.getDate()))i--; return i }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* Banner de Aniversariantes */}
      {aniversariantes.length > 0 && (
        <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', padding: 16, borderRadius: 12, marginBottom: 20, color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 24 }}></span>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 'bold' }}>Aniversariantes do Mês</h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {aniversariantes.map((a, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: 6, fontSize: 13 }}>
                <b>{a.nome_completo}</b> ({calcularIdade(a.data_nascimento)} anos)
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>Relatórios</h2>
          {isEducador && <p style={{ color: '#f59e0b', fontSize: 13, fontWeight: 'bold', marginTop: 4 }}>⚠️ Acesso restrito: Apenas dados de Crianças</p>}
        </div>
        {!isEducador && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={exportarCSV} style={{ padding: '8px 14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>CSV</button>
            <button onClick={exportarPDF} style={{ padding: '8px 14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>PDF</button>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div style={{ background: '#1e293b', padding: 16, borderRadius: 10, border: '1px solid #334155', marginBottom: 20 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
          {/* Seletor de Módulo (Apenas Admin) */}
          {!isEducador ? (
            <div style={{ flex: 1, minWidth: 150 }}>
              <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, display: 'block' }}>Módulo</label>
              <select value={modulo} onChange={e => setModulo(e.target.value)} style={{ width: '100%', padding: '8px', background: '#0f172a', border: '1px solid #334155', borderRadius: 4, color: '#fff' }}>
                <option value="geral">Todos</option>
                <option value="criancas">Crianças</option>
                <option value="funcionarios">Funcionários</option>
                <option value="folha">Folha Salarial</option>
              </select>
            </div>
          ) : (
            <div style={{ flex: 1, minWidth: 150 }}>
              <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, display: 'block' }}>Módulo Ativo</label>
              <div style={{ padding: '8px', background: '#0f172a', border: '1px solid #334155', borderRadius: 4, color: '#6366f1', fontWeight: 'bold' }}>👶 Apenas Crianças</div>
            </div>
          )}
          
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, display: 'block' }}>De</label>
            <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} style={{ width: '100%', padding: '8px', background: '#0f172a', border: '1px solid #334155', borderRadius: 4, color: '#fff' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, display: 'block' }}>Até</label>
            <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} style={{ width: '100%', padding: '8px', background: '#0f172a', border: '1px solid #334155', borderRadius: 4, color: '#fff' }} />
          </div>
          <div style={{ flex: 2 }}>
            <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, display: 'block' }}>Buscar Nome/Cargo</label>
            <input type="text" value={busca} onChange={e => setBusca(e.target.value)} placeholder="Pesquisar..." style={{ width: '100%', padding: '8px', background: '#0f172a', border: '1px solid #334155', borderRadius: 4, color: '#fff' }} />
          </div>
        </div>
      </div>

      {/* Tabela de Resultados */}
      <div style={{ background: '#1e293b', borderRadius: 10, border: '1px solid #334155', overflow: 'hidden' }}>
        <div style={{ padding: 12, borderBottom: '1px solid #334155', fontSize: 14, color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
          <span>Resultados</span>
          <span>{dados.length} registos</span>
        </div>
        
        {carregando ? (
          <div style={{ padding: 40, textAlign: 'center' }}>A carregar dados...</div>
        ) : dados.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Nenhum registo encontrado.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead style={{ background: '#0f172a' }}>
                <tr>
                  <th style={{ padding: 12, textAlign: 'left', color: '#94a3b8' }}>Nome</th>
                  <th style={{ padding: 12, textAlign: 'left', color: '#94a3b8' }}>Tipo</th>
                  <th style={{ padding: 12, textAlign: 'left', color: '#94a3b8' }}>Data</th>
                  <th style={{ padding: 12, textAlign: 'left', color: '#94a3b8' }}>Detalhes</th>
                  {!isEducador && (modulo === 'folha' || modulo === 'geral') && <th style={{ padding: 12, textAlign: 'right', color: '#94a3b8' }}>Valor</th>}
                </tr>
              </thead>
              <tbody>
                {dados.map((item, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #334155' }}>
                    <td style={{ padding: 12, fontWeight: 500 }}>{item.nome_completo || item.funcionario_nome || '-'}</td>
                    <td style={{ padding: 12 }}>
                      <span style={{ padding: '2px 8px', background: item.tipo === 'Criança' ? '#6366f130' : item.tipo === 'Funcionário' ? '#10b98130' : '#f59e0b30', borderRadius: 4, fontSize: 11 }}>
                        {item.tipo}
                      </span>
                    </td>
                    <td style={{ padding: 12, color: '#94a3b8' }}>{new Date(item.data_entrada || item.data_admissao || item.data_pagamento || Date.now()).toLocaleDateString('pt-PT')}</td>
                    <td style={{ padding: 12, color: '#64748b', fontSize: 12 }}>
                      {item.cargo ? `Cargo: ${item.cargo}` : item.cargo || ''}
                    </td>
                    {!isEducador && (modulo === 'folha' || modulo === 'geral') && (
                      <td style={{ padding: 12, textAlign: 'right', color: item.tipo === 'Pagamento' ? '#10b981' : '#94a3b8', fontWeight: item.tipo === 'Pagamento' ? 600 : 400 }}>
                        {item.salario_liquido ? parseFloat(item.salario_liquido).toLocaleString() + ' Kz' : '-'}
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
