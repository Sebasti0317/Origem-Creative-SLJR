import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [carregando, setCarregando] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCarregando(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password
      })
      if (error) throw error
      toast.success('Bem-vindo!')
    } catch (err) {
      toast.error(err.message || 'Credenciais inválidas')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: 20 }}>
      <div style={{ background: '#1e293b', padding: 32, borderRadius: 16, border: '1px solid #334155', width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🔐</div>
          <h1 style={{ fontSize: 22, fontWeight: 'bold', margin: '0 0 8px', color: '#e2e8f0' }}>Origem Creative SLJR</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: 13 }}>Acesso restrito a pessoal autorizado</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, color: '#94a3b8', fontSize: 13 }}>Email Institucional</label>
            <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 14 }} placeholder="nome@origem.sljr" />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 6, color: '#94a3b8', fontSize: 13 }}>Senha</label>
            <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 14 }} />
          </div>

          <button type="submit" disabled={carregando} style={{ width: '100%', padding: '14px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 15, opacity: carregando ? 0.7 : 1 }}>
            {carregando ? 'A verificar...' : 'Entrar no Sistema'}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: '#475569', borderTop: '1px solid #334155', paddingTop: 16 }}>
          Não tens acesso? Contacta o Administrador.
        </div>
      </div>
    </div>
  )
}
