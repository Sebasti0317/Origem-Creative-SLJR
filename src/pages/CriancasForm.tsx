import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'  // ✅ Removido getCurrentCentroId
import { toast } from 'react-hot-toast'
import { X, Save } from 'lucide-react'
import { Avatar } from '../components/ui/Avatar'

export default function CriancasForm({ crianca, onCancel }: { crianca?: any, onCancel: () => void }) {
  const queryClient = useQueryClient()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      nome_completo: crianca?.nome_completo || '',
      data_nascimento: crianca?.data_nascimento?.split('T')[0] || '',
      genero: crianca?.genero || '',
      estado: crianca?.estado || 'ativo',
      observacoes: crianca?.observacoes || '',
      encarregado_nome: crianca?.encarregado_nome || '',
      encarregado_contacto: crianca?.encarregado_contacto || '',
      moradia_anterior: crianca?.moradia_anterior || '',
      contacto_familiar: '',
      contacto_familiar_tel: '',
      parentesco_encarregado: ''
    }
  })

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      // ✅ Removido centro_id - base de dados single-tenant
      const payload = {
        nome_completo: data.nome_completo,
        data_nascimento: data.data_nascimento,
        genero: data.genero,
        estado: data.estado,
        observacoes: data.observacoes,
        encarregado_nome: data.encarregado_nome,
        encarregado_contacto: data.encarregado_contacto,
        moradia_anterior: data.moradia_anterior,
        contacto_familiar: `${data.contacto_familiar || ''} | ${data.contacto_familiar_tel || ''} | ${data.parentesco_encarregado || ''}`.trim(),
        parentesco_encarregado: data.parentesco_encarregado,
        updated_at: new Date().toISOString()  // ✅ Sem centro_id
      }

      if (crianca?.id) {
        const { error } = await supabase.from('criancas').update(payload).eq('id', crianca.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('criancas').insert({ ...payload, created_at: new Date().toISOString() })
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['criancas'] })
      toast.success(crianca ? 'Criança atualizada!' : 'Criança registada!')
      onCancel()
    },
    onError: (e: any) => toast.error(e.message || 'Erro ao guardar')
  })

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-dark-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-dark-600 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-dark-600 sticky top-0 bg-dark-800 z-10">
          <div className="flex items-center gap-3">
            <Avatar name={crianca?.nome_completo || 'Nova Criança'} size={32} />
            <h2 className="text-xl font-bold text-white">{crianca ? 'Editar Criança' : 'Nova Criança'}</h2>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-dark-600 rounded-lg text-slate-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="p-6 space-y-5">
          {/* Dados Básicos */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nome Completo *</label>
              <input {...register('nome_completo', { required: 'Obrigatório' })} className="input-field" />
              {errors.nome_completo && <p className="text-red-400 text-xs mt-1">{errors.nome_completo.message as string}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Data de Nascimento</label>
                <input type="date" {...register('data_nascimento')} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Género</label>
                <select {...register('genero')} className="input-field">
                  <option value="">Selecionar...</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Estado</label>
              <select {...register('estado')} className="input-field">
                <option value="ativo">Ativo</option>
                <option value="transitorio">Transitório</option>
                <option value="arquivado">Arquivado</option>
              </select>
            </div>
          </div>

          {/* Encarregado */}
          <div className="border-t border-dark-600 pt-5">
            <h3 className="text-sm font-semibold text-white mb-4">Encarregado de Educação</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nome do Encarregado</label>
                <input {...register('encarregado_nome')} className="input-field" placeholder="Nome completo" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Contacto</label>
                <input {...register('encarregado_contacto')} className="input-field" placeholder="+244 9XX XXX XXX" />
              </div>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="border-t border-dark-600 pt-5">
            <h3 className="text-sm font-semibold text-white mb-4">Informações Adicionais</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Moradia Anterior</label>
              <textarea {...register('moradia_anterior')} placeholder="Ex: Bairro Tal, Rua X, Nº Y..." className="input-field min-h-[60px] resize-y" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nome do Familiar</label>
                <input {...register('contacto_familiar')} className="input-field" placeholder="Nome" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Telefone do Familiar</label>
                <input {...register('contacto_familiar_tel')} className="input-field" placeholder="+244 9XX XXX XXX" />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium text-slate-300 mb-1">Parentesco</label>
              <input {...register('parentesco_encarregado')} className="input-field" placeholder="Ex: Mãe, Tio, Avó" />
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Observações</label>
            <textarea {...register('observacoes')} className="input-field min-h-[80px] resize-y" placeholder="Notas importantes..." />
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