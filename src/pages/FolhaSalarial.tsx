import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface Pagamento {
  id: string
  funcionario: string
  mesReferencia: string
  salarioBase: number
  bonificacoes: number
  descontos: number
  salarioLiquido: number
  dataPagamento: string
}

export default function FolhaSalarial() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [showForm, setShowForm] = useState(false)
  
  const [formData, setFormData] = useState({
    funcionario: '',
    mesReferencia: new Date().toISOString().slice(0, 7), // YYYY-MM
    salarioBase: '',
    bonificacoes: '0',
    descontos: '0'
  })

  const [salarioLiquido, setSalarioLiquido] = useState(0)

  // Cálculo automático
  useEffect(() => {
    const base = parseFloat(formData.salarioBase) || 0
    const bonus = parseFloat(formData.bonificacoes) || 0
    const desc = parseFloat(formData.descontos) || 0
    setSalarioLiquido(base + bonus - desc)
  }, [formData.salarioBase, formData.bonificacoes, formData.descontos])

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
      salarioBase: parseFloat(formData.salarioBase),
      bonificacoes: parseFloat(formData.bonificacoes),
      descontos: parseFloat(formData.descontos),
      salarioLiquido: salarioLiquido,
      dataPagamento: new Date().toLocaleDateString('pt-PT')
    }

    setPagamentos([novoPagamento, ...pagamentos])
    setFormData({
      funcionario: '',
      mesReferencia: new Date().toISOString().slice(0, 7),
      salarioBase: '',
      bonificacoes: '0',
      descontos: '0'
    })
    setShowForm(false)
    toast.success('Pagamento registado!')
  }

  const imprimirRecibo = (p: Pagamento) => {
    const conteudo = `
      <html>
      <head><title>Recibo - ${p.funcionario}</title>
      <style>
        body { font-family: sans-serif; padding: 40px; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; }
        .row { display: flex; justify-content: space-between; margin: 10px 0; border-bottom: 1px dotted #ccc; }
        .total { font-size: 1.5em; font-weight: bold; margin-top: 20px; text-align: right; }
        .footer { margin-top: 40px; text-align: center; font-size: 0.8em; }
      </style>
      </head>
      <body>
        <div class="header"><h1>Recibo de Vencimento</h1><p>Origem Creative SLJR</p></div>
        <p><strong>Funcionário:</strong> ${p.funcionario}</p>
        <p><strong>Mês Referência:</strong> ${p.mesReferencia}</p>
        <div class="row"><span>Salário Base:</span><span>${p.salarioBase.toFixed(2)} AKZ</span></div>
        <div class="row"><span>Bonificações:</span><span>+${p.bonificacoes.toFixed(2)} AKZ</span></div>
        <div class="row"><span>Descontos:</span><span>-${p.descontos.toFixed(2)} AKZ</span></div>
        <div class="total">Total a Pagar: ${p.salarioLiquido.toFixed(2)} AKZ</div>
        <div class="footer"><p>Assinatura: __________________________</p><p>Data: ${p.dataPagamento}</p></div>
      </body>
      </html>
    `
    const janela = window.open('', '', 'width=600,height=800')
    janela?.document.write(conteudo)
    janela?.document.close()
    janela?.print()
  }

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px'}}>
        <h2 style={{fontSize: '28px', fontWeight: 'bold', margin: 0}}>Folha Salarial</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '12px 24px',
            background: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: '500'
          }}
        >
          {showForm ? 'Cancelar' : '+ Novo Pagamento'}
        </button>
      </div>

      {showForm && (
        <div style={{
          background: '#1e293b',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #334155',
          marginBottom: '32px'
        }}>
          <h3 style={{marginTop: 0, marginBottom: '24px', fontSize: '20px'}}>Registar Pagamento</h3>
          <form onSubmit={handleSubmit}>
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px'}}>
              <div>
                <label style={{display: 'block', marginBottom: '8px', color: '#94a3b8'}}>Funcionário *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do funcionário"
                  value={formData.funcionario}
                  onChange={(e) => setFormData({...formData, funcionario: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#e2e8f0',
                    fontSize: '15px'
                  }}
                />
              </div>
              <div>
                <label style={{display: 'block', marginBottom: '8px', color: '#94a3b8'}}>Mês Referência *</label>
                <input
                  type="month"
                  required
                  value={formData.mesReferencia}
                  onChange={(e) => setFormData({...formData, mesReferencia: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#e2e8f0',
                    fontSize: '15px'
                  }}
                />
              </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px'}}>
              <div>
                <label style={{display: 'block', marginBottom: '8px', color: '#94a3b8'}}>Salário Base *</label>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  value={formData.salarioBase}
                  onChange={(e) => setFormData({...formData, salarioBase: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#e2e8f0',
                    fontSize: '15px'
                  }}
                />
              </div>
              <div>
                <label style={{display: 'block', marginBottom: '8px', color: '#10b981'}}>Bonificações</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={formData.bonificacoes}
                  onChange={(e) => setFormData({...formData, bonificacoes: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#e2e8f0',
                    fontSize: '15px'
                  }}
                />
              </div>
              <div>
                <label style={{display: 'block', marginBottom: '8px', color: '#ef4444'}}>Descontos</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={formData.descontos}
                  onChange={(e) => setFormData({...formData, descontos: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#e2e8f0',
                    fontSize: '15px'
                  }}
                />
              </div>
            </div>

            <div style={{
              marginBottom: '24px',
              padding: '16px',
              background: '#0f172a',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{color: '#94a3b8', fontSize: '16px'}}>Salário Líquido a Pagar:</span>
              <span style={{color: '#6366f1', fontSize: '24px', fontWeight: 'bold'}}>{salarioLiquido.toFixed(2)} AKZ</span>
            </div>

            <div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  padding: '10px 20px',
                  background: '#334155',
                  color: '#e2e8f0',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '15px'
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '500'
                }}
              >
                Guardar Pagamento
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Pagamentos */}
      <div style={{
        background: '#1e293b',
        borderRadius: '12px',
        border: '1px solid #334155',
        overflow: 'hidden'
      }}>
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead style={{background: '#0f172a'}}>
            <tr>
              <th style={{padding: '16px', textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8'}}>Funcionário / Mês</th>
              <th style={{padding: '16px', textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8'}}>Base</th>
              <th style={{padding: '16px', textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8'}}>Bónus / Desc.</th>
              <th style={{padding: '16px', textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8'}}>Líquido</th>
              <th style={{padding: '16px', textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8'}}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pagamentos.length === 0 ? (
              <tr>
                <td colSpan={5} style={{padding: '48px', textAlign: 'center', color: '#64748b'}}>
                  Nenhum pagamento registado.
                </td>
              </tr>
            ) : (
              pagamentos.map((p) => (
                <tr key={p.id} style={{borderTop: '1px solid #334155'}}>
                  <td style={{padding: '16px', color: '#e2e8f0'}}>
                    <div style={{fontWeight: '500'}}>{p.funcionario}</div>
                    <div style={{fontSize: '12px', color: '#94a3b8'}}>Ref: {p.mesReferencia}</div>
                  </td>
                  <td style={{padding: '16px', color: '#94a3b8'}}>{p.salarioBase.toFixed(2)} AKZ</td>
                  <td style={{padding: '16px', fontSize: '13px', color: '#94a3b8'}}>
                    <div style={{color: '#10b981'}}>+{p.bonificacoes.toFixed(2)}</div>
                    <div style={{color: '#ef4444'}}>-{p.descontos.toFixed(2)}</div>
                  </td>
                  <td style={{padding: '16px', color: '#6366f1', fontWeight: 'bold', fontSize: '18px'}}>
                    {p.salarioLiquido.toFixed(2)} AKZ
                  </td>
                  <td style={{padding: '16px'}}>
                    <button
                      onClick={() => imprimirRecibo(p)}
                      style={{
                        padding: '6px 12px',
                        background: '#6366f1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      🖨️ Recibo
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{marginTop: '24px', padding: '16px', background: '#0f172a', borderRadius: '8px', border: '1px solid #334155'}}>
        <p style={{margin: 0, color: '#94a3b8'}}>
          Total de folhas processadas: <strong style={{color: '#6366f1'}}>{pagamentos.length}</strong>
        </p>
      </div>
    </div>
  )
}
