import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { APP_CONFIG } from '../config/appConfig'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-dark-800 flex items-center justify-center p-4">
      <div className="bg-dark-900 rounded-2xl p-8 w-full max-w-md border border-dark-700">
        <div className="text-center mb-6">
          <div className="h-12 w-12 bg-brand-500 rounded-xl flex items-center justify-center font-bold text-white text-xl mx-auto mb-3">OC</div>
          <h1 className="text-xl font-bold text-white">{APP_CONFIG.name}</h1>
          <p className="text-slate-400 text-sm">Acesso ao sistema de gestão</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 rounded-lg bg-dark-700 border border-dark-600 text-white" required />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 rounded-lg bg-dark-700 border border-dark-600 text-white" required />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-brand-500 hover:bg-brand-600 text-white py-3 rounded-lg font-medium transition disabled:opacity-50">
            {loading ? 'A entrar...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}