import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export type UserRole = 'admin' | 'coordenador' | 'assistente' | null

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<UserRole>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    let timeout: number | undefined

    const loadAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (mounted && session?.user) {
          setUser(session.user)
          const { data } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single()
          setRole(data?.role as UserRole)
          console.log('✅ Auth carregado | Role:', data?.role)
        }
      } catch (e) {
        console.warn('⚠️ Falha ao carregar auth:', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadAuth()

    // 🔒 Segurança: nunca fica preso > 3 segundos
    timeout = window.setTimeout(() => {
      if (mounted) {
        console.warn('⏱️ Timeout de auth. Forçando estado pronto.')
        setLoading(false)
      }
    }, 3000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      if (session?.user) {
        setUser(session.user)
        supabase.from('user_roles').select('role').eq('user_id', session.user.id).single()
          .then(({ data }) => setRole(data?.role as UserRole))
      } else {
        setUser(null)
        setRole(null)
      }
      setLoading(false)
      if (timeout) clearTimeout(timeout)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
      if (timeout) clearTimeout(timeout)
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  const hasRole = (allowed: UserRole | UserRole[]) => {
    if (!role) return false
    return Array.isArray(allowed) ? allowed.includes(role) : role === allowed
  }

  return { user, role, loading, signOut, hasRole }
}