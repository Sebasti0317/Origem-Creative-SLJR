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
  brasil: { nome: 'Brasil', inss: 0.11, irt: [{ limite: 2259, taxa: 0 }, { limite: 2826, taxa: 0.075 }, { limite: 3751, taxa: 0.15 }, { limite: 4664, taxa: 0.225 }, { limite: Infinity, taxa: 0.275 }], moedas: ['BRL'] },
  outro: { nome: 'Outro', inss: 0, irt: [{ limite: Infinity, taxa: 0 }], moedas: ['AOA', 'USD', 'EUR', 'BRL'] }
}
const SIMBOLO = { AOA: 'Kz', USD: '$', EUR: '€', BRL: 'R$' }

export default function FolhaSalarial() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [funcionariosList, setFuncionariosList] = useState<{nome: string}[]>([])
  const [showForm, setShowForm] = useState(false)
  const [pais, setPais] = useState<'angola' | 'brasil' | 'outro'>('angola')
  const [moeda, setMoeda] = useState('AOA')
  const [isento, setIsento] = useState(false)
  const [nomeInstituicao, setNomeInstituicao] = useState('Centro de Acolhimento')
  
  const [form, setForm] = useState({
    funcionarioNome: '', mesReferencia: new Date().toISOString().slice(0,7),
    salarioBase: '', bonificacoes: '0', subsFerias: '0', subsNatal: '0',
    subsTaxi: '0', subsAlimentacao: '0', subsOutro: '0', outrosDescontos: '0'
  })

  const [calc, setCalc] = useState({ inss: 0, irt: 0, liquido: 0 })

  useEffect(() => {
    const saved = localStorage.getItem('funcionarios_db')
    if (saved) setFuncionariosList(JSON.parse(saved))
  }, [])

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
    if (!form.funcionarioNome || !form.salarioBase) return toast.error('Seleciona funcionário e preenche salário base.')
    
    const novo: Pagamento = {
      id: Date.now().toString(), funcionarioNome: form.funcionarioNome, mesReferencia: form.mesReferencia,
      pais: CONFIG_FISCAL[pais].nome, moeda, salarioBase: parseFloat(form.salarioBase),
      bonificacoes: parseFloat(form.bonificacoes), subsFerias: parseFloat(form.subsFerias),
      subsNatal: parseFloat(form.subsNatal), subsTaxi: parseFloat(form.subsTaxi),
      subsAlimentacao: parseFloat(form.subsAlimentacao), subsOutro: parseFloat(form.subsOutro),
      inss: calc.inss, irt: calc.irt, outrosDescontos: parseFloat(form.outrosDescontos),
      salarioLiquido: calc.liquido, isento, dataPagamento: new Date().toLocaleDateString('pt-PT')
    }
    setPagamentos([novo, ...pagamentos])
    setShowForm(false)
    toast.success('Pagamento registado!')
  }

  const imprimir = (p: Pagamento) => {
    const s = SIMBOLO[p.moeda] || ''
    const html = `<!DOCTYPE html><html><head><title>Recibo</title><style>body{font-family:Arial;padding:30px;max-width:600px;margin:0 auto;color:#111}h1{text-align:center;border-bottom:2px solid #000;padding-bottom:10px}.row{display:flex;justify-content:space-between;margin:6px 0;border-bottom:1px dotted #ccc}.total{font-size:1.6em;font-weight:bold;text-align:right;margin-top:20px}.foot{margin-top:40px;display:flex;justify-content:space-between;font-size:0.9em}</style></head><body>
<h1>RECIBO DE VENCIMENTO</h1><p style="text-align:center;font-weight:bold">${nomeInstituicao}</p>
<p><b>Trabalhador:</b> ${p.funcionarioNome} | <b>Ref:</b> ${p.mesReferencia} | <b>Moeda:</b> ${p.moeda}</p>
<div class="row"><span>Salário Base:</span><span>${p.salarioBase.toFixed(2)} ${s}</span></div>
<div class="row"><span>Bonificações:</span><span>+${p.bonificacoes.toFixed(2)}</span></div>
<div class="row"><span>Sub. Férias:</span><span>+${p.subsFerias.toFixed(2)}</span></div>
<div class="row"><span>Sub. Natal:</span><span>+${p.subsNatal.toFixed(2)}</span></div>
<div class="row"><span>Sub. Táxi:</span><span>+${p.subsTaxi.toFixed(2)}</span></div>
<div class="row"><span>Sub. Alimentação:</span><span>+${p.subsAlimentacao.toFixed(2)}</span></div>
<div class="row"><span>Sub. Outro:</span><span>+${p.subsOutro.toFixed(2)}</span></div>
${!p.isento ? `<div class="row" style="color:#d00"><span>INSS (3%):</span><span>-${p.inss.toFixed(2)}</span></div><div class="row" style="color:#d00"><span>IRT:</span><span>-${p.irt.toFixed(2)}</span></div>` : '<div class="row" style="color:green"><span>Regime:</span><span>ISENTO DE IMPOSTOS</span></div>'}
<div class="row" style="color:#d00"><span>Outros Descontos:</span><span>-${p.outrosDescontos.toFixed(2)}</span></div>
<div class="total">LÍQUIDO A PAGAR: ${p.salarioLiquido.toFixed(2)} ${s}</div>
<div class="foot"><div>Empregador: ______________________<br>Data: ${p.dataPagamento}</div><div>Trabalhador(a): ______________________<br>Visto e conforme</div></div>
</body></html>`
    const w = window.open('','','width=650,height=800'); w?.document.write(html); w?.document.close(); w?.print()
  }

  const sym = SIMBOLO[moeda] || ''
  const Input = ({label, val, keyName, type='number', color='#e2e8f0'}: any) => (
    <div>
      <label style={{display:'block',marginBottom:6,color:'#94a3b8',fontSize:13}}>{label}</label>
      <input type={type} value={val} onChange={e=>setForm({...form,[keyName]:e.target.value})} style={{width:'100%',padding:'8px 10px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color,fontSize:14}} />
    </div>
  )

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <h2 style={{fontSize:26,fontWeight:'bold',margin:0}}>Folha Salarial</h2>
        <button onClick={()=>setShowForm(!showForm)} style={{padding:'10px 20px',background:'#6366f1',color:'#fff',border:'none',borderRadius:8,cursor:'pointer'}}>
          {showForm ? 'Cancelar' : '+ Novo Pagamento'}
        </button>
      </div>

      {showForm && (
        <div style={{background:'#1e293b',padding:20,borderRadius:12,border:'1px solid #334155',marginBottom:24}}>
          <h3 style={{marginTop:0,marginBottom:16,fontSize:18}}>Registar Pagamento</h3>
          <form onSubmit={handleSubmit}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16,padding:12,background:'#0f172a',borderRadius:8}}>
              <Input label="Nome da Instituição" val={nomeInstituicao} keyName="nomeInstituicao" type="text" color="#6366f1" />
              <div>
                <label style={{display:'block',marginBottom:6,color:'#94a3b8',fontSize:13}}>Funcionário</label>
                <select value={form.funcionarioNome} onChange={e=>setForm({...form,funcionarioNome:e.target.value})} style={{width:'100%',padding:'8px 10px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0',fontSize:14}}>
                  <option value="">Selecionar...</option>
                  {funcionariosList.map((f,i)=><option key={i} value={f.nome}>{f.nome}</option>)}
                </select>
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:16}}>
              <Input label="Mês Referência" val={form.mesReferencia} keyName="mesReferencia" type="month" />
              <div>
                <label style={{display:'block',marginBottom:6,color:'#94a3b8',fontSize:13}}>País Fiscal</label>
                <select value={pais} onChange={e=>setPais(e.target.value as any)} style={{width:'100%',padding:'8px 10px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0',fontSize:14}}>
                  <option value="angola">🇦🇴 Angola</option><option value="brasil">🇧🇷 Brasil</option><option value="outro"> Outro</option>
                </select>
              </div>
              <div>
                <label style={{display:'block',marginBottom:6,color:'#94a3b8',fontSize:13}}>Moeda</label>
                <select value={moeda} onChange={e=>setMoeda(e.target.value)} style={{width:'100%',padding:'8px 10px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0',fontSize:14}}>
                  {CONFIG_FISCAL[pais].moedas.map(m=><option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:12,marginBottom:16}}>
              <Input label="Salário Base *" val={form.salarioBase} keyName="salarioBase" />
              <Input label="Bonificações" val={form.bonificacoes} keyName="bonificacoes" />
              <Input label="Sub. Férias" val={form.subsFerias} keyName="subsFerias" />
              <Input label="Sub. Natal" val={form.subsNatal} keyName="subsNatal" />
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:12,marginBottom:16}}>
              <Input label="Sub. Táxi" val={form.subsTaxi} keyName="subsTaxi" />
              <Input label="Sub. Alimentação" val={form.subsAlimentacao} keyName="subsAlimentacao" />
              <Input label="Sub. Outro" val={form.subsOutro} keyName="subsOutro" />
              <Input label="Outros Descontos" val={form.outrosDescontos} keyName="outrosDescontos" color="#ef4444" />
            </div>

            <div style={{marginBottom:16,padding:12,background:isento?'#14532d':'#0f172a',border:`1px solid ${isento?'#22c55e':'#334155'}`,borderRadius:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{color:isento?'#4ade80':'#94a3b8',fontSize:14}}>
                <b>Regime de Isenção Fiscal?</b> <span style={{fontSize:12}}>(Zera INSS/IRT automaticamente)</span>
              </div>
              <button type="button" onClick={()=>setIsento(!isento)} style={{width:44,height:24,borderRadius:12,border:'none',background:isento?'#22c55e':'#475569',position:'relative',cursor:'pointer'}}>
                <div style={{width:18,height:18,background:'#fff',borderRadius:'50%',position:'absolute',top:3,left:isento?23:3,transition:'left 0.2s'}}/>
              </button>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:16,padding:12,background:'#0f172a',borderRadius:8,textAlign:'center'}}>
              <div style={{color:'#94a3b8',fontSize:13}}>INSS<br/><b style={{fontSize:18,color:isento?'#4ade80':'#ef4444'}}>{isento?'ISENTO':`-${calc.inss.toFixed(2)} ${sym}`}</b></div>
              <div style={{color:'#94a3b8',fontSize:13}}>IRT<br/><b style={{fontSize:18,color:isento?'#4ade80':'#ef4444'}}>{isento?'ISENTO':`-${calc.irt.toFixed(2)} ${sym}`}</b></div>
              <div style={{color:'#94a3b8',fontSize:13}}>LÍQUIDO<br/><b style={{fontSize:22,color:'#10b981'}}>{calc.liquido.toFixed(2)} ${sym}</b></div>
            </div>

            <div style={{display:'flex',gap:12,justifyContent:'flex-end'}}>
              <button type="button" onClick={()=>setShowForm(false)} style={{padding:'10px 16px',background:'#334155',color:'#e2e8f0',border:'none',borderRadius:6,cursor:'pointer'}}>Cancelar</button>
              <button type="submit" style={{padding:'10px 16px',background:'#10b981',color:'#fff',border:'none',borderRadius:6,cursor:'pointer',fontWeight:500}}>Guardar Pagamento</button>
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
                <td style={{padding:12}}><button onClick={()=>imprimir(p)} style={{padding:'6px 10px',background:'#6366f1',color:'#fff',border:'none',borderRadius:6,cursor:'pointer',fontSize:12}}>️ Recibo</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
