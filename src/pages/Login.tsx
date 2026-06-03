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
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#0f172a', 
      padding: 20 
    }}>
      <div style={{ 
        background: '#1e293b', 
        padding: 40, 
        borderRadius: 16, 
        border: '1px solid #334155', 
        width: '100%', 
        maxWidth: 400,
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
      }}>
        {/* ✅ LOGO CENTRALIZADO NO CABEÇALHO */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: 32,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img 
            src="/logo.png" 
            alt="Origem Creative SLJR" 
            style={{ 
              width: '220px', 
              height: 'auto',
              marginBottom: '12px',
              display: 'block'
            }} 
          />
          <p style={{ 
            color: '#64748b', 
            margin: 0, 
            fontSize: 13,
            textAlign: 'center'
          }}>
            Acesso restrito a pessoal autorizado
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ 
              display: 'block', 
              marginBottom: 8, 
              color: '#94a3b8', 
              fontSize: 13,
              fontWeight: 500
            }}>
              Email Institucional
            </label>
            <input 
              type="email" 
              required 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                background: '#0f172a', 
                border: '1px solid #334155', 
                borderRadius: 8, 
                color: '#e2e8f0', 
                fontSize: 14,
                boxSizing: 'border-box'
              }} 
              placeholder="nome@origem.sljr" 
            />
          </div>
          
          <div style={{ marginBottom: 28 }}>
            <label style={{ 
              display: 'block', 
              marginBottom: 8, 
              color: '#94a3b8', 
              fontSize: 13,
              fontWeight: 500
            }}>
              Senha
            </label>
            <input 
              type="password" 
              required 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                background: '#0f172a', 
                border: '1px solid #334155', 
                borderRadius: 8, 
                color: '#e2e8f0', 
                fontSize: 14,
                boxSizing: 'border-box'
              }} 
            />
          </div>

          <button 
            type="submit" 
            disabled={carregando} 
            style={{ 
              width: '100%', 
              padding: '14px', 
              background: '#6366f1', 
              color: '#fff', 
              border: 'none', 
              borderRadius: 8, 
              cursor: 'pointer', 
              fontWeight: 600, 
              fontSize: 15,
              opacity: carregando ? 0.7 : 1,
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}
          >
            {carregando ? 'A verificar...' : 'Entrar no Sistema'}
          </button>
        </form>

        <div style={{ 
          marginTop: 24, 
          textAlign: 'center', 
          fontSize: 12, 
          color: '#475569', 
          borderTop: '1px solid #334155', 
          paddingTop: 16 
        }}>
          Não tens acesso? Contacta o Administrador.
        </div>
      </div>
    </div>
  )
}
