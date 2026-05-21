import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export type UserRole = 'admin' | 'coordenador' | 'assistente' | null

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<UserRole>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      
      if (session?.user) {
        console.log('👤 Utilizador logado:', session.user.email)
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single()
        
        if (error) {
          console.warn('⚠️ Erro ao ler role:', error.message)
          setRole(null)
        } else {
          console.log('✅ Role encontrada:', data.role)
          setRole(data.role as UserRole)
        }
      } else {
        setRole(null)
      }
      setLoading(false)
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data } = await supabase.from('user_roles').select('role').eq('user_id', session.user.id).single()
        setRole(data?.role as UserRole)
        console.log('🔄 AuthStateChange - Role:', data?.role)
      } else {
        setRole(null)
        console.log('🔄 AuthStateChange - Sem sessão')
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setRole(null)
    window.location.reload() // Força reset total
  }

  const hasRole = (allowed: UserRole | UserRole[]) => {
    if (!role) return false
    return Array.isArray(allowed) ? allowed.includes(role) : role === allowed
  }

  return { user, role, loading, signOut, hasRole }
}