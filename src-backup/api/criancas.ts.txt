import { supabase } from '../lib/supabase'

export interface Crianca {
  id: string
  nome_completo: string
  estado: string
  created_at: string
}

export async function getCriancas() {
  const { data, error } = await supabase.from('criancas').select('*')
  if (error) throw error
  return data || []
}