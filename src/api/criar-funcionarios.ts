const fs = require('fs');
const path = require('path');

const dir = path.join('src', 'api');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// Conteúdo SEM caracteres especiais (ó, ã, ç) para evitar encoding issues
const content = `import { supabase } from '../lib/supabase'

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
  return { data: (data || []), count: count || 0 }
}

export async function createFuncionario(payload) {
  const { data, error } = await supabase.from('funcionarios').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateFuncionario(id, payload) {
  const { data, error } = await supabase.from('funcionarios').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteFuncionario(id) {
  const { error } = await supabase.from('funcionarios').update({ estado: 'desligado' }).eq('id', id)
  if (error) throw error
}`;

fs.writeFileSync(path.join(dir, 'funcionarios.ts'), content, 'utf8');
console.log('✅ src/api/funcionarios.ts criado com UTF-8 puro.');