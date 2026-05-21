import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchUserRoles, updateUserRole, searchUsers } from '../api/users'
import { useAuth } from '../hooks/useAuth'
import { toast } from 'react-hot-toast'
import { Search, Shield, UserCog, Loader2, Check, X, AlertCircle } from 'lucide-react'

export default function UserManagement() {
  // ✅ TODOS OS HOOKS NO TOPO - SEMPRE NA MESMA ORDEM
  const [search, setSearch] = useState('')
  const [selectedEmail, setSelectedEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState<'admin' | 'coordenador' | 'assistente'>('assistente')
  const { hasRole } = useAuth()
  const queryClient = useQueryClient()

  const { data: roles, isLoading, error: rolesError } = useQuery({
    queryKey: ['userRoles'],
    queryFn: fetchUserRoles,
    enabled: hasRole('admin'),
    retry: false
  })

  const { data: searchResults } = useQuery({
    queryKey: ['userSearch', search],
    queryFn: () => searchUsers(search),
    enabled: hasRole('admin') && search.length >= 3,
    staleTime: 1000 * 30,
    retry: false
  })

  const assignRoleMutation = useMutation({
    mutationFn: ({ email, role }: { email: string; role: any }) => updateUserRole(email, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userRoles'] })
      toast.success('Perfil atualizado com sucesso')
      setSelectedEmail('')
      setSearch('')
    },
    onError: (e: any) => toast.error(e.message || 'Erro ao atualizar perfil')
  })

  // ✅ RENDER CONDICIONAL NO FIM (depois de todos os hooks)
  if (!hasRole('admin')) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="mx-auto text-red-500 mb-3" size={32} />
          <h3 className="font-semibold text-red-700 mb-2">🔐 Acesso Restrito</h3>
          <p className="text-sm text-red-600">Apenas administradores podem gerir perfis de utilizadores.</p>
        </div>
      </div>
    )
  }

  const handleAssign = () => {
    if (!selectedEmail) {
      toast.error('Seleciona um utilizador primeiro')
      return
    }
    assignRoleMutation.mutate({ email: selectedEmail, role: selectedRole })
  }

  const getRoleColor = (role: string) => {
    if (role === 'admin') return 'bg-red-100 text-red-700 border-red-200'
    if (role === 'coordenador') return 'bg-blue-100 text-blue-700 border-blue-200'
    return 'bg-gray-100 text-gray-700 border-gray-200'
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Shield size={24} className="text-purple-600" />
        <h1 className="text-2xl font-bold text-gray-800">Gestão de Perfis</h1>
      </div>

      {/* 🔍 Busca de Utilizadores */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">Atribuir Novo Perfil</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Pesquisar por Email</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="ex: colaborador@centro.org"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setSelectedEmail('') }}
                className="w-full border rounded pl-9 px-3 py-2"
              />
            </div>
            {search.length >= 3 && (
              <div className="mt-2 max-h-40 overflow-y-auto border rounded bg-white z-10">
                {searchResults && searchResults.length > 0 ? (
                  searchResults.map((u: any) => (
                    <button
                      key={u.id}
                      onClick={() => { setSelectedEmail(u.email); setSearch('') }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex justify-between ${selectedEmail === u.email ? 'bg-blue-50' : ''}`}
                    >
                      <span>{u.email}</span>
                      {selectedEmail === u.email && <Check size={14} className="text-green-600" />}
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-2 text-sm text-gray-400">Nenhum resultado</p>
                )}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as any)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="assistente">Assistente (leitura)</option>
              <option value="coordenador">Coordenador (leitura + edição)</option>
              <option value="admin">Administrador (acesso total)</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button
            onClick={handleAssign}
            disabled={!selectedEmail || assignRoleMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {assignRoleMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <UserCog size={16} />}
            {assignRoleMutation.isPending ? 'A atualizar...' : 'Atribuir Perfil'}
          </button>
          {selectedEmail && (
            <button onClick={() => { setSelectedEmail(''); setSearch('') }} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">
              <X size={16} />
            </button>
          )}
        </div>
        {selectedEmail && <p className="text-xs text-gray-500 mt-2">A atribuir <strong>{selectedRole}</strong> a: {selectedEmail}</p>}
      </div>

      {/* 👥 Lista de Utilizadores com Roles */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Utilizadores com Perfis</h3>
          <button onClick={() => queryClient.invalidateQueries({ queryKey: ['userRoles'] })} className="text-sm text-blue-600 hover:underline">Atualizar</button>
        </div>
        
        {isLoading && (
          <div className="p-8 text-center text-gray-500"><Loader2 className="animate-spin mx-auto" size={24} /> A carregar...</div>
        )}
        
        {!isLoading && rolesError && (
          <div className="p-6 text-center text-red-500 text-sm">
            <p>⚠️ Não foi possível carregar a lista de utilizadores.</p>
            <p className="text-xs mt-1">Verifica as políticas RLS em Supabase → user_roles</p>
            <button onClick={() => queryClient.invalidateQueries({ queryKey: ['userRoles'] })} className="mt-3 text-blue-600 hover:underline text-xs">Tentar novamente</button>
          </div>
        )}
        
        {!isLoading && !rolesError && roles && roles.length === 0 && (
          <p className="p-6 text-center text-gray-400">Nenhum perfil atribuído ainda</p>
        )}
        
        {!isLoading && !rolesError && roles && roles.length > 0 && (
          <div className="divide-y">
            {roles.map((r: any) => (
              <div key={r.user_id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-800">{r.email}</p>
                  <p className="text-xs text-gray-400">Atribuído em: {new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(r.role)}`}>
                  {r.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ℹ️ Legenda de Permissões */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <p className="font-medium mb-2">📋 Resumo de Permissões:</p>
        <ul className="space-y-1">
          <li><strong className="text-red-600">Admin</strong>: Acesso total a todas as funcionalidades e gestão de utilizadores</li>
          <li><strong className="text-blue-600">Coordenador</strong>: Criar/editar crianças e funcionários, gerar folhas, ver dashboard</li>
          <li><strong className="text-gray-600">Assistente</strong>: Visualizar crianças e documentos, registar observações básicas</li>
        </ul>
      </div>
    </div>
  )
}