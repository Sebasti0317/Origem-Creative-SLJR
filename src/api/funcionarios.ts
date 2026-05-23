import { supabase } from '../lib/supabase'

export interface Funcionario {
  id: string
  nome_completo: string
  estado: string
}

export async function getFuncionarios() {
  const { data, error } = await supabase.from('funcionarios').select('*')
  if (error) throw error
  return data || []
}