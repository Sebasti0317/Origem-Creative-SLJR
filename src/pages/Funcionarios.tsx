import React, { useState } from 'react'
import toast from 'react-hot-toast'

interface Funcionario {
  id: string
  nome: string
  cargo: string
  email: string
  telefone: string
  dataAdmissao: string
}

export default function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    cargo: 'Educador',
    email: '',
    telefone: '',
    dataAdmissao: new Date().toISOString().split('T')[0]
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const novoFuncionario: Funcionario = {
      id: Date.now().toString(),
      ...formData
    }
    
    setFuncionarios([...funcionarios, novoFuncionario])
    setFormData({
      nome: '',
      cargo: 'Educador',
      email: '',
      telefone: '',
      dataAdmissao: new Date().toISOString().split('T')[0]
    })
    setShowForm(false)
    toast.success('Funcionário registado com sucesso!')
  }

  const cargos = ['Diretor(a)', 'Educador(a)', 'Auxiliar', 'Cozinheiro(a)', 'Motorista', 'Técnico(a)']

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px'}}>
        <h2 style={{fontSize: '28px', fontWeight: 'bold', margin: 0}}>Gestão de Funcionários</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '12px 24px',
            background: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: '500'
          }}
        >
          {showForm ? 'Cancelar' : '+ Novo Funcionário'}
        </button>
      </div>

      {showForm && (
        <div style={{
          background: '#1e293b',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #334155',
          marginBottom: '32px'
        }}>
          <h3 style={{marginTop: 0, marginBottom: '24px', fontSize: '20px'}}>Registar Novo Funcionário</h3>
          <form onSubmit={handleSubmit}>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px'}}>
              <div>
                <label style={{display: 'block', marginBottom: '8px', color: '#94a3b8'}}>Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#e2e8f0',
                    fontSize: '15px'
                  }}
                />
              </div>
              <div>
                <label style={{display: 'block', marginBottom: '8px', color: '#94a3b8'}}>Cargo / Função *</label>
                <select
                  value={formData.cargo}
                  onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#e2e8f0',
                    fontSize: '15px'
                  }}
                >
                  {cargos.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px'}}>
              <div>
                <label style={{display: 'block', marginBottom: '8px', color: '#94a3b8'}}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#e2e8f0',
                    fontSize: '15px'
                  }}
                />
              </div>
              <div>
                <label style={{display: 'block', marginBottom: '8px', color: '#94a3b8'}}>Telefone</label>
                <input
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#e2e8f0',
                    fontSize: '15px'
                  }}
                />
              </div>
            </div>

            <div style={{marginBottom: '24px'}}>
              <label style={{display: 'block', marginBottom: '8px', color: '#94a3b8'}}>Data de Admissão</label>
              <input
                type="date"
                value={formData.dataAdmissao}
                onChange={(e) => setFormData({...formData, dataAdmissao: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                  fontSize: '15px'
                }}
              />
            </div>

            <div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  padding: '10px 20px',
                  background: '#334155',
                  color: '#e2e8f0',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '15px'
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '500'
                }}
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{
        background: '#1e293b',
        borderRadius: '12px',
        border: '1px solid #334155',
        overflow: 'hidden'
      }}>
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead style={{background: '#0f172a'}}>
            <tr>
              <th style={{padding: '16px', textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8'}}>Nome</th>
              <th style={{padding: '16px', textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8'}}>Cargo</th>
              <th style={{padding: '16px', textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8'}}>Contacto</th>
              <th style={{padding: '16px', textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8'}}>Admissão</th>
              <th style={{padding: '16px', textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8'}}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {funcionarios.length === 0 ? (
              <tr>
                <td colSpan={5} style={{padding: '48px', textAlign: 'center', color: '#64748b'}}>
                  Nenhum funcionário registado. Clica em "+ Novo Funcionário" para começar.
                </td>
              </tr>
            ) : (
              funcionarios.map((func) => (
                <tr key={func.id} style={{borderTop: '1px solid #334155'}}>
                  <td style={{padding: '16px', color: '#e2e8f0'}}>
                    <div style={{fontWeight: '500'}}>{func.nome}</div>
                    {func.email && <div style={{fontSize: '12px', color: '#94a3b8'}}>{func.email}</div>}
                  </td>
                  <td style={{padding: '16px', color: '#e2e8f0'}}>
                    <span style={{
                      padding: '4px 8px',
                      background: func.cargo === 'Diretor(a)' ? '#f59e0b20' : '#6366f120',
                      color: func.cargo === 'Diretor(a)' ? '#f59e0b' : '#6366f1',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {func.cargo}
                    </span>
                  </td>
                  <td style={{padding: '16px', color: '#e2e8f0'}}>{func.telefone || '-'}</td>
                  <td style={{padding: '16px', color: '#e2e8f0'}}>{new Date(func.dataAdmissao).toLocaleDateString('pt-PT')}</td>
                  <td style={{padding: '16px'}}>
                    <button
                      onClick={() => {
                        setFuncionarios(funcionarios.filter(f => f.id !== func.id))
                        toast.success('Funcionário removido')
                      }}
                      style={{
                        padding: '6px 12px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{marginTop: '24px', padding: '16px', background: '#0f172a', borderRadius: '8px', border: '1px solid #334155'}}>
        <p style={{margin: 0, color: '#94a3b8'}}>
          Total: <strong style={{color: '#6366f1'}}>{funcionarios.length}</strong> funcionário(s) ativo(s)
        </p>
      </div>
    </div>
  )
}
