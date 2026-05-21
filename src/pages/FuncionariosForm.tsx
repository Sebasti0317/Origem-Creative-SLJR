import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { toast } from 'react-hot-toast'
import { X, Save } from 'lucide-react'

export default function FuncionariosForm({ funcionario, onCancel }: { funcionario?: any, onCancel: () => void }) {
  const queryClient = useQueryClient()
  const [moeda, setMoeda] = useState(funcionario?.moeda || 'AOA')

  const { register, handleSubmit, watch, formState: { errors, isSubmitting }, setValue } = useForm({
    defaultValues: {
      nome_completo: funcionario?.nome_completo || '',
      cargo: funcionario?.cargo || '',
      contacto: funcionario?.contacto || '',
      email: funcionario?.email || '',
      salario_base: funcionario?.salario_base || 0,
      moeda: funcionario?.moeda || 'AOA',
      estado: funcionario?.estado || 'ativo',
      regiao: funcionario?.regiao || 'Angola',
      iban: funcionario?.iban || '',
      data_nascimento: funcionario?.data_nascimento?.split('T')[0] || '',
      numero_documento: funcionario?.numero_documento || '',
      tipo_documento: funcionario?.tipo_documento || 'BI'
    }
  })

  useEffect(() => {
    const regiao = watch('regiao')
    if (regiao === 'Portugal') setValue('moeda', 'EUR')
    else if (regiao === 'Brasil') setValue('moeda', 'BRL')
    else if (regiao === 'Cabo_Verde') setValue('moeda', 'CVE')
    else setValue('moeda', 'AOA')
    setMoeda(watch('moeda'))
  }, [watch('regiao'), setValue])

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        nome_completo: data.nome_completo,
        cargo: data.cargo,
        contacto: data.contacto,
        email: data.email,
        salario_base: parseFloat(data.salario_base) || 0,
        moeda: data.moeda,
        estado: data.estado,
        regiao: data.regiao,
        iban: data.iban,
        data_nascimento: data.data_nascimento,
        numero_documento: data.numero_documento,
        tipo_documento: data.tipo_documento,
        updated_at: new Date().toISOString()
      }

      if (funcionario?.id) {
        const { error } = await supabase.from('funcionarios').update(payload).eq('id', funcionario.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('funcionarios').insert({ ...payload, created_at: new Date().toISOString() })
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] })
      toast.success(funcionario ? 'Funcionário atualizado!' : 'Funcionário registado!')
      onCancel()
    },
    onError: (e: any) => toast.error(e.message || 'Erro ao guardar')
  })

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-dark-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-dark-600 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-dark-600 sticky top-0 bg-dark-800 z-10">
          <h2 className="text-xl font-bold text-white">{funcionario ? 'Editar Funcionário' : 'Novo Funcionário'}</h2>
          <button onClick={onCancel} className="p-2 hover:bg-dark-600 rounded-lg text-slate-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="p-6 space-y-5">
          {/* Dados Pessoais */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Dados Pessoais</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1">Nome Completo *</label>
                <input {...register('nome_completo', { required: 'Obrigatório' })} className="input-field" />
                {errors.nome_completo && <p className="text-red-400 text-xs mt-1">{errors.nome_completo.message as string}</p>}
              </div>

              {/* NOVOS CAMPOS: Data Nascimento e Documento */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Data de Nascimento</label>
                <input type="date" {...register('data_nascimento')} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tipo de Documento</label>
                <select {...register('tipo_documento')} className="input-field">
                  <option value="BI">Bilhete de Identidade</option>
                  <option value="Passaporte">Passaporte</option>
                  <option value="Carta Condução">Carta de Condução</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1">Número do Documento *</label>
                <input {...register('numero_documento', { required: 'Obrigatório' })} className="input-field" placeholder="Ex: 001234567LA042" />
                {errors.numero_documento && <p className="text-red-400 text-xs mt-1">{errors.numero_documento.message as string}</p>}
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div className="border-t border-dark-600 pt-5">
            <h3 className="text-sm font-semibold text-white mb-4">Contacto</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Telefone</label>
                <input {...register('contacto')} className="input-field" placeholder="+244 9XX XXX XXX" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                <input type="email" {...register('email')} className="input-field" placeholder="email@exemplo.com" />
              </div>
            </div>
          </div>

          {/* Profissional */}
          <div className="border-t border-dark-600 pt-5">
            <h3 className="text-sm font-semibold text-white mb-4">Dados Profissionais</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Cargo *</label>
                <input {...register('cargo', { required: 'Obrigatório' })} className="input-field" />
                {errors.cargo && <p className="text-red-400 text-xs mt-1">{errors.cargo.message as string}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Região</label>
                <select {...register('regiao')} className="input-field">
                  <option value="Angola">Angola</option>
                  <option value="Portugal">Portugal</option>
                  <option value="Brasil">Brasil</option>
                  <option value="Cabo_Verde">Cabo Verde</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Salário Base</label>
                <input type="number" step="0.01" {...register('salario_base')} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Moeda</label>
                <select {...register('moeda')} className="input-field" value={moeda} onChange={(e) => setMoeda(e.target.value)}>
                  <option value="AOA">Kz (Angola)</option>
                  <option value="EUR">€ (Europa)</option>
                  <option value="BRL">R$ (Brasil)</option>
                  <option value="CVE">CVE (Cabo Verde)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bancários */}
          <div className="border-t border-dark-600 pt-5">
            <h3 className="text-sm font-semibold text-white mb-4">Dados Bancários</h3>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">IBAN</label>
              <input {...register('iban')} className="input-field" placeholder="AO06 0000 0000 0000 0000 0000 0" />
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Estado</label>
            <select {...register('estado')} className="input-field">
              <option value="ativo">Ativo</option>
              <option value="ferias">Em Férias</option>
              <option value="suspenso">Suspenso</option>
              <option value="desligado">Desligado</option>
            </select>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t border-dark-600">
            <button type="button" onClick={onCancel} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-2">
              {isSubmitting ? 'A guardar...' : <><Save size={16} /> Guardar</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}