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

  useEffect(() => { carregarDados() }, [modulo, dataInicio, dataFim])

  const carregarDados = async () => {
    setCarregando(true)
    try {
      let lista = []
      const inicio = dataInicio ? new Date(dataInicio) : null
      const fim = dataFim ? new Date(dataFim) : null
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

      if (inicio || fim) {
        lista = lista.filter(item => {
          const ref = new Date(item.data_entrada || item.data_admissao || item.data_pagamento || item.created_at)
          return (!inicio || ref >= inicio) && (!fim || ref <= new Date(fim + 'T23:59:59'))
        })
      }
      if (busca.trim()) {
        const termo = busca.toLowerCase()
        lista = lista.filter(i => 
          (i.nome_completo?.toLowerCase().includes(termo)) || 
          (i.funcionario_nome?.toLowerCase().includes(termo)) ||
          (i.cargo?.toLowerCase().includes(termo)) ||
          (i.encarregado_nome?.toLowerCase().includes(termo))
        )
      }

      setDados(lista)
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

  const exportarCSV = () => {
    if (!dados.length) return toast.error('Sem dados para exportar')
    const isFolha = modulo === 'folha'
    const isFunc = modulo === 'funcionarios'
    const headers = isFolha 
      ? ['Funcionário', 'Cargo', 'Salário Base', 'INSS', 'Outros Descontos', 'Salário Líquido', 'Data']
      : isFunc ? ['Nome', 'Cargo', 'Admissão', 'Contacto', 'Estado']
      : ['Nome', 'Data Nasc.', 'Idade', 'Entrada', 'Encarregado', 'Contacto']
    
    const rows = dados.map(i => isFolha ? [
      i.funcionario_nome || i.nome_completo, i.cargo || '-',
      (i.salario_base || 0).toFixed(2), (i.inss_valor || 0).toFixed(2),
      (i.outros_descontos || 0).toFixed(2), (i.salario_liquido || 0).toFixed(2),
      new Date(i.data_pagamento || Date.now()).toLocaleDateString('pt-PT')
    ] : isFunc ? [
      i.nome_completo || '-', i.cargo || '-',
      new Date(i.data_admissao || i.data_entrada || i.created_at || Date.now()).toLocaleDateString('pt-PT'),
      i.contacto || i.telemovel || '-',
      i.ativo !== false ? 'Ativo' : 'Inativo'
    ] : [
      i.nome_completo || '-',
      i.data_nascimento ? new Date(i.data_nascimento).toLocaleDateString('pt-PT') : '-',
      i.data_nascimento ? Math.floor((new Date() - new Date(i.data_nascimento)) / 3.15576e10) + ' anos' : '-',
      new Date(i.data_entrada || i.data_admissao || i.created_at || Date.now()).toLocaleDateString('pt-PT'),
      i.encarregado_nome || '-',
      i.encarregado_contacto || '-'
    ])

    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `relatorio_${modulo}_${new Date().toISOString().slice(0,10)}.csv`; a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exportado com sucesso!')
  }

  const gerarPDFCompleto = () => {
    if (!dados.length) return toast.error('Sem dados para gerar PDF')
    const isFolha = modulo === 'folha'
    const isFunc = modulo === 'funcionarios'
    const isCriancas = modulo === 'criancas'
    const titulo = isFolha ? 'Folha Salarial' : isFunc ? 'Relatório de Funcionários' : 'Relatório de Crianças/Utentes'
    
    const conteudo = `<!DOCTYPE html><html><head><title>${titulo}</title>
    <style>
      @media print{@page{margin:15mm}body{-webkit-print-color-adjust:exact}}
      body{font-family:'Segoe UI',Arial,sans-serif;padding:30px;max-width:900px;margin:0 auto;color:#1e293b}
      .header{text-align:center;margin-bottom:25px;border-bottom:3px solid ${isFunc ? '#10b981' : '#6366f1'};padding-bottom:15px}
      .header h1{margin:0;font-size:22px;color:#0f172a}.header p{margin:5px 0 0;color:#64748b;font-size:13px}
      .meta{display:flex;justify-content:space-between;margin-bottom:20px;font-size:13px;color:#475569}
      table{width:100%;border-collapse:collapse;margin-top:10px;font-size:13px}
      th{background:${isFunc ? '#10b981' : '#6366f1'};color:white;padding:10px;text-align:left;font-weight:600}
      td{padding:9px 10px;border-bottom:1px solid #e2e8f0}tr:nth-child(even){background:#f8fafc}
      .footer{margin-top:30px;text-align:center;color:#94a3b8;font-size:11px;border-top:1px solid #e2e8f0;padding-top:15px}
      .badge{padding:3px 8px;border-radius:4px;font-size:11px;font-weight:500;background:#dbeafe;color:#1d4ed8}
      .resumo{display:flex;gap:15px;margin:20px 0}.resumo-card{flex:1;background:#f8fafc;padding:12px;border-radius:6px;text-align:center;border:1px solid #e2e8f0}
      .resumo-card b{display:block;font-size:18px;color:#0f172a;margin-bottom:4px}
    </style></head><body>
    <div class="header"><h1>Origem Creative SLJR</h1><p>${titulo} | Emitido em ${new Date().toLocaleDateString('pt-PT')}</p></div>
    <div class="meta"><span>Período: ${dataInicio ? new Date(dataInicio).toLocaleDateString('pt-PT') : 'Início'} até ${dataFim ? new Date(dataFim).toLocaleDateString('pt-PT') : 'Atual'}</span><span>Registos: ${dados.length}</span></div>
    ${isFolha ? `<div class="resumo"><div class="resumo-card"><b>${resumo.bruto.toLocaleString('pt-AO')} Kz</b><span>Total Bruto</span></div><div class="resumo-card"><b>${resumo.descontos.toLocaleString('pt-AO')} Kz</b><span>Descontos</span></div><div class="resumo-card"><b style="color:#10b981">${resumo.liquido.toLocaleString('pt-AO')} Kz</b><span>Total Líquido</span></div></div>` : ''}
    <table><thead><tr>${isFolha ? '<th>Funcionário</th><th>Cargo</th><th>Base</th><th>INSS</th><th>Líquido</th><th>Data</th>' : isFunc ? '<th>Nome</th><th>Cargo</th><th>Admissão</th><th>Contacto</th><th>Estado</th>' : '<th>Nome</th><th>Data Nasc.</th><th>Entrada</th><th>Encarregado</th>'}</tr></thead><tbody>
    ${dados.map(i => `<tr>${isFolha ? `<td>${i.funcionario_nome||i.nome_completo||'-'}</td><td>${i.cargo||'-'}</td><td>${parseFloat(i.salario_base||0).toLocaleString('pt-AO')} Kz</td><td>${parseFloat(i.inss_valor||0).toLocaleString('pt-AO')} Kz</td><td style="color:#10b981;font-weight:600">${parseFloat(i.salario_liquido||0).toLocaleString('pt-AO')} Kz</td><td>${new Date(i.data_pagamento||Date.now()).toLocaleDateString('pt-PT')}</td>` : isFunc ? `<td>${i.nome_completo||'-'}</td><td>${i.cargo||'-'}</td><td>${new Date(i.data_admissao||i.data_entrada||i.created_at||Date.now()).toLocaleDateString('pt-PT')}</td><td>${i.contacto||i.telemovel||'-'}</td><td>${i.ativo!==false?'Ativo':'Inativo'}</td>` : `<td>${i.nome_completo||'-'}</td><td>${i.data_nascimento?new Date(i.data_nascimento).toLocaleDateString('pt-PT'):'-'}</td><td>${new Date(i.data_entrada||i.data_admissao||i.created_at||Date.now()).toLocaleDateString('pt-PT')}</td><td>${i.encarregado_nome||'-'}</td>`}</tr>`).join('')}</tbody></table>
    <div class="footer">Origem Creative SLJR | Sistema de Gestão Interno | ${new Date().getFullYear()}</div></body></html>`
    const win = window.open('', '_blank')
    if (win) { win.document.write(conteudo); win.document.close(); setTimeout(() => win.print(), 500) }
    toast.success('Janela de PDF aberta!')
  }

  // 🧾 FICHA INDIVIDUAL: CRIANÇAS/UTENTES
  const imprimirFichaIndividual = async (item) => {
    const loading = toast.loading('A gerar ficha individual...')
    try {
      const { data: config } = await supabase.from('configuracoes_sistema').select('nome_instituicao').limit(1).single()
      const nomeInst = config?.nome_instituicao || 'Instituição'
      const nascimento = item.data_nascimento ? new Date(item.data_nascimento) : null
      const idade = nascimento ? Math.floor((new Date() - nascimento) / 3.15576e10) : 0
      const entrada = item.data_entrada || item.data_admissao || item.created_at
      const isCrianca = idade < 18
      const tituloFicha = isCrianca ? 'Ficha Individual da Criança' : 'Ficha Individual do Utente'
      const labelEncarregado = isCrianca ? 'Encarregado de Educação' : 'Contacto de Emergência'

      const conteudo = `<!DOCTYPE html><html><head><title>${tituloFicha} - ${item.nome_completo}</title>
      <style>
        @media print{@page{size:A4;margin:15mm}body{-webkit-print-color-adjust:exact}}
        body{font-family:'Segoe UI',Arial,sans-serif;padding:20px;max-width:750px;margin:0 auto;color:#0f172a;background:#f8fafc}
        .ficha{background:white;padding:30px;border:1px solid #e2e8f0;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.04)}
        .header{text-align:center;margin-bottom:25px;border-bottom:2px solid #6366f1;padding-bottom:15px}
        .header h2{margin:0;color:#1e293b;font-size:20px}.header p{margin:4px 0 0;color:#64748b;font-size:12px}
        .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:25px}
        .info-item label{display:block;font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px}
        .info-item span{font-size:14px;font-weight:500;color:#334155;padding:8px 0;border-bottom:1px dashed #e2e8f0;display:block}
        .secao{margin-top:20px;padding-top:15px;border-top:1px solid #e2e8f0}
        .secao h3{margin:0 0 12px;font-size:14px;color:#6366f1;text-transform:uppercase;letter-spacing:0.5px}
        .footer{margin-top:30px;text-align:center;color:#94a3b8;font-size:10px;border-top:1px solid #e2e8f0;padding-top:12px;display:flex;justify-content:space-between}
        .assinatura{border-top:1px solid #cbd5e1;margin-top:30px;padding-top:5px;width:45%;text-align:center;font-size:11px;color:#64748b}
        .badge-ativo{display:inline-block;padding:4px 10px;background:#dcfce7;color:#15803d;border-radius:12px;font-size:11px;font-weight:600}
        .badge-inativo{display:inline-block;padding:4px 10px;background:#fee2e2;color:#b91c1c;border-radius:12px;font-size:11px;font-weight:600}
      </style></head><body>
      <div class="ficha">
        <div class="header"><h2>${nomeInst}</h2><p>${tituloFicha} | ${new Date().toLocaleDateString('pt-PT')}</p></div>
        <div class="info-grid">
          <div class="info-item"><label>Nome Completo</label><span>${item.nome_completo || 'N/D'}</span></div>
          <div class="info-item"><label>Data de Nascimento</label><span>${nascimento ? nascimento.toLocaleDateString('pt-PT') : 'N/D'}</span></div>
          <div class="info-item"><label>Idade</label><span>${idade} anos</span></div>
          <div class="info-item"><label>Data de Entrada</label><span>${entrada ? new Date(entrada).toLocaleDateString('pt-PT') : 'N/D'}</span></div>
          <div class="info-item"><label>${labelEncarregado}</label><span>${item.encarregado_nome || 'N/D'}</span></div>
          <div class="info-item"><label>Contacto</label><span>${item.encarregado_contacto || 'N/D'}</span></div>
          <div class="info-item"><label>Estado</label><span><span class="${item.ativo !== false ? 'badge-ativo' : 'badge-inativo'}">${item.ativo !== false ? 'ATIVO' : 'INATIVO'}</span></span></div>
        </div>
        ${item.observacoes ? `<div class="secao"><h3>Observações</h3><p style="font-size:13px;color:#475569;line-height:1.5;margin:0">${item.observacoes}</p></div>` : ''}
        <div class="footer"><div class="assinatura">Assinatura do Responsável</div><div class="assinatura">Carimbo da Instituição</div></div>
        <div style="text-align:center;margin-top:15px;font-size:9px;color:#94a3b8;">Documento gerado automaticamente pelo sistema | ${new Date().toLocaleString('pt-PT')}</div>
      </div>
      <script>window.onload=function(){window.print();}</script></body></html>`

      const win = window.open('', '_blank', 'width=800,height=900')
      if (win) { win.document.write(conteudo); win.document.close(); }
      toast.dismiss(loading); toast.success('Ficha individual pronta para impressão!')
    } catch (e) {
      toast.dismiss(loading); toast.error('Erro ao gerar ficha'); console.error(e)
    }
  }

  // 🧾 FICHA INDIVIDUAL: FUNCIONÁRIOS (NOVA)
  const imprimirFichaFuncionario = async (f) => {
    const loading = toast.loading('A gerar ficha do funcionário...')
    try {
      const { data: config } = await supabase.from('configuracoes_sistema').select('nome_instituicao').limit(1).single()
      const nomeInst = config?.nome_instituicao || 'Instituição'
      const admissao = f.data_admissao || f.data_entrada || f.created_at
      const nascimento = f.data_nascimento ? new Date(f.data_nascimento) : null
      const idade = nascimento ? Math.floor((new Date() - nascimento) / 3.15576e10) : 'N/D'

      const conteudo = `<!DOCTYPE html><html><head><title>Ficha Funcionário - ${f.nome_completo}</title>
      <style>
        @media print{@page{size:A4;margin:15mm}body{-webkit-print-color-adjust:exact}}
        body{font-family:'Segoe UI',Arial,sans-serif;padding:20px;max-width:750px;margin:0 auto;color:#0f172a;background:#f8fafc}
        .ficha{background:white;padding:30px;border:1px solid #e2e8f0;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.04)}
        .header{text-align:center;margin-bottom:25px;border-bottom:2px solid #10b981;padding-bottom:15px}
        .header h2{margin:0;color:#1e293b;font-size:20px}.header p{margin:4px 0 0;color:#64748b;font-size:12px}
        .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:25px}
        .info-item label{display:block;font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px}
        .info-item span{font-size:14px;font-weight:500;color:#334155;padding:8px 0;border-bottom:1px dashed #e2e8f0;display:block}
        .secao{margin-top:20px;padding-top:15px;border-top:1px solid #e2e8f0}
        .secao h3{margin:0 0 12px;font-size:14px;color:#10b981;text-transform:uppercase;letter-spacing:0.5px}
        .footer{margin-top:30px;text-align:center;color:#94a3b8;font-size:10px;border-top:1px solid #e2e8f0;padding-top:12px;display:flex;justify-content:space-between}
        .assinatura{border-top:1px solid #cbd5e1;margin-top:30px;padding-top:5px;width:45%;text-align:center;font-size:11px;color:#64748b}
        .badge-ativo{display:inline-block;padding:4px 10px;background:#dcfce7;color:#15803d;border-radius:12px;font-size:11px;font-weight:600}
        .badge-inativo{display:inline-block;padding:4px 10px;background:#fee2e2;color:#b91c1c;border-radius:12px;font-size:11px;font-weight:600}
      </style></head><body>
      <div class="ficha">
        <div class="header"><h2>${nomeInst}</h2><p>Ficha Individual do Funcionário | ${new Date().toLocaleDateString('pt-PT')}</p></div>
        <div class="info-grid">
          <div class="info-item"><label>Nome Completo</label><span>${f.nome_completo || 'N/D'}</span></div>
          <div class="info-item"><label>Cargo/Função</label><span>${f.cargo || 'N/D'}</span></div>
          <div class="info-item"><label>Data de Nascimento</label><span>${nascimento ? nascimento.toLocaleDateString('pt-PT') : 'N/D'}</span></div>
          <div class="info-item"><label>Idade</label><span>${idade} anos</span></div>
          <div class="info-item"><label>Data de Admissão</label><span>${admissao ? new Date(admissao).toLocaleDateString('pt-PT') : 'N/D'}</span></div>
          <div class="info-item"><label>Contacto</label><span>${f.contacto || f.telemovel || 'N/D'}</span></div>
          <div class="info-item"><label>Email</label><span>${f.email || 'N/D'}</span></div>
          <div class="info-item"><label>Estado</label><span><span class="${f.ativo !== false ? 'badge-ativo' : 'badge-inativo'}">${f.ativo !== false ? 'ATIVO' : 'INATIVO'}</span></span></div>
        </div>
        ${f.observacoes ? `<div class="secao"><h3>Observações / Notas de RH</h3><p style="font-size:13px;color:#475569;line-height:1.5;margin:0">${f.observacoes}</p></div>` : ''}
        <div class="footer"><div class="assinatura">Assinatura do Funcionário</div><div class="assinatura">Assinatura da Direção/RH</div></div>
        <div style="text-align:center;margin-top:15px;font-size:9px;color:#94a3b8;">Documento gerado automaticamente pelo sistema | ${new Date().toLocaleString('pt-PT')}</div>
      </div>
      <script>window.onload=function(){window.print();}</script></body></html>`

      const win = window.open('', '_blank', 'width=800,height=900')
      if (win) { win.document.write(conteudo); win.document.close(); }
      toast.dismiss(loading); toast.success('Ficha do funcionário pronta para impressão!')
    } catch (e) {
      toast.dismiss(loading); toast.error('Erro ao gerar ficha'); console.error(e)
    }
  }

  // 🧾 RECIBO INDIVIDUAL: FOLHA SALARIAL
  const imprimirFolhaUnica = async (item) => {
    if (modulo !== 'folha') return;
    const loading = toast.loading('A gerar recibo...')
    try {
      const { data: config } = await supabase.from('configuracoes_sistema').select('nome_instituicao').limit(1).single()
      const nomeInstituicao = config?.nome_instituicao || 'Instituição'
      const base = parseFloat(item.salario_base || 0)
      const ferias = parseFloat(item.subsidio_ferias || item.ferias || 0)
      const natal = parseFloat(item.subsidio_natal || item.natal || 0)
      const outrosAbonos = parseFloat(item.outros_abonos || item.bonus || item.outros || 0)
      const inss = parseFloat(item.inss_valor || item.inss || 0)
      const outrosDescontos = parseFloat(item.outros_descontos || item.irs || 0)
      const liquido = parseFloat(item.salario_liquido || 0)
      const funcionario = item.funcionario_nome || item.nome_completo || 'Funcionário'
      const cargo = item.cargo || '-'
      const dataPagamento = new Date(item.data_pagamento || Date.now())
      const mesAno = dataPagamento.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })

      const conteudo = `<!DOCTYPE html><html><head><title>Recibo - ${funcionario}</title>
      <style>
        @media print { @page { size: A5 landscape; margin: 8mm } body { -webkit-print-color-adjust: exact; } }
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; max-width: 750px; margin: 0 auto; color: #0f172a; background: #f8fafc; }
        .recibo { background: white; padding: 25px; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #6366f1; padding-bottom: 15px; }
        .header h2 { margin: 0; color: #1e293b; font-size: 20px; }
        .header p { margin: 4px 0 0; color: #64748b; font-size: 12px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px; background: #f8fafc; padding: 12px; border-radius: 6px; }
        .info-item label { display: block; font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
        .info-item span { font-size: 14px; font-weight: 500; color: #334155; }
        .tabela-recibo { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
        .tabela-recibo th { text-align: left; padding: 10px 12px; background: #f1f5f9; color: #475569; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
        .tabela-recibo td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; }
        .secao-titulo { background: #f8fafc; font-weight: 700; color: #6366f1; padding: 8px 12px; font-size: 12px; letter-spacing: 0.5px; }
        .valor { text-align: right; font-family: 'Consolas', monospace; font-weight: 500; }
        .desconto { color: #ef4444; }
        .total-row { background: #f8fafc; font-weight: 700; border-top: 2px solid #e2e8f0; }
        .total-liquido { color: #10b981; font-size: 16px; }
        .footer { margin-top: 25px; text-align: center; color: #94a3b8; font-size: 10px; border-top: 1px solid #e2e8f0; padding-top: 12px; display: flex; justify-content: space-between; }
        .assinatura { border-top: 1px solid #cbd5e1; margin-top: 30px; padding-top: 5px; width: 45%; text-align: center; font-size: 11px; color: #64748b; }
      </style></head><body>
      <div class="recibo">
        <div class="header"><h2>${nomeInstituicao}</h2><p>Recibo de Vencimento | ${mesAno}</p></div>
        <div class="info-grid">
          <div class="info-item"><label>Funcionário</label><span>${funcionario}</span></div>
          <div class="info-item"><label>Cargo</label><span>${cargo}</span></div>
          <div class="info-item"><label>Data Pagamento</label><span>${dataPagamento.toLocaleDateString('pt-PT')}</span></div>
        </div>
        <table class="tabela-recibo">
          <thead><tr><th>Descrição</th><th class="valor">Valor (Kz)</th></tr></thead>
          <tbody>
            <tr class="secao-titulo"><td colspan="2">VENCIMENTOS</td></tr>
            <tr><td>Salário Base</td><td class="valor">${base.toLocaleString('pt-AO', {minimumFractionDigits: 2})}</td></tr>
            ${ferias > 0 ? `<tr><td>Subsídio de Férias</td><td class="valor">${ferias.toLocaleString('pt-AO', {minimumFractionDigits: 2})}</td></tr>` : ''}
            ${natal > 0 ? `<tr><td>Subsídio de Natal</td><td class="valor">${natal.toLocaleString('pt-AO', {minimumFractionDigits: 2})}</td></tr>` : ''}
            ${outrosAbonos > 0 ? `<tr><td>Outros Abonos / Bónus</td><td class="valor">${outrosAbonos.toLocaleString('pt-AO', {minimumFractionDigits: 2})}</td></tr>` : ''}
            <tr class="secao-titulo"><td colspan="2">DESCONTOS</td></tr>
            <tr><td>INSS</td><td class="valor desconto">- ${inss.toLocaleString('pt-AO', {minimumFractionDigits: 2})}</td></tr>
            ${outrosDescontos > 0 ? `<tr><td>Outros Descontos / IRS</td><td class="valor desconto">- ${outrosDescontos.toLocaleString('pt-AO', {minimumFractionDigits: 2})}</td></tr>` : ''}
            <tr class="total-row"><td>VALOR LÍQUIDO A PAGAR</td><td class="valor total-liquido">${liquido.toLocaleString('pt-AO', {minimumFractionDigits: 2})}</td></tr>
          </tbody>
        </table>
        <div class="footer"><div class="assinatura">Assinatura do Funcionário</div><div class="assinatura">Assinatura do Responsável</div></div>
        <div style="text-align:center;margin-top:15px;font-size:9px;color:#94a3b8;">Documento gerado automaticamente | ${new Date().toLocaleDateString('pt-PT')}</div>
      </div>
      <script>window.onload=function(){window.print();}</script></body></html>`
      const win = window.open('', '_blank', 'width=850,height=600')
      if (win) { win.document.write(conteudo); win.document.close(); }
      toast.dismiss(loading); toast.success('Recibo pronto para impressão!')
    } catch (e) {
      toast.dismiss(loading); toast.error('Erro ao gerar recibo'); console.error(e)
    }
  }

  const limparFiltros = () => { setDataInicio(''); setDataFim(''); setBusca('') }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 'bold', margin: 0 }}>Relatórios</h2>
          {isEducador && <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>Relatório de Crianças/Utentes</p>}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={exportarCSV} style={{ padding: '8px 14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}> Baixar CSV</button>
          <button onClick={gerarPDFCompleto} style={{ padding: '8px 14px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>🖨️ Gerar PDF</button>
        </div>
      </div>

      <div style={{ background: '#1e293b', padding: 14, borderRadius: 10, border: '1px solid #334155', marginBottom: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
          {!isEducador && (
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4, display: 'block' }}>Módulo</label>
              <select value={modulo} onChange={e => setModulo(e.target.value)} style={{ width: '100%', padding: '8px', background: '#0f172a', border: '1px solid #334155', borderRadius: 4, color: '#fff', fontSize: 13 }}>
                <option value="folha">Folha Salarial</option>
                <option value="criancas">Crianças/Utentes</option>
                <option value="funcionarios">Funcionários</option>
              </select>
            </div>
          )}
          <div style={{ flex: 1 }}><label style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4, display: 'block' }}>De</label><input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} style={{ width: '100%', padding: '8px', background: '#0f172a', border: '1px solid #334155', borderRadius: 4, color: '#fff', fontSize: 13 }} /></div>
          <div style={{ flex: 1 }}><label style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4, display: 'block' }}>Até</label><input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} style={{ width: '100%', padding: '8px', background: '#0f172a', border: '1px solid #334155', borderRadius: 4, color: '#fff', fontSize: 13 }} /></div>
          <div style={{ flex: 2 }}><label style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4, display: 'block' }}>Pesquisar</label><input type="text" value={busca} onChange={e => setBusca(e.target.value)} placeholder="Nome ou cargo..." style={{ width: '100%', padding: '8px', background: '#0f172a', border: '1px solid #334155', borderRadius: 4, color: '#fff', fontSize: 13 }} /></div>
          <button onClick={limparFiltros} style={{ padding: '8px 12px', background: '#334155', color: '#e2e8f0', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Limpar</button>
        </div>
      </div>

      {modulo === 'folha' && !isEducador && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
          <div style={{ background: '#1e293b', padding: 14, borderRadius: 8, border: '1px solid #334155', textAlign: 'center' }}><div style={{ fontSize: 12, color: '#94a3b8' }}>Salário Base Total</div><div style={{ fontSize: 20, fontWeight: 'bold', color: '#e2e8f0', marginTop: 4 }}>{resumo.bruto.toLocaleString('pt-AO')} Kz</div></div>
          <div style={{ background: '#1e293b', padding: 14, borderRadius: 8, border: '1px solid #334155', textAlign: 'center' }}><div style={{ fontSize: 12, color: '#94a3b8' }}>Total Descontos</div><div style={{ fontSize: 20, fontWeight: 'bold', color: '#f87171', marginTop: 4 }}>{resumo.descontos.toLocaleString('pt-AO')} Kz</div></div>
          <div style={{ background: '#1e293b', padding: 14, borderRadius: 8, border: '1px solid #334155', textAlign: 'center' }}><div style={{ fontSize: 12, color: '#94a3b8' }}>Salário Líquido Total</div><div style={{ fontSize: 20, fontWeight: 'bold', color: '#10b981', marginTop: 4 }}>{resumo.liquido.toLocaleString('pt-AO')} Kz</div></div>
        </div>
      )}

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
                    <><th style={{ padding: 12, textAlign: 'left', color: '#94a3b8' }}>Funcionário</th><th style={{ padding: 12, textAlign: 'left', color: '#94a3b8' }}>Cargo</th><th style={{ padding: 12, textAlign: 'right', color: '#94a3b8' }}>Base</th><th style={{ padding: 12, textAlign: 'right', color: '#94a3b8' }}>INSS</th><th style={{ padding: 12, textAlign: 'right', color: '#94a3b8' }}>Líquido</th><th style={{ padding: 12, textAlign: 'left', color: '#94a3b8' }}>Data</th><th style={{ padding: 12, textAlign: 'center', color: '#94a3b8' }}>Ações</th></>
                  ) : modulo === 'funcionarios' ? (
                    <><th style={{ padding: 12, textAlign: 'left', color: '#94a3b8' }}>Nome</th><th style={{ padding: 12, textAlign: 'left', color: '#94a3b8' }}>Cargo</th><th style={{ padding: 12, textAlign: 'left', color: '#94a3b8' }}>Admissão</th><th style={{ padding: 12, textAlign: 'left', color: '#94a3b8' }}>Contacto</th><th style={{ padding: 12, textAlign: 'center', color: '#94a3b8' }}>Ações</th></>
                  ) : (
                    <><th style={{ padding: 12, textAlign: 'left', color: '#94a3b8' }}>Nome</th><th style={{ padding: 12, textAlign: 'left', color: '#94a3b8' }}>Data Nasc.</th><th style={{ padding: 12, textAlign: 'left', color: '#94a3b8' }}>Entrada</th><th style={{ padding: 12, textAlign: 'left', color: '#94a3b8' }}>Encarregado</th><th style={{ padding: 12, textAlign: 'center', color: '#94a3b8' }}>Ações</th></>
                  )}
                </tr>
              </thead>
              <tbody>
                {dados.map((item, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #334155', background: i % 2 === 0 ? '#1e293b' : '#162032' }}>
                    {modulo === 'folha' ? (
                      <><td style={{ padding: 10, fontWeight: 500 }}>{item.funcionario_nome || item.nome_completo || '-'}</td><td style={{ padding: 10, color: '#cbd5e1' }}>{item.cargo || '-'}</td><td style={{ padding: 10, textAlign: 'right', color: '#94a3b8' }}>{parseFloat(item.salario_base||0).toLocaleString('pt-AO')} Kz</td><td style={{ padding: 10, textAlign: 'right', color: '#f87171' }}>{parseFloat(item.inss_valor||0).toLocaleString('pt-AO')} Kz</td><td style={{ padding: 10, textAlign: 'right', color: '#10b981', fontWeight: 600 }}>{parseFloat(item.salario_liquido||0).toLocaleString('pt-AO')} Kz</td><td style={{ padding: 10, color: '#64748b' }}>{new Date(item.data_pagamento || Date.now()).toLocaleDateString('pt-PT')}</td><td style={{ padding: 10, textAlign: 'center' }}><button onClick={() => imprimirFolhaUnica(item)} title="Imprimir Recibo" style={{ background: '#334155', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', color: '#fff', fontSize: 12 }}>🖨️</button></td></>
                    ) : modulo === 'funcionarios' ? (
                      <><td style={{ padding: 10, fontWeight: 500 }}>{item.nome_completo || '-'}</td><td style={{ padding: 10, color: '#cbd5e1' }}>{item.cargo || '-'}</td><td style={{ padding: 10, color: '#cbd5e1' }}>{new Date(item.data_admissao || item.data_entrada || item.created_at || Date.now()).toLocaleDateString('pt-PT')}</td><td style={{ padding: 10, color: '#cbd5e1' }}>{item.contacto || item.telemovel || '-'}</td><td style={{ padding: 10, textAlign: 'center' }}><button onClick={() => imprimirFichaFuncionario(item)} title="Imprimir Ficha Funcionário" style={{ background: '#334155', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', color: '#fff', fontSize: 12 }}></button></td></>
                    ) : (
                      <><td style={{ padding: 10, fontWeight: 500 }}>{item.nome_completo || '-'}</td><td style={{ padding: 10, color: '#cbd5e1' }}>{item.data_nascimento ? new Date(item.data_nascimento).toLocaleDateString('pt-PT') : '-'}</td><td style={{ padding: 10, color: '#cbd5e1' }}>{new Date(item.data_entrada || item.data_admissao || item.created_at || Date.now()).toLocaleDateString('pt-PT')}</td><td style={{ padding: 10, color: '#cbd5e1' }}>{item.encarregado_nome || '-'}</td><td style={{ padding: 10, textAlign: 'center' }}><button onClick={() => imprimirFichaIndividual(item)} title="Imprimir Ficha" style={{ background: '#334155', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', color: '#fff', fontSize: 12 }}>📄</button></td></>
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
