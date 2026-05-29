import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => { carregarUsuarios() }, [])

  const carregarUsuarios = async () => {
    setCarregando(true)
    const { data } = await supabase.from('usuarios').select('*').order('created_at', { ascending: false })
    setUsuarios(data || [])
    setCarregando(false)
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>Gestão de Staff</h2>
        <p style={{ fontSize: 14, color: '#94a3b8', marginTop: 4 }}>Lista interna de funcionários registados no sistema</p>
      </div>

      {/* 🛡️ GUIA DE CRIAÇÃO DE CONTAS (Apenas visível para Admin) */}
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: 20, marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: 16, color: '#e2e8f0' }}>🔐 Como criar acesso de login para novo funcionário?</h3>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 16px 0' }}>
          Por segurança, o registo público está desativado. Apenas o Administrador pode criar contas:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: '#0f172a', padding: 16, borderRadius: 8, border: '1px solid #334155' }}>
            <b style={{ color: '#6366f1', fontSize: 13 }}>Método 1: Via Supabase (Recomendado)</b>
            <ol style={{ fontSize: 12, color: '#94a3b8', margin: '8px 0 0', paddingLeft: 18, lineHeight: 1.6 }}>
              <li>Vai a <b>Authentication → Users</b> no Supabase</li>
              <li>Clica em <b>"Invite User"</b></li>
              <li>Preenche o email e em Metadata cola: <code style={{background:'#1e293b',padding:'2px 4px',borderRadius:3}}>{"role":"educador"}</code></li>
              <li>O funcionário recebe email para definir a senha</li>
            </ol>
          </div>
          <div style={{ background: '#0f172a', padding: 16, borderRadius: 8, border: '1px solid #334155' }}>
            <b style={{ color: '#f59e0b', fontSize: 13 }}>Método 2: Via SQL Rápido</b>
            <ol style={{ fontSize: 12, color: '#94a3b8', margin: '8px 0 0', paddingLeft: 18, lineHeight: 1.6 }}>
              <li>Abre o <b>SQL Editor</b> no Supabase</li>
              <li>Cola: <code style={{background:'#1e293b',padding:'2px 4px',borderRadius:3}}>SELECT auth.create_user('email@x.com', 'Senha123!', '{"nome":"Nome","role":"educador"}');</code></li>
              <li>A senha temporária deve ser alterada no primeiro acesso</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Tabela de Staff Existente */}
      <div style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155', overflow: 'hidden' }}>
        {carregando ? (
          <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8' }}>A carregar...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#0f172a' }}>
              <tr>
                <th style={{ padding: 14, textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8' }}>Nome</th>
                <th style={{ padding: 14, textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8' }}>Cargo/Função</th>
                <th style={{ padding: 14, textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr><td colSpan={3} style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>Nenhum funcionário registado.</td></tr>
              ) : usuarios.map(u => (
                <tr key={u.id} style={{ borderTop: '1px solid #334155' }}>
                  <td style={{ padding: 14, color: '#e2e8f0' }}>{u.nome || u.nome_completo || '-'}</td>
                  <td style={{ padding: 14, color: '#94a3b8' }}>{u.cargo || 'Educador'}</td>
                  <td style={{ padding: 14 }}>
                    <span style={{ padding: '4px 10px', background: u.ativo !== false ? '#10b98120' : '#ef444420', color: u.ativo !== false ? '#10b981' : '#ef4444', borderRadius: 4, fontSize: 12 }}>
                      {u.ativo !== false ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
