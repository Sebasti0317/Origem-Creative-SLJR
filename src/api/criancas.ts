import { supabase } from '../lib/supabase'

export interface Crianca {
  id: string
  nome_completo: string
  data_nascimento?: string
  genero?: string
  estado: string
  observacoes?: string
  encarregado_nome?: string
  encarregado_contacto?: string
  moradia_anterior?: string
  contacto_familiar?: string
  parentesco_encarregado?: string
  created_at: string
  updated_at: string
}

export async function getCriancas() {
  const { data, error } = await supabase
    .from('criancas')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createCrianca(payload: Omit<Crianca, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('criancas')
    .insert({ ...payload, created_at: new Date().toISOString() })
    .select()
  if (error) throw error
  return data[0]
}

export async function updateCrianca(id: string, payload: Partial<Crianca>) {
  const { data, error } = await supabase
    .from('criancas')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
  if (error) throw error
  return data[0]
}

export async function deleteCrianca(id: string) {
  const { error } = await supabase.from('criancas').delete().eq('id', id)
  if (error) throw error
}