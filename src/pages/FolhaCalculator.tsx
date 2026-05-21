import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchFuncionarios } from '../api/funcionarios'
import { getConfigFiscal } from '../api/configFiscal'
import { salvarFolha } from '../api/folha'
import { calcularFolha, getRegrasDefault } from '../utils/folha' // ✅ Tipo removido
import { toast } from 'react-hot-toast'
import { Calculator, Save, RefreshCw, Settings, ShieldCheck } from 'lucide-react'

export default function FolhaCalculator() {
  const { register, handleSubmit, watch, setValue, formState: { isSubmitting } } = useForm()
  const [resultado, setResultado] = useState<any>(null)
  const [regrasManuais, setRegrasManuais] = useState<any[]>([]) // ✅ any local
  const [showConfig, setShowConfig] = useState(false)
  const queryClient = useQueryClient()

  const funcionarioId = watch('funcionario_id')
  const dias = Number(watch('dias') || 30)
  const regiao = watch('regiao') || 'Angola'

  const { data: funcData } = useQuery({ queryKey: ['funcionarios'], queryFn: () => fetchFuncionarios() })

  const { data: configFiscal, refetch: refetchConfig } = useQuery({
    queryKey: ['configFiscal'],
    queryFn: getConfigFiscal,
    staleTime: 1000 * 60 * 5
  })

  useEffect(() => {
    if (funcData?.data && funcionarioId) {
      const func = funcData.data.find((f: any) => f.id === funcionarioId)
      if (func) {
        setValue('salario_base', func.salario_base || 0)
        setValue('moeda', func.moeda || 'AOA')
        setValue('regiao', func.regiao || 'Angola')
      }
    }
  }, [funcionarioId, funcData, setValue])

  const calcular = () => {
    const salario = Number(watch('salario_base') || 0)
    const config = configFiscal ? {
      isento_irt: configFiscal.isento_irt,
      isento_inss: configFiscal.isento_inss,
      isento_tsu: configFiscal.isento_tsu,
      percentagem_irt_personalizada: configFiscal.percentagem_irt_personalizada,
      percentagem_inss_personalizada: configFiscal.percentagem_inss_personalizada
    } : undefined
    
    const regrasBase = getRegrasDefault(regiao, config)
    const regrasFinais = regrasManuais.length > 0 
      ? regrasBase.map(r => {
          const override = regrasManuais.find(m => m.codigo === r.codigo)
          return override ? { ...r, ativo: override.ativo } : r
        })
      : regrasBase
    
    setResultado(calcularFolha(salario, dias, regrasFinais))
    setRegrasManuais(regrasFinais)
  }

  const toggleRegra = (codigo: string) => {
    setRegrasManuais(prev => 
      prev.map(r => r.codigo === codigo ? { ...r, ativo: !r.ativo } : r)
    )
  }

  const updateConfigMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      import('../api/configFiscal').then(m => m.updateConfigFiscal(id, updates)),
    onSuccess: () => { refetchConfig(); toast.success('Configurações atualizadas! Recalcula para aplicar.'); setShowConfig(false) },
    onError: (e: any) => toast.error(e.message || 'Erro ao atualizar')
  })

  const saveFolhaMutation = useMutation({
    mutationFn: salvarFolha,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['folhas'] }); toast.success('Folha registada com sucesso'); setResultado(null); setValue('dias', 30) },
    onError: (e: any) => toast.error(e.message || 'Erro ao guardar folha')
  })

  const onSubmit = async (data: any) => {
    if (!funcionarioId) { toast.error('Seleciona um funcionário primeiro'); return }
    if (!resultado) { calcular() }
    
    const payload = {
      funcionario_id: funcionarioId,
      mes_referencia: new Date().toISOString().split('T')[0],
      dias_trabalhados: dias || 30,
      salario_bruto: Number(resultado?.bruto || 0),
      descontos: resultado?.descontos?.filter((d: any) => d.ativo) || [],
      total_descontos: Number(resultado?.totalDescontos || 0),
      salario_liquido: Number(resultado?.liquido || 0),
      estado: 'pendente',
  }
    
    try { await saveFolhaMutation.mutateAsync(payload) } 
    catch (e: any) { toast.error('Erro: ' + (e.message || 'Verifica o console')) }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3"><Calculator size={24} className="text-blue-600" /><h1 className="text-2xl font-bold text-gray-800">Calculadora de Folha</h1></div>
        <button onClick={() => setShowConfig(!showConfig)} className="flex items-center gap-2 px-3 py-2 text-sm border rounded hover:bg-gray-50"><Settings size={16} /> Config. Fiscais</button>
      </div>

      {showConfig && configFiscal && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2"><ShieldCheck size={18} /> Isenções Fiscais - {configFiscal.instituicao_nome}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={configFiscal.isento_irt} onChange={(e) => updateConfigMutation.mutate({ id: configFiscal.id, updates: { isento_irt: e.target.checked } })} className="rounded" /> Isento de IRT/IRS</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={configFiscal.isento_inss} onChange={(e) => updateConfigMutation.mutate({ id: configFiscal.id, updates: { isento_inss: e.target.checked } })} className="rounded" /> Isento de INSS/TSU</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={configFiscal.isento_tsu} onChange={(e) => updateConfigMutation.mutate({ id: configFiscal.id, updates: { isento_tsu: e.target.checked } })} className="rounded" /> Isento de TSU</label>
          </div>
          <p className="text-xs text-blue-600 mt-2">💡 As alterações aplicam-se automaticamente ao recalcular.</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Funcionário *</label><select {...register('funcionario_id')} className="w-full border rounded px-3 py-2"><option value="">Selecionar...</option>{funcData?.data?.map((f: any) => (<option key={f.id} value={f.id}>{f.nome_completo} ({f.cargo})</option>))}</select></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Dias Trabalhados *</label><input type="number" min="1" max="31" {...register('dias')} className="w-full border rounded px-3 py-2" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Salário Base</label><input type="number" step="0.01" {...register('salario_base')} className="w-full border rounded px-3 py-2 bg-gray-50" readOnly /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Moeda / Região</label><input type="text" {...register('moeda')} className="w-full border rounded px-3 py-2 bg-gray-50" readOnly /><p className="text-xs text-gray-500 mt-1">Regras aplicadas: {regiao}</p></div>

        {resultado && regrasManuais.length > 0 && (
          <div className="md:col-span-2 border-t pt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Ajustar Descontos (Opcional)</p>
            <div className="flex flex-wrap gap-3">
              {regrasManuais.map((r) => (
                <label key={r.codigo} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border cursor-pointer transition ${r.ativo ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400 line-through'}`}>
                  <input type="checkbox" checked={r.ativo} onChange={() => toggleRegra(r.codigo!)} className="rounded" />
                  {r.nome} {r.ativo ? `(${r.percentagem}%)` : '(Isento)'}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="md:col-span-2 flex gap-3">
          <button type="button" onClick={calcular} className="flex items-center gap-2 px-4 py-2 border rounded hover:bg-gray-50"><RefreshCw size={16} /> Calcular</button>
          <button onClick={handleSubmit(onSubmit)} disabled={isSubmitting || !resultado} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"><Save size={16} /> {isSubmitting ? 'A guardar...' : 'Gerar Folha'}</button>
        </div>
      </div>

      {resultado && (
        <div className="mt-6 bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Resumo da Folha</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded"><p className="text-sm text-gray-500">Salário Bruto</p><p className="text-xl font-bold">{resultado.bruto.toFixed(2)}</p></div>
            <div className="p-4 bg-red-50 rounded"><p className="text-sm text-red-600">Total Descontos</p><p className="text-xl font-bold text-red-600">- {resultado.totalDescontos.toFixed(2)}</p><ul className="text-xs text-gray-600 mt-2 space-y-1">{resultado.descontos.map((d: any, i: number) => (<li key={i} className={!d.ativo ? 'line-through text-gray-400' : ''}>{d.nome}: {d.valor > 0 ? d.valor.toFixed(2) : '0,00 (Isento)'}</li>))}</ul></div>
            <div className="p-4 bg-green-50 rounded"><p className="text-sm text-green-600">Líquido a Receber</p><p className="text-2xl font-bold text-green-700">{resultado.liquido.toFixed(2)}</p></div>
          </div>
        </div>
      )}
    </div>
  )
}