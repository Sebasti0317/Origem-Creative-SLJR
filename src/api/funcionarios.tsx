import { supabase } from '../lib/supabase'

export interface Funcionario {
  id: string
  nome_completo: string
  cargo: string
  salario_base: number
  iban: string | null
  data_admissao: string
  estado: 'ativo' | 'ferias' | 'licenca' | 'desligado'
  created_at: string
  updated_at: string
}

export async function fetchFuncionarios(search = '', estado = '') {
  let query = supabase
    .from('funcionarios')
    .select('*', { count: 'exact' })
    .order('nome_completo', { ascending: true })

  if (search) query = query.ilike('nome_completo', '%' + search + '%')
  if (estado) query = query.eq('estado', estado)

  const { data, error, count } = await query
  if (error) throw error
  return { data: (data as Funcionario[]) || [], count: count || 0 }
}

export async function createFuncionario(payload: Omit<Funcionario, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase.from('funcionarios').insert(payload).select().single()
  if (error) throw error
  return data as Funcionario
}

export async function updateFuncionario(id: string, payload: Partial<Funcionario>) {
  const { data, error } = await supabase.from('funcionarios').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data as Funcionario
}

export async function deleteFuncionario(id: string) {
  // Soft delete: muda estado para 'desligado' em vez de apagar
  const { error } = await supabase.from('funcionarios').update({ estado: 'desligado' }).eq('id', id)
  if (error) throw error
}