import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { toast } from 'react-hot-toast'
import { X, Save, Upload } from 'lucide-react'

export default function CriancasForm({ crianca, onCancel }: { crianca?: any, onCancel: () => void }) {
  const [fotoPreview, setFotoPreview] = useState<string | null>(crianca?.foto_url || null)
  const queryClient = useQueryClient()

  const { register, handleSubmit, watch, formState: { errors, isSubmitting }, setValue } = useForm({
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
        foto_url: fotoPreview,
        updated_at: new Date().toISOString()
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

  const handleFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setFotoPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-dark-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-dark-600 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-dark-600 sticky top-0 bg-dark-800 z-10">
          <h2 className="text-xl font-bold text-white">{crianca ? 'Editar Criança' : 'Nova Criança'}</h2>
          <button onClick={onCancel} className="p-2 hover:bg-dark-600 rounded-lg text-slate-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="p-6 space-y-5">
          {/* Foto + Dados Básicos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-300 mb-2">Foto</label>
              <div className="relative">
                <div className="w-full aspect-square bg-dark-700 rounded-xl border-2 border-dashed border-dark-500 flex items-center justify-center overflow-hidden">
                  {fotoPreview ? (
                    <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Upload size={32} className="text-slate-500" />
                  )}
                </div>
                <input type="file" accept="image/*" onChange={handleFotoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
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

          {/* NOVOS CAMPOS: Moradia e Familiares */}
          <div className="border-t border-dark-600 pt-5">
            <h3 className="text-sm font-semibold text-white mb-4">Informações Adicionais</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Moradia Anterior</label>
              <textarea
                {...register('moradia_anterior')}
                placeholder="Ex: Bairro Tal, Rua X, Nº Y, Município..."
                className="input-field min-h-[60px] resize-y"
              />
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