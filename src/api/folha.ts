import { supabase } from '../lib/supabase'

export async function salvarFolha(payload: any) {
  const { data, error } = await supabase.from('folha_pagamento').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function fetchFolhas(funcionarioId?: string) {
  let query = supabase
    .from('folha_pagamento')
    .select('*, funcionarios(nome_completo)')
    .order('mes_referencia', { ascending: false })

  if (funcionarioId) query = query.eq('funcionario_id', funcionarioId)

  const { data, error } = await query
  if (error) throw error
  return data || []
}