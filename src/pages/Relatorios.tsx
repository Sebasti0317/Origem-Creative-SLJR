import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

export default function Relatorios({ role }) {
  const isEducador = role === 'educador'
  const [modulo, setModulo] = useState(isEducador ? 'criancas' : 'folha')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [busca, setBusca] = useState('')
  const [dados, setDados] = useState([])
  const [resumo, setResumo] = useState({ bruto: 0, descontos: 0, liquido: 0 })
  const [carregando, setCarregando] = useState(false)

  useEffect(() => { carregarDados() }, [modulo, dataInicio, dataFim, isEducador])

  const carregarDados = async () => {
    setCarregando(true)
    try {
      let lista = []
      const inicio = dataInicio ? new Date(dataInicio) : null
      const fim = dataFim ? new Date(dataFim) : null

      // 🔒 Segurança: Educador só vê crianças
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
      }

      // Filtros de data
      if (inicio || fim) {
        lista = lista.filter(item => {
          const ref = new Date(item.data_entrada || item.data_admissao || item.data_pagamento || item.created_at)
          return (!inicio || ref >= inicio) && (!fim || ref <= new Date(fim + 'T23:59:59'))
        })
      }

      // Filtro de texto
      if (busca.trim()) {
        const termo = busca.toLowerCase()
        lista = lista.filter(i => 
          (i.nome_completo?.toLowerCase().includes(termo)) || 
          (i.funcionario_nome?.toLowerCase().includes(termo)) ||
          (i.cargo?.toLowerCase().includes(termo))
        )
      }

      setDados(lista)

      // Cálculos de resumo (apenas para folha)
      if (moduloReal === 'folha') {
        const bruto = lista.reduce((acc, i) => acc + parseFloat(i.salario_base || 0), 0)
        const descontos = lista.reduce((acc, i) => acc + parseFloat(i.inss_valor || 0) + parseFloat(i.outros_descontos || 0), 0)
        const liquido = lista.reduce((acc, i) => acc + parseFloat(i.salario_liquido || 0), 0)
        setResumo({ bruto, descontos, liquido })
      } else {
        setResumo({ bruto: 0, descontos: 0, liquido: 0 })
      }
    } catch (e) {
      console.error('Erro relatório:', e)
      toast.error('Erro ao carregar dados')
    } finally {
      setCarregando(false)
    }
  }

  // ✅ Exportar CSV (Mantido)
  const exportarCSV = () => {
    if (!dados.length) return toast.error('Sem dados para exportar')
    const isFolha = modulo === 'folha'
    const headers = isFolha 
      ? ['Funcionário', 'Cargo', 'Salário Base', 'INSS', 'Outros Descontos', 'Salário Líquido', 'Data']
      : ['Nome', 'Tipo', 'Data', 'Detalhes']
    
    const rows = dados.map(i => isFolha ? [
      i.funcionario_nome || i.nome_completo,
      i.cargo || '-',
      (i.salario_base || 0).toFixed(2),
      (i.inss_valor || 0).toFixed(2),
      (i.outros_descontos || 0).toFixed(2),
      (i.salario_liquido || 0).toFixed(2),
      new Date(i.data_pagamento || Date.now()).toLocaleDateString('pt-PT')
    ] : [
      i.nome_completo || i.funcionario_nome || '-',
      i.tipo,
      new Date(i.data_entrada || i.data_admissao || i.data_pagamento || Date.now()).toLocaleDateString('pt-PT'),
      i.cargo ? `Cargo: ${i.cargo}` : ''
    ])

    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio_${modulo}_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exportado com sucesso!')
  }

  // 🖨️ Gerar PDF do Relatório Completo (Lista)
  const gerarPDFCompleto = () => {
    if (!dados.length) return toast.error('Sem dados para gerar PDF')
    const isFolha = modulo === 'folha'
    const titulo = isFolha ? 'Folha Salarial' : modulo === 'criancas' ? 'Registo de Crianças' : 'Registo de Funcionários'
    
    const conteudo = `<!DOCTYPE html>
    <html><head><title>${titulo}</title>
    <style>
      @media print { @page { margin: 15mm } body { -webkit-print-color-adjust: exact; } }
      body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; max-width: 900px; margin: 0 auto; color: #1e293b; }
      .header { text-align: center; margin-bottom: 25px; border-bottom: 3px solid #6366f1; padding-bottom: 15px; }
      .header h1 { margin: 0; font-size: 22px; color: #0f172a; }
      .header p { margin: 5px 0 0; color: #64748b; font-size: 13px; }
      .meta { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px; color: #475569; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
      th { background: #6366f1; color: white; padding: 10px; text-align: left; font-weight: 600; }
      td { padding: 9px 10px; border-bottom: 1px solid #e2e8f0; }
      tr:nth-child(even) { background: #f8fafc; }
      .total-row { font-weight: bold; background: #f1f5f9; }
      .footer { margin-top: 30px; text-align: center; color: #94a3b8; font-size: 11px; border-top: 1px solid #e2e8f0; padding-top: 15px; }
      .badge { padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; }
      .badge-c { background: #dbeafe; color: #1d4ed8; }
      .badge-f { background: #dcfce7; color: #15803d; }
      .badge-p { background: #fef3c7; color: #b45309; }
      .resumo { display: flex; gap: 15px; margin: 20px 0; }
      .resumo-card { flex: 1; background: #f8fafc; padding: 12px; border-radius: 6px; text-align: center; border: 1px solid #e2e8f0; }
      .resumo-card b { display: block; font-size: 18px; color: #0f172a; margin-bottom: 4px; }
      .resumo-card span { font-size: 12px; color: #64748b; }
    </style></head><body>
    <div class="header"><h1>Origem Creative SLJR</h1><p>${titulo} | Emitido em ${new Date().toLocaleDateString('pt-PT')}</p></div>
    <div class="meta"><span>Período: ${dataInicio ? new Date(dataInicio).toLocaleDateString('pt-PT') : 'Início'} até ${dataFim ? new Date(dataFim).toLocaleDateString('pt-PT') : 'Atual'}</span><span>Registos: ${dados.length}</span></div>
    ${isFolha ? `
    <div class="resumo">
      <div class="resumo-card"><b>${resumo.bruto.toLocaleString('pt-AO')} Kz</b><span>Total Bruto</span></div>
      <div class="resumo-card"><b>${resumo.descontos.toLocaleString('pt-AO')} Kz</b><span>Descontos</span></div>
      <div class="resumo-card"><b style="color:#10b981">${resumo.liquido.toLocaleString('pt-AO')} Kz</b><span>Total Líquido</span></div>
    </div>` : ''}
    <table><thead><tr>
      ${isFolha ? '<th>Funcionário</th><th>Cargo</th><th>Base</th><th>INSS</th><th>Líquido</th><th>Data</th>' 
                 : '<th>Nome</th><th>Tipo</th><th>Data</th><th>Detalhes</th>'}
    </tr></thead><tbody>
    ${dados.map(i => `<tr>
      ${isFolha ? `
        <td>${i.funcionario_nome || i.nome_completo || '-'}</td>
        <td>${i.cargo || '-'}</td>
        <td>${parseFloat(i.salario_base||0).toLocaleString('pt-AO')} Kz</td>
        <td>${parseFloat(i.inss_valor||0).toLocaleString('pt-AO')} Kz</td>
        <td style="color:#10b981;font-weight:600">${parseFloat(i.salario_liquido||0).toLocaleString('pt-AO')} Kz</td>
        <td>${new Date(i.data_pagamento || Date.now()).toLocaleDateString('pt-PT')}</td>` 
        : `
        <td>${i.nome_completo || i.funcionario_nome || '-'}</td>
        <td><span class="badge ${i.tipo==='Criança'?'badge-c':i.tipo==='Funcionário'?'badge-f':'badge-p'}">${i.tipo}</span></td>
        <td>${new Date(i.data_entrada||i.data_admissao||i.data_pagamento||Date.now()).toLocaleDateString('pt-PT')}</td>
        <td>${i.cargo ? `Cargo: ${i.cargo}` : '-'}</td>`}
    </tr>`).join('')}
    ${isFolha ? `<tr class="total-row"><td colspan="2">TOTAIS</td><td>${resumo.bruto.toLocaleString('pt-AO')} Kz</td><td>${resumo.descontos.toLocaleString('pt-AO')} Kz</td><td style="color:#10b981">${resumo.liquido.toLocaleString('pt-AO')} Kz</td><td></td></tr>` : ''}
    </tbody></table>
    <div class="footer">Origem Creative SLJR | Sistema de Gestão Interno | ${new Date().getFullYear()}</div>
    </body></html>`

    const win = window.open('', '_blank')
    if (win) { 
      win.document.write(conteudo); 
      win.document.close(); 
      // Aguarda carregar e abre impressão
      setTimeout(() => win.print(), 500); 
    }
    toast.success('Janela de PDF aberta!')
  }

  // 🧾 Imprimir Recibo Individual de Funcionário
  const imprimirFolhaUnica = (item) => {
    const funcionario = item.funcionario_nome || item.nome_completo || 'Funcionário'
    const base = parseFloat(item.salario_base || 0)
    const inss = parseFloat(item.inss_valor || 0)
    const outros = parseFloat(item.outros_descontos || 0)
    const liquido = parseFloat(item.salario_liquido || 0)
    
    const conteudo = `<!DOCTYPE html>
    <html><head><title>Recibo - ${funcionario}</title>
    <style>
      @media print { @page { size: A5 landscape; margin: 10mm } }
      body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; max-width: 700px; margin: 0 auto; color: #1e293b; background: #f8fafc; }
      .recibo { background: white; padding: 30px; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
      .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #6366f1; padding-bottom: 20px; }
      .header h2 { margin: 0; color: #0f172a; }
      .header p { margin: 5px 0 0; color: #64748b; font-size: 12px; }
      .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
      .info-item label { display: block; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
      .info-item span { font-size: 15px; font-weight: 500; color: #334155; }
      .tabela-valores { width: 100%; border-collapse: collapse; margin-top: 20px; }
      .tabela-valores th { text-align: left; padding: 12px; background: #f1f5f9; color: #475569; font-size: 12px; }
      .tabela-valores td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
      .total-row { background: #f8fafc; font-weight: bold; }
      .total-liquido { color: #10b981; font-size: 18px; }
      .footer { margin-top: 40px; text-align: center; color: #94a3b8; font-size: 10px; border-top: 1px solid #e2e8f0; padding-top: 15px; }
    </style></head><body>
    <div class="recibo">
      <div class="header">
        <h2>Recibo de Vencimento</h2>
        <p>Origem Creative SLJR | ${new Date(item.data_pagamento || Date.now()).toLocaleDateString('pt-PT', {month:'long', year:'numeric'})}</p>
      </div>
      
      <div class="info-grid">
        <div class="info-item"><label>Funcionário</label><span>${funcionario}</span></div>
        <div class="info-item"><label>Cargo</label><span>${item.cargo || '-'}</span></div>
        <div class="info-item"><label>Data de Pagamento</label><span>${new Date(item.data_pagamento || Date.now()).toLocaleDateString('pt-PT')}</span></div>
      </div>

      <table class="tabela-valores">
        <thead><tr><th>Descrição</th><th style="text-align:right">Valor</th></tr></thead>
        <tbody>
          <tr><td>Salário Base</td><td style="text-align:right">${base.toLocaleString('pt-AO')} Kz</td></tr>
          ${inss > 0 ? `<tr><td style="color:#ef4444">Desconto INSS</td><td style="text-align:right;color:#ef4444">- ${inss.toLocaleString('pt-AO')} Kz</td></tr>` : ''}
          ${outros > 0 ? `<tr><td style="color:#ef4444">Outros Descontos</td><td style="text-align:right;color:#ef4444">- ${outros.toLocaleString('pt-AO')} Kz</td></tr>` : ''}
          <tr class="total-row">
            <td>VALOR LÍQUIDO A PAGAR</td>
            <td style="text-align:right" class="total-liquido">${liquido.toLocaleString('pt-AO')} Kz</td>
          </tr>
        </tbody>
      </table>

      <div class="footer">Documento gerado automaticamente pelo sistema | ${new Date().toLocaleDateString('pt-PT')}</div>
    </div>
    <script>window.onload = function(){ window.print(); }</script>
    </body></html>`

    const win = window.open('', '_blank', 'width=800,height=600')
    if (win) { win.document.write(conteudo); win.document.close(); }
  }

  const limparFiltros = () => { setDataInicio(''); setDataFim(''); setBusca('') }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 'bold', margin: 0 }}>Relatórios</h2>
          {isEducador && <p style={{ color: '#f59e0b', fontSize: 12, fontWeight: 600, marginTop: 4 }}>⚠️ Acesso restrito: Apenas Crianças</p>}
        </div>
        {!isEducador && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={exportarCSV} style={{ padding: '8px 14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>📥 Baixar CSV</button>
            <button onClick={gerarPDFCompleto} style={{ padding: '8px 14px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>🖨️ Gerar PDF</button>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div style={{ background: '#1e293b', padding: 14, borderRadius: 10, border: '1px solid #334155', marginBottom: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
          {!isEducador && (
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4, display: 'block' }}>Módulo</label>
              <select value={modulo} onChange={e => setModulo(e.target.value)} style={{ width: '100%', padding: '8px', background: '#0f172a', border: '1px solid #334155', borderRadius: 4, color: '#fff', fontSize: 13 }}>
                <option value="folha">Folha Salarial</option>
                <option value="criancas">Crianças</option>
                <option value="funcionarios">Funcionários</option>
              </select>
            </div>
          )}
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4, display: 'block' }}>De</label>
            <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} style={{ width: '100%', padding: '8px', background: '#0f172a', border: '1px solid #334155', borderRadius: 4, color: '#fff', fontSize: 13 }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4, display: 'block' }}>Até</label>
            <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} style={{ width: '100%', padding: '8px', background: '#0f172a', border: '1px solid #334155', borderRadius: 4, color: '#fff', fontSize: 13 }} />
          </div>
          <div style={{ flex: 2 }}>
            <label style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4, display: 'block' }}>Pesquisar</label>
            <input type="text" value={busca} onChange={e => setBusca(e.target.value)} placeholder="Nome ou cargo..." style={{ width: '100%', padding: '8px', background: '#0f172a', border: '1px solid #334155', borderRadius: 4, color: '#fff', fontSize: 13 }} />
          </div>
          <button onClick={limparFiltros} style={{ padding: '8px 12px', background: '#334155', color: '#e2e8f0', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Limpar</button>
        </div>
      </div>

      {/* Cards de Resumo (Apenas Folha) */}
      {modulo === 'folha' && !isEducador && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
          <div style={{ background: '#1e293b', padding: 14, borderRadius: 8, border: '1px solid #334155', textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Salário Base Total</div>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#e2e8f0', marginTop: 4 }}>{resumo.bruto.toLocaleString('pt-AO')} Kz</div>
          </div>
          <div style={{ background: '#1e293b', padding: 14, borderRadius: 8, border: '1px solid #334155', textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Total Descontos</div>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#f87171', marginTop: 4 }}>{resumo.descontos.toLocaleString('pt-AO')} Kz</div>
          </div>
          <div style={{ background: '#1e293b', padding: 14, borderRadius: 8, border: '1px solid #334155', textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Salário Líquido Total</div>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#10b981', marginTop: 4 }}>{resumo.liquido.toLocaleString('pt-AO')} Kz</div>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div style={{ background: '#1e293b', borderRadius: 10, border: '1px solid #334155', overflow: 'hidden' }}>
        {carregando ? (
          <div style={{ padding: 30, textAlign: 'center', color: '#94a3b8' }}>A carregar dados...</div>
        ) : dados.length === 0 ? (
          <div style={{ padding: 30, textAlign: 'center', color: '#64748b' }}>Nenhum registo encontrado com os filtros atuais.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead style={{ background: '#0f172a' }}>
                <tr>
                  {modulo === 'folha' ? (
                    <>
                      <th style={{ padding: 12, textAlign: 'left', color: '#94a3b8' }}>Funcionário</th>
                      <th style={{ padding: 12, textAlign: 'left', color: '#94a3b8' }}>Cargo</th>
                      <th style={{ padding: 12, textAlign: 'right', color: '#94a3b8' }}>Base</th>
                      <th style={{ padding: 12, textAlign: 'right', color: '#94a3b8' }}>INSS</th>
                      <th style={{ padding: 12, textAlign: 'right', color: '#94a3b8' }}>Líquido</th>
                      <th style={{ padding: 12, textAlign: 'left', color: '#94a3b8' }}>Data</th>
                      <th style={{ padding: 12, textAlign: 'center', color: '#94a3b8' }}>Ações</th>
                    </>
                  ) : (
                    <>
                      <th style={{ padding: 12, textAlign: 'left', color: '#94a3b8' }}>Nome</th>
                      <th style={{ padding: 12, textAlign: 'left', color: '#94a3b8' }}>Tipo</th>
                      <th style={{ padding: 12, textAlign: 'left', color: '#94a3b8' }}>Data</th>
                      <th style={{ padding: 12, textAlign: 'left', color: '#94a3b8' }}>Detalhes</th>
                      <th style={{ padding: 12, textAlign: 'center', color: '#94a3b8' }}>Ações</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {dados.map((item, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #334155', background: i % 2 === 0 ? '#1e293b' : '#162032' }}>
                    {modulo === 'folha' ? (
                      <>
                        <td style={{ padding: 10, fontWeight: 500 }}>{item.funcionario_nome || item.nome_completo || '-'}</td>
                        <td style={{ padding: 10, color: '#cbd5e1' }}>{item.cargo || '-'}</td>
                        <td style={{ padding: 10, textAlign: 'right', color: '#94a3b8' }}>{parseFloat(item.salario_base||0).toLocaleString('pt-AO')} Kz</td>
                        <td style={{ padding: 10, textAlign: 'right', color: '#f87171' }}>{parseFloat(item.inss_valor||0).toLocaleString('pt-AO')} Kz</td>
                        <td style={{ padding: 10, textAlign: 'right', color: '#10b981', fontWeight: 600 }}>{parseFloat(item.salario_liquido||0).toLocaleString('pt-AO')} Kz</td>
                        <td style={{ padding: 10, color: '#64748b' }}>{new Date(item.data_pagamento || Date.now()).toLocaleDateString('pt-PT')}</td>
                        <td style={{ padding: 10, textAlign: 'center' }}>
                          <button onClick={() => imprimirFolhaUnica(item)} title="Imprimir Recibo" style={{ background: '#334155', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', color: '#fff', fontSize: 12 }}>🖨️</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ padding: 10, fontWeight: 500 }}>{item.nome_completo || item.funcionario_nome || '-'}</td>
                        <td style={{ padding: 10 }}>
                          <span style={{ padding: '2px 8px', background: item.tipo==='Criança'?'#6366f120':item.tipo==='Funcionário'?'#10b98120':'#f59e0b20', borderRadius: 4, fontSize: 11 }}>
                            {item.tipo}
                          </span>
                        </td>
                        <td style={{ padding: 10, color: '#64748b' }}>{new Date(item.data_entrada || item.data_admissao || item.data_pagamento || Date.now()).toLocaleDateString('pt-PT')}</td>
                        <td style={{ padding: 10, color: '#64748b' }}>{item.cargo ? `Cargo: ${item.cargo}` : '-'}</td>
                        <td style={{ padding: 10, textAlign: 'center' }}>
                          <button onClick={() => imprimirFolhaUnica(item)} title="Imprimir" style={{ background: '#334155', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', color: '#fff', fontSize: 12 }}>️</button>
                        </td>
                      </>
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
