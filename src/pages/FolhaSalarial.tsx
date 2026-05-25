import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface Pagamento {
  id: string
  funcionarioNome: string
  mesReferencia: string
  pais: string
  moeda: string
  salarioBase: number
  bonificacoes: number
  subsFerias: number
  subsNatal: number
  subsTaxi: number
  subsAlimentacao: number
  subsOutro: number
  inss: number
  irt: number
  outrosDescontos: number
  salarioLiquido: number
  isento: boolean
  dataPagamento: string
}

const CONFIG_FISCAL = {
  angola: { nome: 'Angola', inss: 0.03, irt: [{ limite: 150000, taxa: 0 }, { limite: 300000, taxa: 0.05 }, { limite: 450000, taxa: 0.10 }, { limite: 600000, taxa: 0.15 }, { limite: 1000000, taxa: 0.20 }, { limite: Infinity, taxa: 0.25 }], moedas: ['AOA', 'USD', 'EUR'] },
  outro: { nome: 'Outro', inss: 0, irt: [{ limite: Infinity, taxa: 0 }], moedas: ['AOA', 'USD', 'EUR'] }
}
const SIMBOLO = { AOA: 'Kz', USD: '$', EUR: '€' }

export default function FolhaSalarial() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [funcionariosList, setFuncionariosList] = useState<{nome: string}[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [pais, setPais] = useState<'angola' | 'outro'>('angola')
  const [moeda, setMoeda] = useState('AOA')
  const [isento, setIsento] = useState(false)
  const [nomeInstituicao, setNomeInstituicao] = useState('Centro de Acolhimento')
  
  const [form, setForm] = useState({
    funcionarioNome: '', mesReferencia: new Date().toISOString().slice(0,7),
    salarioBase: '', bonificacoes: '', subsFerias: '', subsNatal: '',
    subsTaxi: '', subsAlimentacao: '', subsOutro: '', outrosDescontos: ''
  })

  const [calc, setCalc] = useState({ inss: 0, irt: 0, liquido: 0 })

  useEffect(() => {
    const saved = localStorage.getItem('funcionarios_db')
    if (saved) setFuncionariosList(JSON.parse(saved))
    const savedInst = localStorage.getItem('instituicao_nome')
    if (savedInst) setNomeInstituicao(savedInst)
    const savedPay = localStorage.getItem('folha_salarial_db')
    if (savedPay) setPagamentos(JSON.parse(savedPay))
  }, [])

  useEffect(() => { localStorage.setItem('instituicao_nome', nomeInstituicao) }, [nomeInstituicao])
  useEffect(() => { localStorage.setItem('folha_salarial_db', JSON.stringify(pagamentos)) }, [pagamentos])

  useEffect(() => {
    const cfg = CONFIG_FISCAL[pais]
    const base = parseFloat(form.salarioBase) || 0
    const totalSubs = ['bonificacoes','subsFerias','subsNatal','subsTaxi','subsAlimentacao','subsOutro'].reduce((s,k) => s + (parseFloat((form as any)[k]) || 0), 0)
    const bruto = base + totalSubs
    const inss = isento ? 0 : base * cfg.inss
    const irt = isento ? 0 : calcularIRT(bruto, cfg.irt)
    const desc = parseFloat(form.outrosDescontos) || 0
    setCalc({ inss, irt, liquido: bruto - inss - irt - desc })
  }, [form, pais, isento])

  const calcularIRT = (base: number, brackets: typeof CONFIG_FISCAL.angola.irt) => {
    let rest = base, imp = 0, ant = 0
    for (const b of brackets) {
      const p = Math.min(rest, b.limite) - ant
      if (p > 0) { imp += p * b.taxa; ant = b.limite } else break
    }
    return imp
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.funcionarioNome || !form.salarioBase) return toast.error('Seleciona funcionário e salário base.')
    
    const base = parseFloat(form.salarioBase) || 0
    const novo: Pagamento = {
      id: editingId || Date.now().toString(), funcionarioNome: form.funcionarioNome, mesReferencia: form.mesReferencia,
      pais: CONFIG_FISCAL[pais].nome, moeda, salarioBase: base,
      bonificacoes: parseFloat(form.bonificacoes) || 0,
      subsFerias: parseFloat(form.subsFerias) || 0,
      subsNatal: parseFloat(form.subsNatal) || 0,
      subsTaxi: parseFloat(form.subsTaxi) || 0,
      subsAlimentacao: parseFloat(form.subsAlimentacao) || 0,
      subsOutro: parseFloat(form.subsOutro) || 0,
      inss: calc.inss, irt: calc.irt, outrosDescontos: parseFloat(form.outrosDescontos) || 0,
      salarioLiquido: calc.liquido, isento, dataPagamento: new Date().toLocaleDateString('pt-PT')
    }
    
    if (editingId) {
      setPagamentos(pagamentos.map(p => p.id === editingId ? novo : p))
      toast.success('Pagamento atualizado!')
    } else {
      setPagamentos([novo, ...pagamentos])
      toast.success('Pagamento registado!')
    }
    resetForm()
  }

  const resetForm = () => {
    setForm({ funcionarioNome: '', mesReferencia: new Date().toISOString().slice(0,7), salarioBase: '', bonificacoes: '', subsFerias: '', subsNatal: '', subsTaxi: '', subsAlimentacao: '', subsOutro: '', outrosDescontos: '' })
    setEditingId(null)
    setIsento(false)
    setShowForm(false)
  }

  const startEdit = (p: Pagamento) => {
    setForm({
      funcionarioNome: p.funcionarioNome, mesReferencia: p.mesReferencia,
      salarioBase: p.salarioBase.toString(), bonificacoes: p.bonificacoes.toString(),
      subsFerias: p.subsFerias.toString(), subsNatal: p.subsNatal.toString(),
      subsTaxi: p.subsTaxi.toString(), subsAlimentacao: p.subsAlimentacao.toString(),
      subsOutro: p.subsOutro.toString(), outrosDescontos: p.outrosDescontos.toString()
    })
    setPais(p.pais.toLowerCase() as any)
    setMoeda(p.moeda)
    setIsento(p.isento)
    setEditingId(p.id)
    setShowForm(true)
  }

  const imprimir = (p: Pagamento) => {
    const s = SIMBOLO[p.moeda] || ''
    const html = `<!DOCTYPE html><html><head><title>Recibo</title><style>body{font-family:Arial;padding:30px;max-width:600px;margin:0 auto;color:#111}h1{text-align:center;border-bottom:2px solid #000;padding-bottom:10px}.row{display:flex;justify-content:space-between;margin:6px 0;border-bottom:1px dotted #ccc}.total{font-size:1.6em;font-weight:bold;text-align:right;margin-top:20px}.foot{margin-top:40px;display:flex;justify-content:space-between;font-size:0.9em}</style></head><body>
<h1>RECIBO DE VENCIMENTO</h1><p style="text-align:center;font-weight:bold">${nomeInstituicao}</p>
<p><b>Trabalhador:</b> ${p.funcionarioNome} | <b>Ref:</b> ${p.mesReferencia}</p>
<div class="row"><span>Salário Base:</span><span>${p.salarioBase.toFixed(2)} ${s}</span></div>
<div class="row"><span>Bonificações:</span><span>+${p.bonificacoes.toFixed(2)}</span></div>
<div class="row"><span>Sub. Férias:</span><span>+${p.subsFerias.toFixed(2)}</span></div>
<div class="row"><span>Sub. Natal:</span><span>+${p.subsNatal.toFixed(2)}</span></div>
<div class="row"><span>Sub. Táxi:</span><span>+${p.subsTaxi.toFixed(2)}</span></div>
<div class="row"><span>Sub. Alimentação:</span><span>+${p.subsAlimentacao.toFixed(2)}</span></div>
<div class="row"><span>Sub. Outro:</span><span>+${p.subsOutro.toFixed(2)}</span></div>
${!p.isento ? `<div class="row" style="color:#d00"><span>INSS:</span><span>-${p.inss.toFixed(2)}</span></div><div class="row" style="color:#d00"><span>IRT:</span><span>-${p.irt.toFixed(2)}</span></div>` : '<div class="row" style="color:green"><span>Regime: ISENTO</span></div>'}
<div class="row" style="color:#d00"><span>Outros Desc.:</span><span>-${p.outrosDescontos.toFixed(2)}</span></div>
<div class="total">LÍQUIDO: ${p.salarioLiquido.toFixed(2)} ${s}</div>
<div class="foot"><div>Empregador: ______________________</div><div>Trabalhador: ______________________</div></div>
</body></html>`
    const w = window.open('','','width=650,height=800'); w?.document.write(html); w?.document.close(); w?.print()
  }

  const sym = SIMBOLO[moeda] || ''
  
  const Input = ({label, val, onChange, placeholder='0'}: any) => (
    <div>
      <label style={{display:'block',marginBottom:4,color:'#94a3b8',fontSize:12}}>{label}</label>
      <input 
        type="text"
        placeholder={placeholder}
        value={val} 
        onChange={onChange}
        style={{width:'100%',padding:'10px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0',fontSize:16,mozAppearance:'textfield'}}
      />
    </div>
  )

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <h2 style={{fontSize:26,fontWeight:'bold',margin:0}}>Folha Salarial</h2>
        <button onClick={()=>{resetForm();setShowForm(!showForm)}} style={{padding:'10px 18px',background:showForm?'#64748b':'#6366f1',color:'#fff',border:'none',borderRadius:8,cursor:'pointer'}}>
          {showForm ? 'Cancelar' : '+ Novo Pagamento'}
        </button>
      </div>

      {showForm && (
        <div style={{background:'#1e293b',padding:20,borderRadius:12,border:'1px solid #334155',marginBottom:24}}>
          <h3 style={{marginTop:0,marginBottom:16,fontSize:18}}>{editingId?'Editar':'Registar'} Pagamento</h3>
          <form onSubmit={handleSubmit}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16,padding:12,background:'#0f172a',borderRadius:8}}>
              <div>
                <label style={{display:'block',marginBottom:4,color:'#94a3b8',fontSize:12}}>Nome da Instituição</label>
                <input type="text" value={nomeInstituicao} onChange={e=>setNomeInstituicao(e.target.value)} style={{width:'100%',padding:'8px',background:'#1e293b',border:'1px solid #334155',borderRadius:6,color:'#6366f1',fontSize:14}} />
              </div>
              <div>
                <label style={{display:'block',marginBottom:4,color:'#94a3b8',fontSize:12}}>Funcionário</label>
                <select value={form.funcionarioNome} onChange={e=>setForm({...form,funcionarioNome:e.target.value})} style={{width:'100%',padding:'8px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0',fontSize:14}}>
                  <option value="">Selecionar...</option>
                  {funcionariosList.map((f,i)=><option key={i} value={f.nome}>{f.nome}</option>)}
                </select>
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:16}}>
              <div>
                <label style={{display:'block',marginBottom:4,color:'#94a3b8',fontSize:12}}>Mês Referência</label>
                <input type="month" value={form.mesReferencia} onChange={e=>setForm({...form,mesReferencia:e.target.value})} style={{width:'100%',padding:'8px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0',fontSize:14}} />
              </div>
              <div>
                <label style={{display:'block',marginBottom:4,color:'#94a3b8',fontSize:12}}>País</label>
                <select value={pais} onChange={e=>setPais(e.target.value as any)} style={{width:'100%',padding:'8px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0',fontSize:14}}>
                  <option value="angola">🇦🇴 Angola</option><option value="outro"> Outro</option>
                </select>
              </div>
              <div>
                <label style={{display:'block',marginBottom:4,color:'#94a3b8',fontSize:12}}>Moeda</label>
                <select value={moeda} onChange={e=>setMoeda(e.target.value)} style={{width:'100%',padding:'8px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0',fontSize:14}}>
                  {CONFIG_FISCAL[pais].moedas.map(m=><option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:12,marginBottom:16}}>
              <Input label="💰 Salário Base *" val={form.salarioBase} onChange={(e:any)=>setForm({...form,salarioBase:e.target.value})} placeholder="50000" />
              <Input label="Bonificações" val={form.bonificacoes} onChange={(e:any)=>setForm({...form,bonificacoes:e.target.value})} />
              <Input label="Sub. Férias" val={form.subsFerias} onChange={(e:any)=>setForm({...form,subsFerias:e.target.value})} />
              <Input label="Sub. Natal" val={form.subsNatal} onChange={(e:any)=>setForm({...form,subsNatal:e.target.value})} />
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:12,marginBottom:16}}>
              <Input label="Sub. Táxi" val={form.subsTaxi} onChange={(e:any)=>setForm({...form,subsTaxi:e.target.value})} />
              <Input label="Sub. Alimentação" val={form.subsAlimentacao} onChange={(e:any)=>setForm({...form,subsAlimentacao:e.target.value})} />
              <Input label="Sub. Outro" val={form.subsOutro} onChange={(e:any)=>setForm({...form,subsOutro:e.target.value})} />
              <Input label="Outros Descontos" val={form.outrosDescontos} onChange={(e:any)=>setForm({...form,outrosDescontos:e.target.value})} />
            </div>

            <div style={{marginBottom:16,padding:12,background:isento?'#14532d':'#0f172a',border:`1px solid ${isento?'#22c55e':'#334155'}`,borderRadius:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{color:isento?'#4ade80':'#94a3b8',fontSize:14}}><b>Regime de Isenção Fiscal?</b> <span style={{fontSize:12}}>(Zera INSS/IRT)</span></div>
              <button type="button" onClick={()=>setIsento(!isento)} style={{width:44,height:24,borderRadius:12,border:'none',background:isento?'#22c55e':'#475569',position:'relative',cursor:'pointer'}}>
                <div style={{width:18,height:18,background:'#fff',borderRadius:'50%',position:'absolute',top:3,left:isento?23:3,transition:'left 0.2s'}}/>
              </button>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:16,padding:12,background:'#0f172a',borderRadius:8,textAlign:'center'}}>
              <div style={{color:'#94a3b8',fontSize:13}}>INSS<br/><b style={{fontSize:20,color:isento?'#4ade80':'#ef4444'}}>{isento?'ISENTO':`-${calc.inss.toFixed(2)} ${sym}`}</b></div>
              <div style={{color:'#94a3b8',fontSize:13}}>IRT<br/><b style={{fontSize:20,color:isento?'#4ade80':'#ef4444'}}>{isento?'ISENTO':`-${calc.irt.toFixed(2)} ${sym}`}</b></div>
              <div style={{color:'#94a3b8',fontSize:13}}>LÍQUIDO<br/><b style={{fontSize:24,color:'#10b981'}}>{calc.liquido.toFixed(2)} {sym}</b></div>
            </div>

            <div style={{display:'flex',gap:12,justifyContent:'flex-end'}}>
              <button type="button" onClick={resetForm} style={{padding:'8px 14px',background:'#334155',color:'#e2e8f0',border:'none',borderRadius:6,cursor:'pointer'}}>Cancelar</button>
              <button type="submit" style={{padding:'8px 14px',background:'#10b981',color:'#fff',border:'none',borderRadius:6,cursor:'pointer',fontWeight:500}}>{editingId?'Guardar Alterações':'Registar'}</button>
            </div>
          </form>
        </div>
      )}

      <div style={{background:'#1e293b',borderRadius:12,border:'1px solid #334155',overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead style={{background:'#0f172a'}}><tr>
            <th style={{padding:12,textAlign:'left',borderBottom:'1px solid #334155',color:'#94a3b8'}}>Funcionário / Ref</th>
            <th style={{padding:12,textAlign:'left',borderBottom:'1px solid #334155',color:'#94a3b8'}}>Bruto</th>
            <th style={{padding:12,textAlign:'left',borderBottom:'1px solid #334155',color:'#94a3b8'}}>Descontos</th>
            <th style={{padding:12,textAlign:'left',borderBottom:'1px solid #334155',color:'#94a3b8'}}>Líquido</th>
            <th style={{padding:12,textAlign:'left',borderBottom:'1px solid #334155',color:'#94a3b8'}}>Ações</th>
          </tr></thead>
          <tbody>
            {pagamentos.length===0 ? <tr><td colSpan={5} style={{padding:32,textAlign:'center',color:'#64748b'}}>Nenhum registo.</td></tr> :
            pagamentos.map(p=>(
              <tr key={p.id} style={{borderTop:'1px solid #334155'}}>
                <td style={{padding:12,color:'#e2e8f0'}}><b>{p.funcionarioNome}</b><br/><span style={{fontSize:12,color:'#94a3b8'}}>{p.mesReferencia} {p.isento && <span style={{background:'#dcfce7',color:'#166534',padding:'2px 4px',borderRadius:4,marginLeft:4,fontSize:11}}>Isento</span>}</span></td>
                <td style={{padding:12,color:'#94a3b8'}}>{(p.salarioBase + p.bonificacoes + p.subsFerias + p.subsNatal + p.subsTaxi + p.subsAlimentacao + p.subsOutro).toFixed(2)} {SIMBOLO[p.moeda]}</td>
                <td style={{padding:12,color:'#ef4444',fontSize:13}}>{p.isento?'0,00':`-${(p.inss+p.irt+p.outrosDescontos).toFixed(2)}`}</td>
                <td style={{padding:12,color:'#10b981',fontWeight:'bold'}}>{p.salarioLiquido.toFixed(2)} {SIMBOLO[p.moeda]}</td>
                <td style={{padding:12}}>
                  <button onClick={()=>startEdit(p)} style={{padding:'4px 8px',background:'#6366f1',color:'#fff',border:'none',borderRadius:4,cursor:'pointer',marginRight:4,fontSize:11}}>Editar</button>
                  <button onClick={()=>imprimir(p)} style={{padding:'4px 8px',background:'#64748b',color:'#fff',border:'none',borderRadius:4,cursor:'pointer',marginRight:4,fontSize:11}}>Recibo</button>
                  <button onClick={()=>{setPagamentos(pagamentos.filter(x=>x.id!==p.id));toast.success('Removido')}} style={{padding:'4px 8px',background:'#ef4444',color:'#fff',border:'none',borderRadius:4,cursor:'pointer',fontSize:11}}>Remover</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
