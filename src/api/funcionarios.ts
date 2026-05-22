import { supabase } from '../lib/supabase'

export interface Funcionario {
  id: string
  nome_completo: string
  cargo: string
  salario_base: number
  moeda: string
  regiao: string
  iban: string | null
  data_admissao: string
  estado: 'ativo' | 'ferias' | 'licenca' | 'desligado'
  created_at: string
  updated_at: string
}

export async function fetchfuncionarios() {
  const { data, error } = await supabase
    .from('funcionarios')
    .select('id, nome_completo, data_nascimento, estado, genero, encarregado_nome, centro_id') // ✅ Apenas o necessário
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

  if (search) query = query.ilike('nome_completo', '%' + search + '%')
  if (estado) query = query.eq('estado', estado)

  const { data, error, count } = await query
  if (error) throw error
  return { data: (data || []), count: count || 0 }
}

export async function createFuncionario(payload: any) {
  const { data, error } = await supabase.from('funcionarios').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateFuncionario(id: string, payload: any) {
  const { data, error } = await supabase.from('funcionarios').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteFuncionario(id: string) {
  const { error } = await supabase.from('funcionarios').update({ estado: 'desligado' }).eq('id', id)
  if (error) throw error
}