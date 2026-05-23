import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useState } from 'react'
import CriancasForm from './CriancasForm'

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
        <button onClick={() => setShowForm(true)} className="btn-primary">Nova Criança</button>
      </div>
      
      {isLoading ? <p>A carregar...</p> : (
        <div className="bg-dark-800 rounded-xl border border-dark-600 p-4">
          {criancas?.map((c: any) => (
            <div key={c.id} className="py-2 border-b border-dark-600 last:border-0">
              <p className="text-white font-medium">{c.nome_completo}</p>
              <p className="text-slate-400 text-sm">{c.estado}</p>
            </div>
          ))}
          {criancas?.length === 0 && <p className="text-slate-500">Nenhuma criança registada</p>}
        </div>
      )}
      
      {showForm && <CriancasForm onCancel={() => setShowForm(false)} />}
    </div>
  )
}