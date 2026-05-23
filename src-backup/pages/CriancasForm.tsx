import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { toast } from 'react-hot-toast'
import { X } from 'lucide-react'

export default function CriancasForm({ onCancel }: { onCancel: () => void }) {
  const queryClient = useQueryClient()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { nome_completo: '', estado: 'ativo' }
  })

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = { ...data, created_at: new Date().toISOString() }
      const { error } = await supabase.from('criancas').insert(payload)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['criancas'] })
      toast.success('Criança registada!')
      onCancel()
    },
    onError: (e: any) => toast.error(e.message || 'Erro ao guardar')
  })

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-800 rounded-2xl w-full max-w-lg border border-dark-600">
        <div className="flex justify-between items-center p-4 border-b border-dark-600">
          <h2 className="text-lg font-bold text-white">Nova Criança</h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Nome Completo *</label>
            <input {...register('nome_completo', { required: true })} className="input-field w-full" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Estado</label>
            <select {...register('estado')} className="input-field w-full">
              <option value="ativo">Ativo</option>
              <option value="transitorio">Transitório</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onCancel} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'A guardar...' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}