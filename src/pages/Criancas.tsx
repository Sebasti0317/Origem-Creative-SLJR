import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useState } from 'react'

export default function Criancas() {
  const [showForm, setShowForm] = useState(false)
  const { data: criancas, isLoading } = useQuery({
    queryKey: ['criancas'],
    queryFn: async () => {
      const { data, error } = await supabase.from('criancas').select('*')
      if (error) throw error
      return data || []
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Crianças</h1>
        <button onClick={() => setShowForm(true)} className="bg-brand-500 text-white px-4 py-2 rounded-lg">Nova</button>
      </div>
      {isLoading ? <p className="text-slate-400">A carregar...</p> : (
        <div className="bg-dark-800 rounded-xl border border-dark-600 p-4">
          {criancas?.map((c: any) => (
            <div key={c.id} className="py-2 border-b border-dark-600">
              <p className="text-white">{c.nome_completo}</p>
              <p className="text-slate-400 text-sm">{c.estado}</p>
            </div>
          ))}
          {criancas?.length === 0 && <p className="text-slate-500">Nenhuma criança registada</p>}
        </div>
      )}
      {showForm && <div className="fixed inset-0 bg-black/70 flex items-center justify-center"><div className="bg-dark-800 p-6 rounded-xl"><p className="text-white">Formulário em desenvolvimento</p><button onClick={() => setShowForm(false)} className="mt-4 text-brand-500">Fechar</button></div></div>}
    </div>
  )
}