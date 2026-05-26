import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface Usuario {
  id: string
  nome: string
  email: string
  role: 'admin' | 'educador'
  ativo: boolean
  dataCriacao: string
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nome: '', email: '', role: 'educador' as 'admin' | 'educador', ativo: true
  })
  const [senha, setSenha] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('usuarios_db')
    if (saved) {
      setUsuarios(JSON.parse(saved))
    } else {
      // Criar utilizador admin padrão se não existir
      const adminDefault: Usuario = {
        id: 'admin-001',
        nome: 'Administrador',
        email: 'admin@origem.sljr',
        role: 'admin',
        ativo: true,
        dataCriacao: new Date().toISOString()
      }
      setUsuarios([adminDefault])
      localStorage.setItem('usuarios_db', JSON.stringify([adminDefault]))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('usuarios_db', JSON.stringify(usuarios))
  }, [usuarios])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nome || !formData.email) return toast.error('Preenche nome e email')

    if (editingId) {
      setUsuarios(usuarios.map(u => u.id === editingId ? { ...u, ...formData } : u))
      toast.success('Utilizador atualizado!')
    } else {
      // Verificar se email já existe
      if (usuarios.some(u => u.email === formData.email)) {
        return toast.error('Email já registado')
      }
      const novoUsuario: Usuario = {
        id: Date.now().toString(),
        ...formData,
        dataCriacao: new Date().toISOString()
      }
      setUsuarios([...usuarios, novoUsuario])
      toast.success('Utilizador criado! Envie as credenciais em segurança.')
    }
    resetForm()
  }

  const resetForm = () => {
    setFormData({ nome: '', email: '', role: 'educador', ativo: true })
    setSenha('')
    setEditingId(null)
    setShowForm(false)
  }

  const startEdit = (u: Usuario) => {
    setFormData({ nome: u.nome, email: u.email, role: u.role, ativo: u.ativo })
    setEditingId(u.id)
    setShowForm(true)
  }

  const toggleAtivo = (id: string) => {
    setUsuarios(usuarios.map(u => u.id === id ? { ...u, ativo: !u.ativo } : u))
    toast.success('Estado atualizado')
  }

  const removerUsuario = (id: string) => {
    if (id === 'admin-001') return toast.error('Não podes remover o administrador principal')
    if (confirm('Remover este utilizador?')) {
      setUsuarios(usuarios.filter(u => u.id !== id))
      toast.success('Utilizador removido')
    }
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 'bold', margin: 0, color: '#e2e8f0' }}>Gestão de Utilizadores</h2>
          <p style={{ fontSize: 14, color: '#94a3b8', margin: '4px 0 0' }}>Apenas administradores podem gerir utilizadores</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 18px', background: showForm ? '#64748b' : '#6366f1', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}>
          {showForm ? 'Cancelar' : '+ Novo Utilizador'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#1e293b', padding: 24, borderRadius: 12, border: '1px solid #334155', marginBottom: 24 }}>
          <h3 style={{ marginTop: 0, marginBottom: 20, fontSize: 18, color: '#e2e8f0' }}>{editingId ? 'Editar' : 'Criar'} Utilizador</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, color: '#94a3b8', fontSize: 13 }}>Nome Completo *</label>
                <input type="text" required value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0', fontSize: 14 }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, color: '#94a3b8', fontSize: 13 }}>Email *</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0', fontSize: 14 }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, color: '#94a3b8', fontSize: 13 }}>Função</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'educador' })} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0', fontSize: 14 }}>
                  <option value="educador">Educador Social</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, color: '#94a3b8', fontSize: 13 }}>Estado</label>
                <select value={formData.ativo ? 'ativo' : 'inativo'} onChange={(e) => setFormData({ ...formData, ativo: e.target.value === 'ativo' })} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0', fontSize: 14 }}>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
            </div>
            {!editingId && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, color: '#94a3b8', fontSize: 13 }}>Senha Inicial (opcional)</label>
                <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Gerar senha automática se vazio" style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0', fontSize: 14 }} />
              </div>
            )}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" onClick={resetForm} style={{ padding: '10px 20px', background: '#334155', color: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancelar</button>
              <button type="submit" style={{ padding: '10px 20px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}>{editingId ? 'Guardar Alterações' : 'Criar Utilizador'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Utilizadores */}
      <div style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#0f172a' }}>
            <tr>
              <th style={{ padding: 14, textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8' }}>Nome</th>
              <th style={{ padding: 14, textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8' }}>Email</th>
              <th style={{ padding: 14, textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8' }}>Função</th>
              <th style={{ padding: 14, textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8' }}>Estado</th>
              <th style={{ padding: 14, textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8' }}>Criado Em</th>
              <th style={{ padding: 14, textAlign: 'right', borderBottom: '1px solid #334155', color: '#94a3b8' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} style={{ borderTop: '1px solid #334155' }}>
                <td style={{ padding: 14, color: '#e2e8f0', fontWeight: 500 }}>{u.nome}</td>
                <td style={{ padding: 14, color: '#94a3b8' }}>{u.email}</td>
                <td style={{ padding: 14 }}>
                  <span style={{ padding: '4px 10px', background: u.role === 'admin' ? '#f59e0b20' : '#6366f120', color: u.role === 'admin' ? '#f59e0b' : '#6366f1', borderRadius: 4, fontSize: 12 }}>
                    {u.role === 'admin' ? 'Administrador' : 'Educador'}
                  </span>
                </td>
                <td style={{ padding: 14 }}>
                  <button onClick={() => toggleAtivo(u.id)} style={{ padding: '4px 12px', background: u.ativo ? '#10b98120' : '#ef444420', color: u.ativo ? '#10b981' : '#ef4444', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                    {u.ativo ? 'Ativo' : 'Inativo'}
                  </button>
                </td>
                <td style={{ padding: 14, color: '#64748b', fontSize: 13 }}>{new Date(u.dataCriacao).toLocaleDateString('pt-PT')}</td>
                <td style={{ padding: 14, textAlign: 'right' }}>
                  <button onClick={() => startEdit(u)} style={{ padding: '6px 12px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, marginRight: 6 }}>Editar</button>
                  <button onClick={() => removerUsuario(u.id)} disabled={u.id === 'admin-001'} style={{ padding: '6px 12px', background: u.id === 'admin-001' ? '#475569' : '#ef4444', color: '#fff', border: 'none', borderRadius: 4, cursor: u.id === 'admin-001' ? 'not-allowed' : 'pointer', fontSize: 12, opacity: u.id === 'admin-001' ? 0.6 : 1 }}>Remover</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 24, padding: 16, background: '#0f172a', borderRadius: 8, border: '1px solid #334155', fontSize: 12, color: '#64748b' }}>
        <p style={{ margin: 0 }}>⚠️ Nota: As senhas não são armazenadas neste protótipo. Num ambiente de produção, utilize autenticação segura (Supabase Auth, bcrypt, etc.).</p>
      </div>
    </div>
  )
}
