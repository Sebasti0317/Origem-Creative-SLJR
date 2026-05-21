import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('🚨 Variáveis de ambiente faltando:')
  console.error('  VITE_SUPABASE_URL:', supabaseUrl)
  console.error('  VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Definida' : '❌ FALTANDO')
  throw new Error('Supabase não configurado. Verifica o ficheiro .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' }
})