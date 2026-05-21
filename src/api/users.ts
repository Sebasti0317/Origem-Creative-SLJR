import { supabase } from '../lib/supabase'

export async function fetchUserRoles() {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('user_id, role, email, created_at')
      .order('created_at', { ascending: false })

    if (error) return []
    return data || []
  } catch { return [] }
}

export async function updateUserRole(email: string, role: string) {
  try {
    const { data, error } = await supabase.rpc('gestao_roles', { p_email: email, p_role: role })
    
    if (error) throw new Error(error.message || 'Erro ao comunicar com o servidor')
    if (!data?.[0]?.success) throw new Error(data?.[0]?.message || 'Operação falhou')
    
    return { success: true, message: data[0].message }
  } catch (e: any) {
    console.error('❌ updateUserRole:', e)
    throw e
  }
}

export async function searchUsers(query: string) {
  try {
    if (!query || query.length < 2) return []
    const { data, error } = await supabase.rpc('search_user_emails', { p_query: query })
    if (error) return []
    return (data || []).map((u: any) => ({ id: u.user_id, email: u.email }))
  } catch { return [] }
}