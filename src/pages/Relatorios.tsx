import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export default function Relatorios() {
  const userRole = localStorage.getItem('user_role') || 'educador'
  const isEducador = userRole === 'educador'
  
  const [modulo, setModulo] = useState(isEducador ? 'criancas' : 'geral')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [dados, setDados] = useState<any[]>([])
  const [resumo, setResumo] = useState({ total: 0, valor: 0, media: 0 })

  useEffect(() => { carregarDados() }, [modulo, dataInicio, dataFim])

  const carregarDados = () => {
    try {
      let lista: any[] = []
      const inicio = dataInicio ? new Date(dataInicio) : null
      const fim = dataFim ? new Date(dataFim) : null

      if (modulo === 'criancas') lista = JSON.parse(localStorage.getItem('criancas_db') || '[]')
      else if (modulo === 'funcionarios' && !isEducador) lista = JSON.parse(localStorage.getItem('funcionarios_db') || '[]')
      else if (modulo === 'folha' && !isEducador) lista = JSON.parse(localStorage.getItem('folha_salarial_db') || '[]')
      else if (!isEducador) {
        const c = JSON.parse(localStorage.getItem('criancas_db') || '[]')
        const f = JSON.parse(localStorage.getItem('funcionarios_db') || '[]')
        const p = JSON.parse(localStorage.getItem('folha_salarial_db') || '[]')
        lista = [...c.map(x=>({...x,tipo:'Criança'})), ...f.map(x=>({...x,tipo:'Funcionário'})), ...p.map(x=>({...x,tipo:'Pagamento'}))]
      }

      if (inicio || fim) {
        lista = lista.filter(item => {
          const d = new Date(item.data_entrada || item.dataAdmissao || item.dataPagamento || item.createdAt || Date.now())
          return (!inicio || d >= inicio) && (!fim || d <= new Date(fim + 'T23:59:59'))
        })
      }

      setDados(lista)
      let totalVal = 0
      lista.forEach(i => { if (modulo === 'folha' || i.tipo === 'Pagamento') totalVal += parseFloat(i.salarioLiquido || 0) })
      setResumo({ total: lista.length, valor: totalVal, media: lista.length ? totalVal / lista.length : 0 })
    } catch (e) { setDados([]); setResumo({ total: 0, valor: 0, media: 0 }) }
  }

  const exportarCSV = () => {
    if (!dados.length) return toast.error('Sem dados')
    const headers = Object.keys(dados[0]).filter(k => k !== 'id')
    const csv = [headers.join(','), ...dados.map(r => headers.map(h => `"${String(r[h]||'').replace(/"/g,'""')}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `relatorio_${modulo}_${new Date().toISOString().slice(0,10)}.csv`; a.click()
    URL.revokeObjectURL(url); toast.success('CSV exportado!')
  }

  const formatar = (v: number) => v.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })

  return (
    <div style={{maxWidth:1200,margin:'0 auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <h2 style={{fontSize:24,fontWeight:'bold',margin:0}}>📊 Relatórios</h2>
        <div style={{display:'flex',gap:8}}>
          <button onClick={exportarCSV} style={{padding:'8px 14px',background:'#10b981',color:'#fff',border:'none',borderRadius:6,cursor:'pointer',fontSize:13}}>📥 CSV</button>
          <button onClick={()=>window.print()} style={{padding:'8px 14px',background:'#6366f1',color:'#fff',border:'none',borderRadius:6,cursor:'pointer',fontSize:13}}>🖨️ PDF</button>
        </div>
      </div>

      <div style={{background:'#1e293b',padding:16,borderRadius:10,border:'1px solid #334155',marginBottom:20,display:'flex',gap:12,flexWrap:'wrap',alignItems:'flex-end'}}>
        {!isEducador && (
          <div style={{flex:1,minWidth:150}}>
            <label style={{display:'block',marginBottom:4,color:'#94a3b8',fontSize:12}}>Módulo</label>
            <select value={modulo} onChange={e=>setModulo(e.target.value)} style={{width:'100%',padding:8,background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0',fontSize:14}}>
              <option value="geral"> Geral</option><option value="criancas">👶 Crianças</option><option value="funcionarios">👥 Funcionários</option><option value="folha">💰 Folha</option>
            </select>
          </div>
        )}
        {isEducador && <div style={{padding:'8px 12px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#6366f1',fontSize:14}}>👶 Apenas Crianças</div>}
        <div style={{flex:1,minWidth:150}}><label style={{display:'block',marginBottom:4,color:'#94a3b8',fontSize:12}}>Início</label><input type="date" value={dataInicio} onChange={e=>setDataInicio(e.target.value)} style={{width:'100%',padding:8,background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0',fontSize:14}} /></div>
        <div style={{flex:1,minWidth:150}}><label style={{display:'block',marginBottom:4,color:'#94a3b8',fontSize:12}}>Fim</label><input type="date" value={dataFim} onChange={e=>setDataFim(e.target.value)} style={{width:'100%',padding:8,background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0',fontSize:14}} /></div>
        <button onClick={carregarDados} style={{padding:'8px 16px',background:'#334155',color:'#e2e8f0',border:'none',borderRadius:6,cursor:'pointer',fontSize:14}}>🔄 Atualizar</button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16,marginBottom:20}}>
        <div style={{background:'#1e293b',padding:16,borderRadius:10,border:'1px solid #334155'}}><div style={{color:'#94a3b8',fontSize:13}}>Registos</div><div style={{fontSize:28,fontWeight:'bold',color:'#6366f1'}}>{resumo.total}</div></div>
        <div style={{background:'#1e293b',padding:16,borderRadius:10,border:'1px solid #334155'}}><div style={{color:'#94a3b8',fontSize:13}}>Valor Total</div><div style={{fontSize:28,fontWeight:'bold',color:'#10b981'}}>{formatar(resumo.valor)}</div></div>
      </div>

      <div style={{background:'#1e293b',borderRadius:10,border:'1px solid #334155',overflow:'hidden'}}>
        <div style={{padding:16,borderBottom:'1px solid #334155',display:'flex',justifyContent:'space-between'}}><h3 style={{margin:0,fontSize:16,color:'#e2e8f0'}}>📋 Dados</h3><span style={{fontSize:13,color:'#94a3b8'}}>{dados.length} resultados</span></div>
        {dados.length===0 ? <div style={{padding:40,textAlign:'center',color:'#64748b'}}>Sem dados.</div> :
        <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
          <thead style={{background:'#0f172a'}}><tr><th style={{padding:12,textAlign:'left',borderBottom:'1px solid #334155',color:'#94a3b8'}}>Nome/ID</th><th style={{padding:12,textAlign:'left',borderBottom:'1px solid #334155',color:'#94a3b8'}}>Tipo</th><th style={{padding:12,textAlign:'left',borderBottom:'1px solid #334155',color:'#94a3b8'}}>Data</th><th style={{padding:12,textAlign:'left',borderBottom:'1px solid #334155',color:'#94a3b8'}}>Detalhes</th></tr></thead>
          <tbody>{dados.map((item,i)=>(<tr key={i} style={{borderTop:'1px solid #334155'}}>
            <td style={{padding:10,color:'#e2e8f0'}}>{item.nome||item.funcionarioNome||item.id?.slice(0,8)}</td>
            <td style={{padding:10,color:'#94a3b8'}}>{item.tipo||modulo}</td>
            <td style={{padding:10,color:'#94a3b8'}}>{new Date(item.data_entrada||item.dataAdmissao||item.dataPagamento||Date.now()).toLocaleDateString('pt-PT')}</td>
            <td style={{padding:10,color:'#64748b',fontSize:12}}>{item.cargo&&`Cargo:${item.cargo}|`}{item.salarioLiquido&&`Líquido:${parseFloat(item.salarioLiquido).toLocaleString()}Kz|`}{item.genero&&`Género:${item.genero}`}</td>
          </tr>))}</tbody>
        </table></div>}
      </div>
    </div>
  )
}
