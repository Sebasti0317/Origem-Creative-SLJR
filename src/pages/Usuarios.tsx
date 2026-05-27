import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [formData, setFormData] = useState({
    nome: '', email: '', role: 'educador', ativo: true
  })

  useEffect(() => { carregarUsuarios() }, [])

  const carregarUsuarios = async () => {
    setCarregando(true)
    const { data, error } = await supabase.from('usuarios').select('*').order('created_at', { ascending: false })
    if (error) {
      toast.error('Erro ao carregar utilizadores')
      console.error(error)
    } else {
      setUsuarios(data || [])
    }
    setCarregando(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.nome || !formData.email) return toast.error('Preenche nome e email')

    setCarregando(true)
    const payload = {
      nome: formData.nome,
      email: formData.email,
      role: formData.role,
      ativo: formData.ativo
    }

    let res
    if (editingId) {
      res = await supabase.from('usuarios').update(payload).eq('id', editingId)
    } else {
      // Verifica se email já existe antes de inserir
      const { data: existing } = await supabase.from('usuarios').select('id').eq('email', formData.email).single()
      if (existing) {
        toast.error('Email já registado!')
        setCarregando(false)
        return
      }
      res = await supabase.from('usuarios').insert([payload])
    }

    if (res.error) {
      toast.error('Erro: ' + res.error.message)
    } else {
      toast.success(editingId ? 'Utilizador atualizado!' : 'Utilizador criado!')
      resetForm()
      carregarUsuarios()
    }
    setCarregando(false)
  }

  const resetForm = () => {
    setFormData({ nome: '', email: '', role: 'educador', ativo: true })
    setEditingId(null)
    setShowForm(false)
  }

  const startEdit = (u) => {
    setFormData({ nome: u.nome, email: u.email, role: u.role, ativo: u.ativo })
    setEditingId(u.id)
    setShowForm(true)
  }

  const toggleAtivo = async (id, currentStatus) => {
    setCarregando(true)
    const { error } = await supabase.from('usuarios').update({ ativo: !currentStatus }).eq('id', id)
    if (error) toast.error('Erro ao atualizar estado')
    else carregarUsuarios()
    setCarregando(false)
  }

  const removerUsuario = async (id) => {
    if (!confirm('Remover este utilizador?')) return
    setCarregando(true)
    const { error } = await supabase.from('usuarios').delete().eq('id', id)
    if (error) toast.error('Erro ao remover')
    else { toast.success('Utilizador removido'); carregarUsuarios() }
    setCarregando(false)
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 'bold', margin: 0, color: '#e2e8f0' }}>Gestão de Utilizadores</h2>
          <p style={{ fontSize: 14, color: '#94a3b8', margin: '4px 0 0' }}>Controlo de acessos ao sistema</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(!showForm) }} style={{ padding: '10px 18px', background: showForm ? '#64748b' : '#6366f1', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}>
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
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0', fontSize: 14 }}>
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
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" onClick={resetForm} style={{ padding: '10px 20px', background: '#334155', color: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancelar</button>
              <button type="submit" disabled={carregando} style={{ padding: '10px 20px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}>{carregando ? 'A guardar...' : (editingId ? 'Guardar Alterações' : 'Criar Utilizador')}</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155', overflow: 'hidden' }}>
        {carregando && <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8' }}>A carregar utilizadores...</div>}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#0f172a' }}>
            <tr>
              <th style={{ padding: 14, textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8' }}>Nome</th>
              <th style={{ padding: 14, textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8' }}>Email</th>
              <th style={{ padding: 14, textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8' }}>Função</th>
              <th style={{ padding: 14, textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8' }}>Estado</th>
              <th style={{ padding: 14, textAlign: 'right', borderBottom: '1px solid #334155', color: '#94a3b8' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {!carregando && usuarios.length === 0 && <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>Nenhum utilizador encontrado.</td></tr>}
            {!carregando && usuarios.map((u) => (
              <tr key={u.id} style={{ borderTop: '1px solid #334155' }}>
                <td style={{ padding: 14, color: '#e2e8f0', fontWeight: 500 }}>{u.nome}</td>
                <td style={{ padding: 14, color: '#94a3b8' }}>{u.email}</td>
                <td style={{ padding: 14 }}>
                  <span style={{ padding: '4px 10px', background: u.role === 'admin' ? '#f59e0b20' : '#6366f120', color: u.role === 'admin' ? '#f59e0b' : '#6366f1', borderRadius: 4, fontSize: 12 }}>
                    {u.role === 'admin' ? 'Administrador' : 'Educador'}
                  </span>
                </td>
                <td style={{ padding: 14 }}>
                  <button onClick={() => toggleAtivo(u.id, u.ativo)} style={{ padding: '4px 12px', background: u.ativo ? '#10b98120' : '#ef444420', color: u.ativo ? '#10b981' : '#ef4444', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                    {u.ativo ? 'Ativo' : 'Inativo'}
                  </button>
                </td>
                <td style={{ padding: 14, textAlign: 'right' }}>
                  <button onClick={() => startEdit(u)} style={{ padding: '6px 12px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, marginRight: 6 }}>Editar</button>
                  <button onClick={() => removerUsuario(u.id)} style={{ padding: '6px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Remover</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
