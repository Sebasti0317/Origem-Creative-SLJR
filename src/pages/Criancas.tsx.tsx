import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Plus, Edit, Search, Users } from 'lucide-react'
import { useState } from 'react'
import CriancasForm from './CriancasForm'

export default function Criancas() {
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingChild, setEditingChild] = useState<any>(null)

  const { data: criancas, isLoading } = useQuery({
    queryKey: ['criancas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('criancas')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    }
  })

  const filtered = criancas?.filter((c: any) => 
    c.nome_completo?.toLowerCase().includes(search.toLowerCase())
  ) || []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Crianças</h1>
          <p className="text-slate-400 text-sm">Gestão dos registos</p>
        </div>
        <button 
          onClick={() => { setEditingChild(null); setShowForm(true) }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} /> Nova Criança
        </button>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input 
          type="text" 
          placeholder="Pesquisar por nome..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10 w-full sm:w-80"
        />
      </div>

      <div className="bg-dark-800 rounded-xl border border-dark-600 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">A carregar...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <Users size={48} className="mb-4 opacity-20" />
            <p>Nenhuma criança registada.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-dark-700 text-slate-300 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Estado</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-600">
                {filtered.map((c: any) => (
                  <tr key={c.id} className="hover:bg-dark-700/50 transition">
                    <td className="px-4 py-3 font-medium text-white">{c.nome_completo}</td>
                    <td className="px-4 py-3 text-slate-300 hidden sm:table-cell">{c.estado}</td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => { setEditingChild(c); setShowForm(true) }}
                        className="text-blue-400 hover:text-blue-300 p-2"
                      >
                        <Edit size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <CriancasForm 
          crianca={editingChild} 
          onCancel={() => setShowForm(false)} 
        />
      )}
    </div>
  )
}