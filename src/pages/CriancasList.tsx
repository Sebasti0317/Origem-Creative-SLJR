import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchCriancas, softDeleteCrianca } from '../api/criancas'
import { toast } from 'react-hot-toast'
import { Search, Trash2, Plus, RefreshCw } from 'lucide-react'

export default function CriancasList({ onAdd }: { onAdd: () => void }) {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()
  const pageSize = 5

  // Query simplificada - SEM keepPreviousData
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['criancas', page, search], // Muda quando page ou search muda
    queryFn: () => {
      console.log('🔄 Fetching page:', page, 'search:', search)
      return fetchCriancas(page, pageSize, search, '')
    },
    enabled: true // Força execução imediata
  })

  // Efeito para debug: loga quando dados chegam
  useEffect(() => {
    if (data) {
      console.log('✅ Dados recebidos:', data.data.length, 'registos, total:', data.count)
    }
  }, [data])

  const deleteMutation = useMutation({
    mutationFn: softDeleteCrianca,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['criancas'] })
      toast.success('Registo arquivado')
    },
    onError: (e: any) => toast.error(e.message || 'Erro ao arquivar')
  })

  if (isLoading) return <div className="p-6 text-center text-gray-500">Carregando...</div>
  if (isError) return <div className="p-6 text-center text-red-500">Erro ao carregar dados</div>

  const criancas = data?.data || []
  const total = data?.count || 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  // Handlers com logging e refetch explícito
  const handlePrev = () => {
    if (page > 0) {
      console.log('⬅️ Anterior:', page, '->', page - 1)
      setPage(page - 1)
      // Força re-fetch imediato após mudar estado
      setTimeout(() => refetch(), 50)
    }
  }

  const handleNext = () => {
    if (page < totalPages - 1) {
      console.log('➡️ Seguinte:', page, '->', page + 1)
      setPage(page + 1)
      setTimeout(() => refetch(), 50)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Gestão de Crianças</h1>
        <button onClick={onAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
          <Plus size={18} /> Nova Criança
        </button>
      </div>

      <div className="mb-4 flex gap-2">
        <div className="flex items-center border rounded-lg px-3 py-2 bg-white w-full md:w-64">
          <Search size={18} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Pesquisar..."
            className="outline-none w-full"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          />
        </div>
        <button 
          onClick={() => { setPage(0); setSearch(''); refetch() }}
          className="flex items-center gap-1 px-3 py-2 border rounded hover:bg-gray-50 text-sm"
        >
          <RefreshCw size={14} /> Limpar
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Nome</th>
              <th className="p-4 font-semibold text-gray-600">Estado</th>
              <th className="p-4 font-semibold text-gray-600">Entrada</th>
              <th className="p-4 font-semibold text-gray-600">Ações</th>
            </tr>
          </thead>
          <tbody>
            {criancas.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-400">Nenhum registo encontrado</td>
              </tr>
            ) : (
              criancas.map((c: any) => (
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{c.nome_completo}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      c.estado === 'ativo' ? 'bg-green-100 text-green-700' :
                      c.estado === 'transitorio' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                    }`}>{c.estado}</span>
                  </td>
                  <td className="p-4 text-gray-600">{new Date(c.data_entrada).toLocaleDateString()}</td>
                  <td className="p-4">
                    <button
                      onClick={() => deleteMutation.mutate(c.id)}
                      disabled={deleteMutation.isPending}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50"
                      title="Arquivar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação com estado visual claro */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePrev}
          disabled={page === 0 || isFetching}
          className={`px-4 py-2 rounded transition ${
            page === 0 || isFetching 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isFetching ? 'A carregar...' : 'Anterior'}
        </button>
        
        <span className="text-sm text-gray-600">
          Página {page + 1} de {totalPages} • {total} registos {isFetching && '⟳'}
        </span>
        
        <button
          onClick={handleNext}
          disabled={page >= totalPages - 1 || isFetching}
          className={`px-4 py-2 rounded transition ${
            page >= totalPages - 1 || isFetching 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isFetching ? 'A carregar...' : 'Seguinte'}
        </button>
      </div>
    </div>
  )
}