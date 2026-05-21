import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { FileText, Download, Users, DollarSign, Loader2, Printer } from 'lucide-react'
import { toast } from 'react-hot-toast'

// ✅ Gerador de CSV robusto
const downloadCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) { toast.error('Sem dados para exportar'); return }
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(','))
  ].join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}_${new Date().toISOString().slice(0,10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
  toast.success(`✅ ${filename}.csv exportado!`)
}

// ✅ Gerador de PDF (usa impressão nativa do navegador)
const printReport = (title: string) => {
  const printWindow = window.open('', '_blank')
  if (!printWindow) { toast.error('Permite popups para gerar PDF'); return }
  printWindow.document.write(`
    <html><head><title>${title}</title>
    <style>body{font-family:sans-serif;padding:20px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#0f172a;color:white}@media print{body{padding:0}}</style>
    </head><body><h1>${title}</h1><p>Gerado em: ${new Date().toLocaleString('pt-PT')}</p><div id="content"></div>
    <script>window.onload=()=>{document.getElementById('content').innerHTML=localStorage.getItem('print_html')||'';window.print();}</script>
    </body></html>
  `)
  printWindow.document.close()
}

export default function Relatorios() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['relatorios-stats'],
    queryFn: async () => {
      const [criancasRes, funcRes, folhasRes] = await Promise.all([
        supabase.from('criancas').select('*', { count: 'exact', head: true }).is('deleted_at', null),
        supabase.from('funcionarios').select('*', { count: 'exact', head: true }).eq('estado', 'ativo'),
        supabase.from('folha_pagamento').select('salario_liquido')
      ])
      return {
        totalCriancas: criancasRes.count || 0,
        totalFuncionarios: funcRes.count || 0,
        totalPayroll: (folhasRes.data || []).reduce((sum, f) => sum + Number(f.salario_liquido || 0), 0)
      }
    }
  })

  const exportCriancas = async () => {
    const { data } = await supabase.from('criancas').select('id, nome_completo, data_nascimento, estado').is('deleted_at', null)
    downloadCSV(data || [], 'criancas')
  }

  const exportFuncionarios = async () => {
    const { data } = await supabase.from('funcionarios').select('id, nome_completo, cargo, estado')
    downloadCSV(data || [], 'funcionarios')
  }

  const exportFolha = async () => {
    const { data } = await supabase.from('folha_pagamento').select('*, funcionarios(nome_completo)').order('mes_referencia', { ascending: false })
    const flattened = (data || []).map(f => ({
      mes_referencia: f.mes_referencia,
      funcionario: f.funcionarios?.nome_completo || 'N/A',
      salario_bruto: f.salario_bruto,
      total_descontos: f.total_descontos,
      salario_liquido: f.salario_liquido,
      estado: f.estado
    }))
    downloadCSV(flattened, 'folha_pagamento')
  }

  const generatePDF = async (tipo: 'criancas' | 'funcionarios' | 'folha') => {
    let html = '<table><tr><th>ID</th><th>Nome</th><th>Estado</th></tr>'
    if (tipo === 'criancas') {
      const { data } = await supabase.from('criancas').select('id, nome_completo, estado').is('deleted_at', null)
      html += (data || []).map(d => `<tr><td>${d.id.slice(0,8)}</td><td>${d.nome_completo}</td><td>${d.estado}</td></tr>`).join('')
    } else if (tipo === 'funcionarios') {
      const { data } = await supabase.from('funcionarios').select('id, nome_completo, estado')
      html += (data || []).map(d => `<tr><td>${d.id.slice(0,8)}</td><td>${d.nome_completo}</td><td>${d.estado}</td></tr>`).join('')
    } else {
      const { data } = await supabase.from('folha_pagamento').select('*, funcionarios(nome_completo)')
      html = '<table><tr><th>Mês</th><th>Funcionário</th><th>Líquido</th><th>Estado</th></tr>'
      html += (data || []).map(d => `<tr><td>${d.mes_referencia}</td><td>${d.funcionarios?.nome_completo}</td><td>${d.salario_liquido} Kz</td><td>${d.estado}</td></tr>`).join('')
    }
    html += '</table>'
    localStorage.setItem('print_html', html)
    printReport(tipo === 'folha' ? 'Relatório Folha de Pagamento' : tipo === 'criancas' ? 'Lista de Crianças' : 'Lista de Funcionários')
  }

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-brand-400" size={32} /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Relatórios</h1>
        <p className="text-slate-400 text-sm mt-1">Exporta dados reais em CSV ou gera PDF pronto a imprimir</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Crianças', count: stats?.totalCriancas, color: 'brand', icon: Users, actions: [{ label: 'CSV', fn: exportCriancas }, { label: 'PDF', fn: () => generatePDF('criancas') }] },
          { title: 'Funcionários', count: stats?.totalFuncionarios, color: 'blue', icon: Users, actions: [{ label: 'CSV', fn: exportFuncionarios }, { label: 'PDF', fn: () => generatePDF('funcionarios') }] },
          { title: 'Folha Mensal', count: `${((stats?.totalPayroll || 0) / 1000000).toFixed(2)}M Kz`, color: 'green', icon: DollarSign, actions: [{ label: 'CSV', fn: exportFolha }, { label: 'PDF', fn: () => generatePDF('folha') }] }
        ].map((card, i) => (
          <div key={i} className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-lg bg-${card.color}-500/20 flex items-center justify-center`}>
                <card.icon size={24} className={`text-${card.color}-400`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                <p className={`text-2xl font-bold text-${card.color}-400`}>{card.count}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {card.actions.map((btn, j) => (
                <button key={j} onClick={btn.fn} className={`flex-1 ${btn.label === 'PDF' ? 'btn-secondary' : 'btn-primary'} flex items-center justify-center gap-2`}>
                  {btn.label === 'PDF' ? <Printer size={16} /> : <Download size={16} />}
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}