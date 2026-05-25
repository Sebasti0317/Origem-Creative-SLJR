import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export default function Relatorios() {
  const [modulo, setModulo] = useState('geral')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [dados, setDados] = useState<any[]>([])
  const [resumo, setResumo] = useState({ total: 0, valor: 0, media: 0, registros: 0 })

  useEffect(() => {
    carregarDados()
  }, [modulo, dataInicio, dataFim])

  const carregarDados = () => {
    try {
      let lista: any[] = []
      const inicio = dataInicio ? new Date(dataInicio) : null
      const fim = dataFim ? new Date(dataFim) : null

      if (modulo === 'criancas') {
        lista = JSON.parse(localStorage.getItem('criancas_db') || '[]')
      } else if (modulo === 'funcionarios') {
        lista = JSON.parse(localStorage.getItem('funcionarios_db') || '[]')
      } else if (modulo === 'folha') {
        lista = JSON.parse(localStorage.getItem('folha_salarial_db') || '[]')
      } else {
        // Geral: combina todos
        const c = JSON.parse(localStorage.getItem('criancas_db') || '[]')
        const f = JSON.parse(localStorage.getItem('funcionarios_db') || '[]')
        const p = JSON.parse(localStorage.getItem('folha_salarial_db') || '[]')
        lista = [...c.map(x=>({...x,tipo:'Criança'})), ...f.map(x=>({...x,tipo:'Funcionário'})), ...p.map(x=>({...x,tipo:'Pagamento'}))]
      }

      // Filtro por data
      if (inicio || fim) {
        lista = lista.filter(item => {
          const dataItem = new Date(item.data_entrada || item.dataAdmissao || item.dataPagamento || item.createdAt || Date.now())
          if (inicio && dataItem < inicio) return false
          if (fim && dataItem > new Date(fim + 'T23:59:59')) return false
          return true
        })
      }

      setDados(lista)

      // Cálculo de resumo
      let totalVal = 0
      lista.forEach(item => {
        if (modulo === 'folha' || item.tipo === 'Pagamento') totalVal += parseFloat(item.salarioLiquido || 0)
      })
      setResumo({
        total: lista.length,
        valor: totalVal,
        media: lista.length ? totalVal / lista.length : 0,
        registros: lista.length
      })
    } catch (e) {
      setDados([])
      setResumo({ total: 0, valor: 0, media: 0, registros: 0 })
    }
  }

  const exportarCSV = () => {
    if (!dados.length) return toast.error('Sem dados para exportar')
    const headers = Object.keys(dados[0]).filter(k => k !== 'id')
    const csv = [
      headers.join(','),
      ...dados.map(row => headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio_${modulo}_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exportado com sucesso!')
  }

  const imprimir = () => window.print()

  const formatarMoeda = (v: number) => v.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })

  return (
    <div style={{maxWidth: 1200, margin: '0 auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <h2 style={{fontSize:26,fontWeight:'bold',margin:0}}>📊 Relatórios & Exportação</h2>
        <div style={{display:'flex',gap:8}}>
          <button onClick={exportarCSV} style={{padding:'8px 14px',background:'#10b981',color:'#fff',border:'none',borderRadius:6,cursor:'pointer',fontSize:13}}>📥 Exportar CSV</button>
          <button onClick={imprimir} style={{padding:'8px 14px',background:'#6366f1',color:'#fff',border:'none',borderRadius:6,cursor:'pointer',fontSize:13}}>️ Imprimir/PDF</button>
        </div>
      </div>

      {/* Filtros */}
      <div style={{background:'#1e293b',padding:16,borderRadius:10,border:'1px solid #334155',marginBottom:20,display:'flex',gap:12,flexWrap:'wrap',alignItems:'flex-end'}}>
        <div style={{flex:1,minWidth:150}}>
          <label style={{display:'block',marginBottom:4,color:'#94a3b8',fontSize:12}}>Módulo</label>
          <select value={modulo} onChange={e=>setModulo(e.target.value)} style={{width:'100%',padding:8,background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0',fontSize:14}}>
            <option value="geral">🌍 Geral (Todos)</option>
            <option value="criancas">👶 Crianças</option>
            <option value="funcionarios">👥 Funcionários</option>
            <option value="folha">💰 Folha Salarial</option>
          </select>
        </div>
        <div style={{flex:1,minWidth:150}}>
          <label style={{display:'block',marginBottom:4,color:'#94a3b8',fontSize:12}}>Data Início</label>
          <input type="date" value={dataInicio} onChange={e=>setDataInicio(e.target.value)} style={{width:'100%',padding:8,background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0',fontSize:14}} />
        </div>
        <div style={{flex:1,minWidth:150}}>
          <label style={{display:'block',marginBottom:4,color:'#94a3b8',fontSize:12}}>Data Fim</label>
          <input type="date" value={dataFim} onChange={e=>setDataFim(e.target.value)} style={{width:'100%',padding:8,background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0',fontSize:14}} />
        </div>
        <button onClick={carregarDados} style={{padding:'8px 16px',background:'#334155',color:'#e2e8f0',border:'none',borderRadius:6,cursor:'pointer',fontSize:14,height:38}}>🔄 Atualizar</button>
      </div>

      {/* Resumo */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16,marginBottom:20}}>
        <div style={{background:'#1e293b',padding:16,borderRadius:10,border:'1px solid #334155'}}>
          <div style={{color:'#94a3b8',fontSize:13,marginBottom:4}}>Total de Registos</div>
          <div style={{fontSize:28,fontWeight:'bold',color:'#6366f1'}}>{resumo.total}</div>
        </div>
        <div style={{background:'#1e293b',padding:16,borderRadius:10,border:'1px solid #334155'}}>
          <div style={{color:'#94a3b8',fontSize:13,marginBottom:4}}>Valor Total (Folha)</div>
          <div style={{fontSize:28,fontWeight:'bold',color:'#10b981'}}>{formatarMoeda(resumo.valor)}</div>
        </div>
        <div style={{background:'#1e293b',padding:16,borderRadius:10,border:'1px solid #334155'}}>
          <div style={{color:'#94a3b8',fontSize:13,marginBottom:4}}>Média por Registo</div>
          <div style={{fontSize:28,fontWeight:'bold',color:'#f59e0b'}}>{formatarMoeda(resumo.media)}</div>
        </div>
      </div>

      {/* Tabela */}
      <div style={{background:'#1e293b',borderRadius:10,border:'1px solid #334155',overflow:'hidden'}}>
        <div style={{padding:16,borderBottom:'1px solid #334155',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h3 style={{margin:0,fontSize:16,color:'#e2e8f0'}}>📋 Dados Filtrados</h3>
          <span style={{fontSize:13,color:'#94a3b8'}}>{dados.length} resultado(s)</span>
        </div>
        {dados.length === 0 ? (
          <div style={{padding:40,textAlign:'center',color:'#64748b'}}>Nenhum dado encontrado para os filtros selecionados.</div>
        ) : (
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
              <thead style={{background:'#0f172a'}}>
                <tr>
                  <th style={{padding:12,textAlign:'left',borderBottom:'1px solid #334155',color:'#94a3b8'}}>ID / Nome</th>
                  <th style={{padding:12,textAlign:'left',borderBottom:'1px solid #334155',color:'#94a3b8'}}>Tipo</th>
                  <th style={{padding:12,textAlign:'left',borderBottom:'1px solid #334155',color:'#94a3b8'}}>Data</th>
                  <th style={{padding:12,textAlign:'left',borderBottom:'1px solid #334155',color:'#94a3b8'}}>Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {dados.map((item, i) => (
                  <tr key={i} style={{borderTop:'1px solid #334155'}}>
                    <td style={{padding:10,color:'#e2e8f0',fontWeight:500}}>{item.nome || item.funcionarioNome || item.id?.slice(0,8)}</td>
                    <td style={{padding:10,color:'#94a3b8'}}>{item.tipo || modulo}</td>
                    <td style={{padding:10,color:'#94a3b8'}}>{new Date(item.data_entrada || item.dataAdmissao || item.dataPagamento || Date.now()).toLocaleDateString('pt-PT')}</td>
                    <td style={{padding:10,color:'#64748b',fontSize:12}}>
                      {item.cargo && `Cargo: ${item.cargo} | `}
                      {item.salarioLiquido && `Líquido: ${parseFloat(item.salarioLiquido).toLocaleString('pt-AO')} Kz | `}
                      {item.genero && `Género: ${item.genero}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; }
          button, select, input { display: none !important; }
        }
      `}</style>
      <div id="print-area"></div>
    </div>
  )
}
