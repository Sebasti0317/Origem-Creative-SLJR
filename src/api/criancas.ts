import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Plus, Edit, Trash2, Search, Users } from 'lucide-react'
import { useState } from 'react'
import { Avatar } from '../components/ui/Avatar'
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
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Crianças</h1>
          <p className="text-slate-400">Gestão dos registos de crianças acolhidas</p>
        </div>
        <button 
          onClick={() => { setEditingChild(null); setShowForm(true) }}
          className="btn-primary flex items-center gap-2 w-fit"
        >
          <Plus size={18} /> Nova Criança
        </button>
      </div>

      {/* Barra de Pesquisa */}
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

      {/* Tabela / Lista */}
      <div className="bg-dark-800 rounded-xl border border-dark-600 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">A carregar...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <Users size={48} className="mb-4 opacity-20" />
            <p>Nenhuma criança registada.</p>
            <button onClick={() => setShowForm(true)} className="text-brand-500 hover:underline mt-2">Registar a primeira criança</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-dark-700 text-slate-300 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Data Nasc.</th>
                  <th className="px-4 py-3 hidden md:table-cell">Encarregado</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-600">
                {filtered.map((c: any) => (
                  <tr key={c.id} className="hover:bg-dark-700/50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={c.nome_completo} size={32} />
                        <div>
                          <p className="font-medium text-white">{c.nome_completo}</p>
                          <p className="text-xs text-slate-500">{c.genero}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300 hidden sm:table-cell">
                      {c.data_nascimento ? new Date(c.data_nascimento).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-300 hidden md:table-cell">
                      {c.encarregado_nome || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        c.estado === 'ativo' ? 'bg-green-500/20 text-green-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {c.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setEditingChild(c); setShowForm(true) }} className="p-1.5 hover:bg-dark-600 rounded text-blue-400">
                          <Edit size={16} />
                        </button>
                        <button className="p-1.5 hover:bg-dark-600 rounded text-red-400">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Formulário */}
      {showForm && (
        <CriancasForm 
          crianca={editingChild} 
          onCancel={() => setShowForm(false)} 
        />
      )}
    </div>
  )
}