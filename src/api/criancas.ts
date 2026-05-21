import { supabase } from '../lib/supabase'

type EstadoAcolhimento = 'ativo' | 'transitorio' | 'desligado'

export interface Crianca {
  id: string
  nome_completo: string
  data_nascimento: string
  genero: string | null
  contacto_emergencia: string | null
  estado: EstadoAcolhimento
  observacoes_psicossociais: string | null
  data_entrada: string
  data_saida: string | null
  deleted_at: string | null
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface CriancaFormData {
  nome_completo: string
  data_nascimento: string
  genero: string
  contacto_emergencia: string
  estado: EstadoAcolhimento
  observacoes_psicossociais: string
  data_entrada: string
  data_saida?: string
}

export async function fetchCriancas(page = 0, pageSize = 10, search = '', estado = '') {
  const from = page * pageSize
  const to = from + pageSize - 1

  // Constrói a query base
  let query = supabase
    .from('criancas')
    .select('*', { count: 'exact' })
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  // Aplica filtros
  if (search) query = query.ilike('nome_completo', '%' + search + '%')
  if (estado) query = query.eq('estado', estado)

  // Aplica paginação SEMPRE (Supabase lida com ranges vazios)
  const { data, error, count } = await query.range(from, to)
  
  if (error) throw error
  
  return { 
    data: data || [], 
    count: count || 0,
    hasNextPage: count ? (from + pageSize) < count : false
  }
}

export async function createCrianca(payload: CriancaFormData) {
  const { data, error } = await supabase.from('criancas').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateCrianca(id: string, payload: Partial<CriancaFormData>) {
  const { data, error } = await supabase.from('criancas').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function softDeleteCrianca(id: string) {
  const { error } = await supabase.from('criancas').update({ deleted_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
}