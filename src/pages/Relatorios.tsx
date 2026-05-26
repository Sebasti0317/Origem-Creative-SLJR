import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export default function Relatorios() {
  const role = localStorage.getItem('user_role') || 'educador'
  const isEducador = role === 'educador'
  const [modulo, setModulo] = useState(isEducador ? 'criancas' : 'geral')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [dados, setDados] = useState<any[]>([])
  const [resumo, setResumo] = useState({ total: 0, valor: 0 })

  useEffect(() => { carregarDados() }, [modulo, dataInicio, dataFim])

  const carregarDados = () => {
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
      if (inicio || fim) {
        lista = lista.filter(item => {
          const d = new Date(item.data_entrada || item.dataAdmissao || item.dataPagamento || item.createdAt || Date.now())
          return (!inicio || d >= inicio) && (!fim || d <= new Date(fim + 'T23:59:59'))
        })
      }
      setDados(lista)
      let totalVal = 0
      lista.forEach((i:any) => { if (modulo === 'folha' || i.tipo === 'Pagamento') totalVal += parseFloat(i.salarioLiquido || 0) })
      setResumo({ total: lista.length, valor: totalVal })
    } catch(e) { setDados([]); setResumo({ total: 0, valor: 0 }) }
  }

  const exportarCSV = () => {
    if (!dados.length) return toast.error('Sem dados')
    const headers = Object.keys(dados[0]).filter((k:any) => k !== 'id')
    const csv = [headers.join(','), ...dados.map((r:any) => headers.map((h:any) => '"' + String(r[h] || '').replace(/"/g, '""') + '"').join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'relatorio_' + modulo + '_' + new Date().toISOString().slice(0,10) + '.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exportado!')
  }

  return (
    <div>
      <h2>Relatorios</h2>
      <div style={{marginBottom:20}}>
        <button onClick={exportarCSV}>Exportar CSV</button>
        <button onClick={() => window.print()} style={{marginLeft:8}}>Imprimir PDF</button>
      </div>
      <div style={{marginBottom:20}}>
        {!isEducador && (
          <select value={modulo} onChange={(e:any) => setModulo(e.target.value)} style={{marginRight:12}}>
            <option value="geral">Geral</option>
            <option value="criancas">Criancas</option>
            <option value="funcionarios">Funcionarios</option>
            <option value="folha">Folha</option>
          </select>
        )}
        {isEducador && <span>Apenas Criancas</span>}
        <input type="date" value={dataInicio} onChange={(e:any) => setDataInicio(e.target.value)} style={{marginRight:12}} />
        <input type="date" value={dataFim} onChange={(e:any) => setDataFim(e.target.value)} style={{marginRight:12}} />
        <button onClick={carregarDados}>Atualizar</button>
      </div>
      <div style={{marginBottom:20}}>
        <strong>Total:</strong> {resumo.total} | <strong>Valor:</strong> {resumo.valor.toLocaleString('pt-AO')} Kz
      </div>
      <table border={1} cellPadding={8} style={{width:'100%',borderCollapse:'collapse'}}>
        <thead>
          <tr>
            <th>Nome</th><th>Tipo</th><th>Data</th><th>Detalhes</th>
          </tr>
        </thead>
        <tbody>
          {dados.length === 0 ? (
            <tr><td colSpan={4} style={{textAlign:'center'}}>Sem dados</td></tr>
          ) : dados.map((item:any, i:number) => (
            <tr key={i}>
              <td>{item.nome || item.funcionarioNome || item.id?.slice(0,8)}</td>
              <td>{item.tipo || modulo}</td>
              <td>{new Date(item.data_entrada || item.dataAdmissao || item.dataPagamento || Date.now()).toLocaleDateString('pt-PT')}</td>
              <td>{item.cargo && 'Cargo:'+item.cargo+' | '}{item.salarioLiquido && 'Liquido:'+parseFloat(item.salarioLiquido).toLocaleString()+'Kz'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
