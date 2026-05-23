import { supabase } from '../lib/supabase'

export interface Funcionario {
  id: string
  nome_completo: string
  cargo?: string
  departamento?: string
  contacto?: string
  email?: string
  data_admissao?: string
  estado: string
  created_at: string
  updated_at: string
}

export async function getFuncionarios() {
  const { data, error } = await supabase.from('funcionarios').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createFuncionario(payload: Omit<Funcionario, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase.from('funcionarios').insert({ ...payload, created_at: new Date().toISOString() }).select()
  if (error) throw error
  return data[0]
}

export async function updateFuncionario(id: string, payload: Partial<Funcionario>) {
  const { data, error } = await supabase.from('funcionarios').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id).select()
  if (error) throw error
  return data[0]
}