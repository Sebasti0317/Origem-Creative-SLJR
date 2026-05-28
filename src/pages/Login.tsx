import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [isSignup, setIsSignup] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '', nome: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCarregando(true)

    try {
      if (isSignup) {
        // Registo
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: { data: { nome: formData.nome, role: 'educador' } }
        })
        if (error) throw error
        toast.success('Conta criada! Faz login.')
        setIsSignup(false)
      } else {
        // Login
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        })
        if (error) throw error
        toast.success('Login efetuado!')
      }
    } catch (err) {
      toast.error(err.message || 'Erro na autenticação')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: 20 }}>
      <div style={{ background: '#1e293b', padding: 32, borderRadius: 16, border: '1px solid #334155', width: '100%', maxWidth: 400, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 'bold', margin: '0 0 8px', color: '#6366f1' }}>Origem Creative SLJR</h1>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: 14 }}>Área Reservada</p>
        </div>

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, color: '#94a3b8', fontSize: 13 }}>Nome Completo</label>
              <input type="text" required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0' }} />
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, color: '#94a3b8', fontSize: 13 }}>Email</label>
            <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0' }} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 6, color: '#94a3b8', fontSize: 13 }}>Senha</label>
            <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0' }} />
          </div>

          <button type="submit" disabled={carregando} style={{ width: '100%', padding: '12px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 15 }}>
            {carregando ? 'A processar...' : (isSignup ? 'Criar Conta' : 'Entrar')}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>
          {isSignup ? 'Já tens conta? ' : 'Não tens conta? '}
          <button type="button" onClick={() => setIsSignup(!isSignup)} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontWeight: 600 }}>
            {isSignup ? 'Fazer Login' : 'Registar'}
          </button>
        </div>
      </div>
    </div>
  )
}
