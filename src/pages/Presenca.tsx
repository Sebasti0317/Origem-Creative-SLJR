import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { toast } from 'react-hot-toast'
import { Calendar, CheckCircle2, XCircle, Search, Users, Briefcase } from 'lucide-react'

export default function Presenca() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [search, setSearch] = useState('')

  // Queries seguras (apenas colunas que existem)
  const { data: criancas } = useQuery({
    queryKey: ['criancas-presenca'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('criancas')
        .select('id, nome_completo, data_nascimento')
        .is('deleted_at', null)
        .eq('estado', 'ativo')
      if (error) { console.error('Erro criancas:', error); return [] }
      return data || []
    }
  })

  const { data: funcionarios } = useQuery({
    queryKey: ['funcionarios-presenca'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('funcionarios')
        .select('id, nome_completo, cargo')
        .eq('estado', 'ativo')
      if (error) { console.error('Erro funcionarios:', error); return [] }
      return data || []
    }
  })

  // Carregar presenças do dia
  const { data: presencas, refetch } = useQuery({
    queryKey: ['presencas', selectedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('presenca')
        .select('*')
        .eq('data', selectedDate)
      if (error) return []
      return data || []
    }
  })

  const registerPresenca = useMutation({
    mutationFn: async ({ tipo, pessoa_id, estado }: { tipo: string; pessoa_id: string; estado: string }) => {
      const { data, error } = await supabase
        .from('presenca')
        .upsert(
          { tipo, pessoa_id, data: selectedDate, estado, hora_registro: new Date().toISOString() },
          { onConflict: 'tipo,pessoa_id,data' }
        )
      if (error) throw error
      return data
    },
    onSuccess: () => { refetch(); toast.success('Presença registada') },
    onError: (e: any) => toast.error(e.message || 'Erro ao registar')
  })

  const isPresent = (tipo: string, pessoa_id: string) => {
    return presencas?.find(p => p.tipo === tipo && p.pessoa_id === pessoa_id)?.estado === 'presente'
  }

  const filteredCriancas = criancas?.filter(c => c.nome_completo?.toLowerCase().includes(search.toLowerCase())) || []
  const filteredFuncionarios = funcionarios?.filter(f => f.nome_completo?.toLowerCase().includes(search.toLowerCase())) || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Controlo de Presença</h1>
          <p className="text-slate-400 text-sm mt-1">Regista a presença diária de crianças e funcionários</p>
        </div>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="input-field w-auto" />
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Search size={18} className="text-slate-400" />
          <input type="text" placeholder="Pesquisar por nome..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field flex-1" />
        </div>
      </div>

      {/* Crianças */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Users size={20} className="text-brand-400" />
          Crianças ({filteredCriancas.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCriancas.map((crianca: any) => (
            <div key={crianca.id} className="flex items-center justify-between p-3 bg-dark-600/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">{crianca.nome_completo}</p>
                <p className="text-xs text-slate-400">{crianca.data_nascimento ? `${new Date().getFullYear() - new Date(crianca.data_nascimento).getFullYear()} anos` : ''}</p>
              </div>
              <div className="flex gap-2">
                {/* ✅ CORRIGIDO: cranca → crianca */}
                <button 
                  onClick={() => registerPresenca.mutate({ tipo: 'crianca', pessoa_id: crianca.id, estado: 'presente' })} 
                  className={`p-2 rounded-lg transition ${isPresent('crianca', crianca.id) ? 'bg-green-500 text-white' : 'bg-dark-500 text-slate-400 hover:bg-green-500/20'}`}
                >
                  <CheckCircle2 size={18} />
                </button>
                <button 
                  onClick={() => registerPresenca.mutate({ tipo: 'crianca', pessoa_id: crianca.id, estado: 'ausente' })} 
                  className="p-2 rounded-lg bg-dark-500 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition"
                >
                  <XCircle size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Funcionários */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Briefcase size={20} className="text-brand-400" />
          Funcionários ({filteredFuncionarios.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredFuncionarios.map((func: any) => (
            <div key={func.id} className="flex items-center justify-between p-3 bg-dark-600/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">{func.nome_completo}</p>
                <p className="text-xs text-slate-400">{func.cargo}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => registerPresenca.mutate({ tipo: 'funcionario', pessoa_id: func.id, estado: 'presente' })} 
                  className={`p-2 rounded-lg transition ${isPresent('funcionario', func.id) ? 'bg-green-500 text-white' : 'bg-dark-500 text-slate-400 hover:bg-green-500/20'}`}
                >
                  <CheckCircle2 size={18} />
                </button>
                <button 
                  onClick={() => registerPresenca.mutate({ tipo: 'funcionario', pessoa_id: func.id, estado: 'ausente' })} 
                  className="p-2 rounded-lg bg-dark-500 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition"
                >
                  <XCircle size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}