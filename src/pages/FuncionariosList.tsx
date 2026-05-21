import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchFuncionarios, deleteFuncionario } from '../api/funcionarios'
import { useAuth } from '../hooks/useAuth'
import { toast } from 'react-hot-toast'
import { Search, Plus, UserCheck, UserX, Calendar, Banknote } from 'lucide-react'

export default function FuncionariosList({ onAdd }: { onAdd: () => void }) {
  const [search, setSearch] = useState('')
  const { hasRole } = useAuth()
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['funcionarios', search],
    queryFn: () => fetchFuncionarios(search, '')
  })

  const deleteMutation = useMutation({
    mutationFn: deleteFuncionario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] })
      toast.success('Funcionário desligado com sucesso')
    },
    onError: (e: any) => toast.error(e.message || 'Erro ao desligar')
  })

  if (isLoading) return <div className="p-6 text-center text-gray-500">Carregando funcionários...</div>
  if (isError) return <div className="p-6 text-center text-red-500">Erro ao carregar dados</div>

  const list = data?.data || []

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Gestão de Funcionários</h1>
        {hasRole(['admin', 'coordenador']) && (
          <button onClick={onAdd} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
            <Plus size={18} /> Novo Funcionário
          </button>
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-center border rounded-lg px-3 py-2 bg-white w-full md:w-64">
          <Search size={18} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Pesquisar por nome..."
            className="outline-none w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.length === 0 ? (
          <p className="col-span-full text-center text-gray-400 py-8">Nenhum funcionário registado</p>
        ) : (
          list.map((f: any) => (
            <div key={f.id} className="bg-white rounded-xl shadow-sm border p-4 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-gray-800">{f.nome_completo}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  f.estado === 'ativo' ? 'bg-green-100 text-green-700' :
                  f.estado === 'ferias' ? 'bg-blue-100 text-blue-700' :
                  f.estado === 'licenca' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                }`}>{f.estado}</span>
              </div>
              <p className="text-sm text-gray-600 flex items-center gap-1"><UserCheck size={14} /> {f.cargo}</p>
              
              {/* ✅ LINHA ÚNICA E CORRETA: SALÁRIO + MOEDA DINÂMICA */}
              <p className="text-sm text-gray-600 flex items-center gap-1 font-medium">
                <Banknote size={14} /> {Number(f.salario_base || 0).toFixed(2)} {f.moeda || 'AOA'}
              </p>
              
              <p className="text-sm text-gray-500 flex items-center gap-1"><Calendar size={14} /> Adm: {new Date(f.data_admissao).toLocaleDateString()}</p>
              
              {hasRole(['admin', 'coordenador']) && f.estado === 'ativo' && (
                <button
                  onClick={() => deleteMutation.mutate(f.id)}
                  disabled={deleteMutation.isPending}
                  className="mt-2 flex items-center justify-center gap-1 text-sm text-red-500 hover:text-red-700 border border-red-200 rounded py-1 hover:bg-red-50 transition disabled:opacity-50"
                >
                  <UserX size={14} /> Desligar
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}