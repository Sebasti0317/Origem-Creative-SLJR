import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { APP_CONFIG } from '../config/appConfig'
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      toast.success('Bem-vindo de volta!')
      // O redirect é automático pelo estado de auth no App.tsx
    } catch (err: any) {
      setError(err.message || 'Falha ao autenticar. Verifique as credenciais.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-800 flex items-center justify-center p-4">
      <div className="card w-full max-w-md space-y-6">
        
        {/*  Logo & Nome da Instituição */}
        <div className="text-center space-y-3">
          {APP_CONFIG.logo ? (
            <img 
              src={APP_CONFIG.logo} 
              alt="Logo Instituição" 
              className="h-20 w-20 mx-auto object-contain drop-shadow-lg" 
            />
          ) : (
            <div className="h-20 w-20 mx-auto bg-brand-500 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-brand-500/30">
              OC
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">{APP_CONFIG.name}</h1>
            <p className="text-slate-400 text-sm">Acesso ao painel de gestão</p>
          </div>
        </div>

        {/* ⚠️ Mensagem de Erro */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm animate-pulse">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/*  Formulário de Login */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Email Institucional</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10"
                placeholder="admin@centro.org"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-6 h-11"
          >
            {loading ? (
              <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={18} />
                Entrar no Sistema
              </>
            )}
          </button>
        </form>

        {/*  Rodapé de Créditos */}
        <div className="text-center pt-4 border-t border-dark-600/50">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} {APP_CONFIG.name}
          </p>
          <p className="text-[10px] text-slate-600 mt-1">
            Powered by Origem Creative SLJR • v{APP_CONFIG.version}
          </p>
        </div>

      </div>
    </div>
  )
}