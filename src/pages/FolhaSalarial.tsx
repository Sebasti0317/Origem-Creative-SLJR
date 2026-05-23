import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface Pagamento {
  id: string
  funcionario: string
  mesReferencia: string
  pais: string
  moeda: string
  salarioBase: number
  bonificacoes: number
  inss: number
  irt: number
  descontos: number
  salarioLiquido: number
  isento: boolean
  dataPagamento: string
}

const CONFIG_FISCAL = {
  angola: {
    nome: 'Angola',
    inss: 0.03,
    irt: [
      { limite: 150000, taxa: 0 },
      { limite: 300000, taxa: 0.05 },
      { limite: 450000, taxa: 0.10 },
      { limite: 600000, taxa: 0.15 },
      { limite: 1000000, taxa: 0.20 },
      { limite: Infinity, taxa: 0.25 }
    ],
    moedas: ['AOA', 'USD', 'EUR']
  },
  brasil: {
    nome: 'Brasil',
    inss: 0.11,
    irt: [{ limite: 2259, taxa: 0 }, { limite: 2826, taxa: 0.075 }, { limite: 3751, taxa: 0.15 }, { limite: 4664, taxa: 0.225 }, { limite: Infinity, taxa: 0.275 }],
    moedas: ['BRL']
  },
  outro: {
    nome: 'Outro (Manual)',
    inss: 0,
    irt: [{ limite: Infinity, taxa: 0 }],
    moedas: ['AOA', 'USD', 'EUR', 'BRL']
  }
}

const SIMBOLO_MOEDA: Record<string, string> = { AOA: 'Kz', USD: '$', EUR: '€', BRL: 'R$' }

export default function FolhaSalarial() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [showForm, setShowForm] = useState(false)
  const [paisSelecionado, setPaisSelecionado] = useState<'angola' | 'brasil' | 'outro'>('angola')
  const [moeda, setMoeda] = useState('AOA')
  const [isento, setIsento] = useState(false)
  
  const [formData, setFormData] = useState({
    funcionario: '',
    mesReferencia: new Date().toISOString().slice(0, 7),
    salarioBase: '',
    bonificacoes: '0',
    descontos: '0'
  })

  const [calculos, setCalculos] = useState({
    inss: 0, irt: 0, totalDescontos: 0, liquido: 0
  })

  const calcularIRT = (base: number, brackets: typeof CONFIG_FISCAL.angola.irt) => {
    let restante = base
    let imposto = 0
    let limiteAnterior = 0
    for (const b of brackets) {
      const parcela = Math.min(restante, b.limite) - limiteAnterior
      if (parcela > 0) {
        imposto += parcela * b.taxa
        limiteAnterior = b.limite
      } else {
        break
      }
    }
    return imposto
  }

  useEffect(() => {
    const config = CONFIG_FISCAL[paisSelecionado]
    const base = parseFloat(formData.salarioBase) || 0
    const bonus = parseFloat(formData.bonificacoes) || 0
    
    // Se for isento, impostos são zero
    const inss = isento ? 0 : base * config.inss
    const baseTributavel = base + bonus
    const irt = isento ? 0 : calcularIRT(baseTributavel, config.irt)
    const descManuais = parseFloat(formData.descontos) || 0
    
    setCalculos({
      inss,
      irt,
      totalDescontos: inss + irt + descManuais,
      liquido: baseTributavel - inss - irt - descManuais
    })
  }, [formData.salarioBase, formData.bonificacoes, formData.descontos, paisSelecionado, isento])

  useEffect(() => {
    const moedasDisponiveis = CONFIG_FISCAL[paisSelecionado].moedas
    if (!moedasDisponiveis.includes(moeda)) setMoeda(moedasDisponiveis[0])
  }, [paisSelecionado])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.funcionario || !formData.salarioBase) {
      toast.error('Preenche o nome e o salário base!')
      return
    }

    const novoPagamento: Pagamento = {
      id: Date.now().toString(),
      funcionario: formData.funcionario,
      mesReferencia: formData.mesReferencia,
      pais: CONFIG_FISCAL[paisSelecionado].nome,
      moeda,
      salarioBase: parseFloat(formData.salarioBase),
      bonificacoes: parseFloat(formData.bonificacoes),
      inss: calculos.inss,
      irt: calculos.irt,
      descontos: parseFloat(formData.descontos),
      salarioLiquido: calculos.liquido,
      isento,
      dataPagamento: new Date().toLocaleDateString('pt-PT')
    }

    setPagamentos([novoPagamento, ...pagamentos])
    setFormData({ funcionario: '', mesReferencia: new Date().toISOString().slice(0, 7), salarioBase: '', bonificacoes: '0', descontos: '0' })
    setIsento(false)
    setShowForm(false)
    toast.success(`Pagamento registado! ${isento ? 'Regime Isento aplicado.' : 'Impostos calculados.'}`)
  }

  const imprimirRecibo = (p: Pagamento) => {
    const sym = SIMBOLO_MOEDA[p.moeda] || ''
    const conteudo = `
      <html>
      <head><title>Recibo - ${p.funcionario}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #111; padding-bottom: 15px; margin-bottom: 25px; }
        .row { display: flex; justify-content: space-between; margin: 8px 0; border-bottom: 1px dotted #ccc; padding-bottom: 4px; }
        .total { font-size: 1.8em; font-weight: bold; margin-top: 25px; text-align: right; color: #111; }
        .footer { margin-top: 50px; text-align: center; font-size: 0.9em; color: #666; }
        .badge { padding: 3px 8px; border-radius: 4px; font-size: 0.85em; font-weight: bold; }
        .badge-isento { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
        .badge-fiscal { background: #eee; color: #333; }
      </style>
      </head>
      <body>
        <div class="header">
          <h1>Recibo de Vencimento</h1>
          <p>Origem Creative SLJR</p>
          ${p.isento ? '<span class="badge badge-isento">REGIME: ISENTO DE IMPOSTOS</span>' : '<span class="badge badge-fiscal">REGIME: NORMAL</span>'}
        </div>
        <p><strong>Funcionário:</strong> ${p.funcionario}</p>
        <p><strong>Mês Referência:</strong> ${p.mesReferencia}</p>
        <div class="row"><span>Salário Base:</span><span>${p.salarioBase.toFixed(2)} ${sym}</span></div>
        <div class="row"><span>Bonificações:</span><span>+${p.bonificacoes.toFixed(2)} ${sym}</span></div>
        ${!p.isento ? `
          <div class="row" style="color:#d9534f"><span>INSS:</span><span>-${p.inss.toFixed(2)} ${sym}</span></div>
          <div class="row" style="color:#d9534f"><span>IRT:</span><span>-${p.irt.toFixed(2)} ${sym}</span></div>
        ` : '<div class="row" style="color:#166534"><span>Impostos (INSS/IRT):</span><span>0,00 ${sym} (Isento)</span></div>'}
        ${p.descontos > 0 ? `<div class="row" style="color:#d9534f"><span>Outros Descontos:</span><span>-${p.descontos.toFixed(2)} ${sym}</span></div>` : ''}
        <div class="total">Total a Pagar: ${p.salarioLiquido.toFixed(2)} ${sym}</div>
        <div class="footer"><p>Assinatura Empregador: __________________________</p><p>Data: ${p.dataPagamento}</p></div>
      </body>
      </html>
    `
    const janela = window.open('', '', 'width=650,height=850')
    janela?.document.write(conteudo)
    janela?.document.close()
    janela?.print()
  }

  const sym = SIMBOLO_MOEDA[moeda] || ''

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px'}}>
        <h2 style={{fontSize: '28px', fontWeight: 'bold', margin: 0}}>Folha Salarial & Fiscal</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{padding: '12px 24px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '500'}}
        >
          {showForm ? 'Cancelar' : '+ Novo Pagamento'}
        </button>
      </div>

      {showForm && (
        <div style={{background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '32px'}}>
          <h3 style={{marginTop: 0, marginBottom: '24px', fontSize: '20px'}}>Registar Pagamento</h3>
          <form onSubmit={handleSubmit}>
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px', padding: '16px', background: '#0f172a', borderRadius: '8px'}}>
              <div>
                <label style={{display: 'block', marginBottom: '8px', color: '#94a3b8'}}>País / Região</label>
                <select value={paisSelecionado} onChange={(e) => setPaisSelecionado(e.target.value as any)} style={{width: '100%', padding: '10px 14px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0', fontSize: '15px'}}>
                  <option value="angola">🇦🇴 Angola (IRT Progressivo + INSS 3%)</option>
                  <option value="brasil">🇧🇷 Brasil</option>
                  <option value="outro">🌍 Outro</option>
                </select>
              </div>
              <div>
                <label style={{display: 'block', marginBottom: '8px', color: '#94a3b8'}}>Moeda</label>
                <select value={moeda} onChange={(e) => setMoeda(e.target.value)} style={{width: '100%', padding: '10px 14px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0', fontSize: '15px'}}>
                  {CONFIG_FISCAL[paisSelecionado].moedas.map(m => (<option key={m} value={m}>{m === 'AOA' ? 'Kwanza (AOA)' : m === 'USD' ? 'Dólar (USD)' : m === 'EUR' ? 'Euro (EUR)' : m}</option>))}
                </select>
              </div>
            </div>

            {/* Toggle de Isenção */}
            <div style={{marginBottom: '24px', padding: '12px 16px', background: isento ? '#14532d' : '#1e293b', border: `1px solid ${isento ? '#22c55e' : '#334155'}`, borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s'}}>
              <div>
                <div style={{fontWeight: 'bold', color: isento ? '#4ade80' : '#e2e8f0'}}>Aplicar Regime de Isenção Fiscal?</div>
                <div style={{fontSize: '13px', color: '#94a3b8'}}>Zera automaticamente INSS e IRT. Ideal para voluntários ou contratos especiais.</div>
              </div>
              <button type="button" onClick={() => setIsento(!isento)} style={{width: '48px', height: '26px', borderRadius: '13px', border: 'none', cursor: 'pointer', position: 'relative', background: isento ? '#22c55e' : '#475569', transition: 'background 0.2s'}}>
                <div style={{width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: isento ? '25px' : '3px', transition: 'left 0.2s'}} />
              </button>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '24px'}}>
              <div>
                <label style={{display: 'block', marginBottom: '8px', color: '#94a3b8'}}>Nome do Funcionário *</label>
                <input type="text" required placeholder="Ex: João Manuel" value={formData.funcionario} onChange={(e) => setFormData({...formData, funcionario: e.target.value})} style={{width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0', fontSize: '15px'}} />
              </div>
              <div>
                <label style={{display: 'block', marginBottom: '8px', color: '#94a3b8'}}>Mês Referência *</label>
                <input type="month" required value={formData.mesReferencia} onChange={(e) => setFormData({...formData, mesReferencia: e.target.value})} style={{width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0', fontSize: '15px'}} />
              </div>
            </div>

            <h4 style={{color: '#94a3b8', marginBottom: '12px', marginTop: '24px', borderTop: '1px solid #334155', paddingTop: '20px'}}>💵 Detalhes Financeiros ({sym})</h4>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px'}}>
              <div>
                <label style={{display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: '500'}}>Salário Base *</label>
                <input type="number" required placeholder="0.00" value={formData.salarioBase} onChange={(e) => setFormData({...formData, salarioBase: e.target.value})} style={{width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0', fontSize: '15px'}} />
              </div>
              <div>
                <label style={{display: 'block', marginBottom: '8px', color: '#10b981'}}>Bonificações</label>
                <input type="number" placeholder="0.00" value={formData.bonificacoes} onChange={(e) => setFormData({...formData, bonificacoes: e.target.value})} style={{width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0', fontSize: '15px'}} />
              </div>
              <div>
                <label style={{display: 'block', marginBottom: '8px', color: '#ef4444'}}>Outros Descontos</label>
                <input type="number" placeholder="0.00" value={formData.descontos} onChange={(e) => setFormData({...formData, descontos: e.target.value})} style={{width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0', fontSize: '15px'}} />
              </div>
            </div>

            <div style={{marginBottom: '24px', padding: '16px', background: '#0f172a', borderRadius: '8px', border: '1px solid #334155'}}>
              <h4 style={{marginTop: 0, marginBottom: '12px', color: '#94a3b8'}}>📊 Simulação {isento && <span style={{color: '#4ade80'}}>(Isento)</span>}</h4>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '14px'}}>
                <div style={{color: '#94a3b8'}}>
                  <span>INSS:</span>
                  <div style={{fontSize: '18px', fontWeight: 'bold', color: isento ? '#4ade80' : '#ef4444'}}>{isento ? 'ISENTO' : `-${calculos.inss.toFixed(2)} ${sym}`}</div>
                </div>
                <div style={{color: '#94a3b8'}}>
                  <span>IRT:</span>
                  <div style={{fontSize: '18px', fontWeight: 'bold', color: isento ? '#4ade80' : '#ef4444'}}>{isento ? 'ISENTO' : `-${calculos.irt.toFixed(2)} ${sym}`}</div>
                </div>
                <div style={{color: '#94a3b8'}}>
                  <span>Salário Líquido:</span>
                  <div style={{fontSize: '20px', fontWeight: 'bold', color: '#10b981'}}>{calculos.liquido.toFixed(2)} {sym}</div>
                </div>
              </div>
            </div>

            <div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
              <button type="button" onClick={() => setShowForm(false)} style={{padding: '10px 20px', background: '#334155', color: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px'}}>Cancelar</button>
              <button type="submit" style={{padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '500'}}>✅ Guardar Pagamento</button>
            </div>
          </form>
        </div>
      )}

      <div style={{background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden'}}>
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead style={{background: '#0f172a'}}>
            <tr>
              <th style={{padding: '16px', textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8'}}>Funcionário / Ref</th>
              <th style={{padding: '16px', textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8'}}>Base</th>
              <th style={{padding: '16px', textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8'}}>INSS / IRT</th>
              <th style={{padding: '16px', textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8'}}>Líquido</th>
              <th style={{padding: '16px', textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8'}}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pagamentos.length === 0 ? (
              <tr><td colSpan={5} style={{padding: '48px', textAlign: 'center', color: '#64748b'}}>Nenhum pagamento registado.</td></tr>
            ) : (
              pagamentos.map((p) => (
                <tr key={p.id} style={{borderTop: '1px solid #334155'}}>
                  <td style={{padding: '16px', color: '#e2e8f0'}}>
                    <div style={{fontWeight: '500'}}>{p.funcionario} {p.isento && <span style={{fontSize: '11px', background: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px'}}>Isento</span>}</div>
                    <div style={{fontSize: '12px', color: '#94a3b8'}}>Ref: {p.mesReferencia}</div>
                  </td>
                  <td style={{padding: '16px', color: '#94a3b8'}}>{p.salarioBase.toFixed(2)} {SIMBOLO_MOEDA[p.moeda]}</td>
                  <td style={{padding: '16px', fontSize: '13px', color: p.isento ? '#4ade80' : '#ef4444'}}>
                    {p.isento ? '0,00 (Isento)' : `-${p.inss.toFixed(2)} / -${p.irt.toFixed(2)}`}
                  </td>
                  <td style={{padding: '16px', color: '#10b981', fontWeight: 'bold', fontSize: '16px'}}>{p.salarioLiquido.toFixed(2)} {SIMBOLO_MOEDA[p.moeda]}</td>
                  <td style={{padding: '16px'}}>
                    <button onClick={() => imprimirRecibo(p)} style={{padding: '6px 12px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'}}>🖨️ Recibo</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
