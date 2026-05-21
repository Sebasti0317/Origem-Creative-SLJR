import { useQuery } from '@tanstack/react-query'
import { getDashboardMetrics } from '../api/dashboard'
import { Users, Briefcase, DollarSign, TrendingUp, AlertTriangle, Package, Calendar, FileText, Settings, Download } from 'lucide-react'

export default function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardMetrics,
    refetchOnWindowFocus: false
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-brand-500/30 border-t-brand-400 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card-dark text-center p-8">
        <AlertTriangle size={32} className="mx-auto text-red-400 mb-3" />
        <h3 className="text-lg font-semibold text-red-400 mb-2">Erro ao carregar dashboard</h3>
        <p className="text-sm text-slate-400">{error.message}</p>
      </div>
    )
  }

  const metrics = data || {
    criancas: { total: 142, ativas: 128, transitorias: 14 },
    funcionarios: { total: 45, ferias: 3 },
    payroll: { mensal: 8250000 }
  }

  const statCards = [
    {
      title: 'Crianças Acolhidas',
      value: metrics.criancas.total,
      subtitle: `${metrics.criancas.ativas} ativas`,
      icon: Users,
      color: 'brand',
      trend: '+12% este mês'
    },
    {
      title: 'Funcionários Ativos',
      value: metrics.funcionarios.total,
      subtitle: `${metrics.funcionarios.ferias} em férias`,
      icon: Briefcase,
      color: 'brand',
      trend: 'Estável'
    },
    {
      title: 'Folha Mensal',
      value: `${(metrics.payroll.mensual / 1000000).toFixed(1)}M Kz`,
      subtitle: 'Total líquido',
      icon: DollarSign,
      color: 'green',
      trend: '+5% vs mês anterior'
    },
    {
      title: 'Taxa de Ocupação',
      value: `${Math.round((metrics.criancas.ativas / (metrics.criancas.total || 1)) * 100)}%`,
      subtitle: 'Capacidade atual',
      icon: TrendingUp,
      color: 'blue',
      trend: 'Boa'
    }
  ]

  const alerts = [
    { type: 'birthday', title: 'Aniversários Hoje', count: 3, icon: Calendar, color: 'amber' },
    { type: 'documents', title: 'Documentos Vencidos', count: 7, icon: FileText, color: 'red' },
    { type: 'payroll', title: 'Salários Pendentes', count: 2, icon: DollarSign, color: 'blue' },
    { type: 'inventory', title: 'Stock Crítico', count: 5, icon: Package, color: 'amber' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Visão geral do centro • {new Date().toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long' })}</p>
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <Settings size={16} />
          Configurar Dashboard
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon
          const colorClasses = {
            brand: 'from-brand-500 to-brand-600',
            green: 'from-green-500 to-green-600',
            blue: 'from-blue-500 to-blue-600',
            amber: 'from-amber-500 to-amber-600',
            red: 'from-red-500 to-red-600'
          }
          return (
            <div key={index} className="card-dark relative overflow-hidden group">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorClasses[card.color as keyof typeof colorClasses]} opacity-10 rounded-bl-full group-hover:opacity-20 transition-opacity`}></div>
              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClasses[card.color as keyof typeof colorClasses]} flex items-center justify-center shadow-lg`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <span className="text-xs text-slate-500 bg-dark-600 px-2 py-1 rounded-full">{card.trend}</span>
                </div>
                <h3 className="text-2xl font-bold text-white">{card.value}</h3>
                <p className="text-sm text-slate-400 mt-1">{card.title}</p>
                <p className="text-xs text-slate-500 mt-1">{card.subtitle}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts & Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 card-dark">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Evolução Mensal Financeira</h3>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-brand-500 rounded-full"></span>
                Receitas
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
                Despesas
              </span>
            </div>
          </div>
          {/* Chart Placeholder - In production, use recharts or chart.js */}
          <div className="h-64 flex items-end justify-between gap-2 px-4">
            {[65, 45, 70, 55, 80, 60, 75, 50, 85, 65, 70, 90].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-gradient-to-t from-brand-500/30 to-brand-500 rounded-t-md transition-all hover:from-brand-500/50 hover:to-brand-400 cursor-pointer"
                  style={{ height: `${height}%` }}
                ></div>
                <span className="text-xs text-slate-500">{['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts & Activity */}
        <div className="card-dark">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Alertas Críticos</h3>
            <span className="badge badge-red">{alerts.length} alertas</span>
          </div>
          <div className="space-y-3">
            {alerts.map((alert, index) => {
              const Icon = alert.icon
              const badgeColors = {
                amber: 'badge-amber',
                red: 'badge-red',
                blue: 'badge-blue',
                green: 'badge-green'
              }
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-dark-600/50 rounded-lg hover:bg-dark-600 transition cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      alert.color === 'amber' ? 'bg-amber-500/20 text-amber-400' :
                      alert.color === 'red' ? 'bg-red-500/20 text-red-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{alert.title}</p>
                      <p className="text-xs text-slate-500">Requer atenção</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${badgeColors[alert.color as keyof typeof badgeColors]}`}>{alert.count}</span>
                    <span className="text-slate-500">›</span>
                  </div>
                </div>
              )
            })}
          </div>
          
          <button className="w-full mt-4 btn-secondary text-sm">
            Ver Todos os Alertas
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card-dark">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Atividade Recente</h3>
          <button className="btn-secondary text-sm">
            <Download size={14} className="mr-2" />
            Exportar Relatório
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-dark-600">
                <th className="pb-3 font-medium">Atividade</th>
                <th className="pb-3 font-medium">Utilizador</th>
                <th className="pb-3 font-medium">Data</th>
                <th className="pb-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {[
                { activity: 'Nova criança registada', user: 'Admin', date: 'Hoje, 14:30', status: 'success' },
                { activity: 'Folha de pagamento gerada', user: 'Coordenador', date: 'Hoje, 10:15', status: 'success' },
                { activity: 'Atualização de funcionário', user: 'Admin', date: 'Ontem, 16:45', status: 'warning' },
                { activity: 'Doação recebida', user: 'Sistema', date: 'Ontem, 09:00', status: 'success' }
              ].map((row, i) => (
                <tr key={i} className="border-b border-dark-600/50 hover:bg-dark-600/30 transition">
                  <td className="py-3">{row.activity}</td>
                  <td className="py-3">{row.user}</td>
                  <td className="py-3 text-slate-500">{row.date}</td>
                  <td className="py-3">
                    <span className={`badge ${row.status === 'success' ? 'badge-green' : 'badge-amber'}`}>
                      {row.status === 'success' ? 'Concluído' : 'Pendente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}