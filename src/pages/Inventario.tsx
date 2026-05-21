import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { toast } from 'react-hot-toast'
import { Package, Plus, Edit, Trash2, AlertTriangle } from 'lucide-react'

export default function Inventario() {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ nome: '', quantidade: 0, categoria: '', stock_minimo: 0 })
  const queryClient = useQueryClient()

  const { data: itens } = useQuery({
    queryKey: ['inventario'],
    queryFn: async () => {
      const { data } = await supabase.from('inventario').select('*').order('nome')
      return data || []
    }
  })

  const createItem = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('inventario').insert(data)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventario'] })
      toast.success('Item adicionado')
      setShowForm(false)
      setFormData({ nome: '', quantidade: 0, categoria: '', stock_minimo: 0 })
    }
  })

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('inventario').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventario'] })
      toast.success('Item removido')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createItem.mutate(formData)
  }

  const lowStock = itens?.filter((i: any) => i.quantidade <= (i.stock_minimo || 5)) || []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Inventário</h1>
          <p className="text-slate-400 text-sm mt-1">Gestão de stock e materiais</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Novo Item
        </button>
      </div>

      {/* Alertas de Stock Baixo */}
      {lowStock.length > 0 && (
        <div className="card border-amber-500/30 bg-amber-500/10">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle size={20} className="text-amber-400" />
            <h3 className="text-lg font-semibold text-amber-400">Stock Crítico ({lowStock.length} itens)</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((item: any) => (
              <span key={item.id} className="badge badge-amber">
                {item.nome}: {item.quantidade} un.
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Itens */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-dark-600">
                <th className="pb-3 font-medium">Item</th>
                <th className="pb-3 font-medium">Categoria</th>
                <th className="pb-3 font-medium">Quantidade</th>
                <th className="pb-3 font-medium">Stock Mínimo</th>
                <th className="pb-3 font-medium">Estado</th>
                <th className="pb-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {itens?.map((item: any) => (
                <tr key={item.id} className="border-b border-dark-600/50 hover:bg-dark-600/30">
                  <td className="py-3 font-medium text-white">{item.nome}</td>
                  <td className="py-3">{item.categoria || 'Geral'}</td>
                  <td className="py-3">{item.quantidade}</td>
                  <td className="py-3">{item.stock_minimo || 5}</td>
                  <td className="py-3">
                    {item.quantidade <= (item.stock_minimo || 5) ? (
                      <span className="badge badge-red">Crítico</span>
                    ) : (
                      <span className="badge badge-green">OK</span>
                    )}
                  </td>
                  <td className="py-3">
                    <button onClick={() => deleteItem.mutate(item.id)} className="text-red-400 hover:text-red-300">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Adicionar */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Adicionar Item</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Nome do item"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="input-field"
                required
              />
              <input
                type="text"
                placeholder="Categoria"
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="input-field"
              />
              <input
                type="number"
                placeholder="Quantidade"
                value={formData.quantidade}
                onChange={(e) => setFormData({ ...formData, quantidade: parseInt(e.target.value) })}
                className="input-field"
                required
              />
              <input
                type="number"
                placeholder="Stock mínimo"
                value={formData.stock_minimo}
                onChange={(e) => setFormData({ ...formData, stock_minimo: parseInt(e.target.value) })}
                className="input-field"
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" className="btn-primary flex-1">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}