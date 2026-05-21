import { supabase } from '../lib/supabase'

export interface ConfigFiscal {
  id: string
  instituicao_nome: string
  isento_irt: boolean
  isento_inss: boolean
  isento_tsu: boolean
  percentagem_irt_personalizada: number | null
  percentagem_inss_personalizada: number | null
  observacoes: string | null
  ativo: boolean
  criado_em: string
  atualizado_em: string
}

export async function getConfigFiscal() {
  const { data, error } = await supabase
    .from('configuracoes_fiscais')
    .select('*')
    .eq('ativo', true)
    .order('criado_em', { ascending: false })
    .limit(1)
    .single()
  
  if (error) throw error
  return data as ConfigFiscal
}

export async function updateConfigFiscal(id: string, updates: Partial<ConfigFiscal>) {
  const { data, error } = await supabase
    .from('configuracoes_fiscais')
    .update({ ...updates, atualizado_em: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as ConfigFiscal
}