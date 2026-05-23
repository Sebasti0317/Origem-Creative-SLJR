import React, { useState } from 'react'
import toast from 'react-hot-toast'

interface Crianca {
  id: string
  nome: string
  dataNascimento: string
  genero: string
  dataEntrada: string
  observacoes: string
}

export default function Criancas() {
  const [criancas, setCriancas] = useState<Crianca[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    dataNascimento: '',
    genero: 'M',
    dataEntrada: new Date().toISOString().split('T')[0],
    observacoes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const novaCrianca: Crianca = {
      id: Date.now().toString(),
      ...formData
    }
    
    setCriancas([...criancas, novaCrianca])
    setFormData({
      nome: '',
      dataNascimento: '',
      genero: 'M',
      dataEntrada: new Date().toISOString().split('T')[0],
      observacoes: ''
    })
    setShowForm(false)
    toast.success('Criança registada com sucesso!')
  }

  const calcularIdade = (dataNasc: string) => {
    const hoje = new Date()
    const nasc = new Date(dataNasc)
    let idade = hoje.getFullYear() - nasc.getFullYear()
    const mes = hoje.getMonth() - nasc.getMonth()
    if (mes < 0 || (mes === 0 && hoje.getDate() < nasc.getDate())) {
      idade--
    }
    return idade
  }

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px'}}>
        <h2 style={{fontSize: '28px', fontWeight: 'bold', margin: 0}}>Gestão de Crianças</h2>
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
          {showForm ? 'Cancelar' : '+ Nova Criança'}
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
          <h3 style={{marginTop: 0, marginBottom: '24px', fontSize: '20px'}}>Registar Nova Criança</h3>
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
                <label style={{display: 'block', marginBottom: '8px', color: '#94a3b8'}}>Data de Nascimento *</label>
                <input
                  type="date"
                  required
                  value={formData.dataNascimento}
                  onChange={(e) => setFormData({...formData, dataNascimento: e.target.value})}
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

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px'}}>
              <div>
                <label style={{display: 'block', marginBottom: '8px', color: '#94a3b8'}}>Género</label>
                <select
                  value={formData.genero}
                  onChange={(e) => setFormData({...formData, genero: e.target.value})}
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
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
              </div>
              <div>
                <label style={{display: 'block', marginBottom: '8px', color: '#94a3b8'}}>Data de Entrada</label>
                <input
                  type="date"
                  value={formData.dataEntrada}
                  onChange={(e) => setFormData({...formData, dataEntrada: e.target.value})}
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
              <label style={{display: 'block', marginBottom: '8px', color: '#94a3b8'}}>Observações</label>
              <textarea
                rows={3}
                value={formData.observacoes}
                onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                  fontSize: '15px',
                  resize: 'vertical'
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
              <th style={{padding: '16px', textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8'}}>Idade</th>
              <th style={{padding: '16px', textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8'}}>Género</th>
              <th style={{padding: '16px', textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8'}}>Data Entrada</th>
              <th style={{padding: '16px', textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8'}}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {criancas.length === 0 ? (
              <tr>
                <td colSpan={5} style={{padding: '48px', textAlign: 'center', color: '#64748b'}}>
                  Nenhuma criança registada. Clica em "+ Nova Criança" para começar.
                </td>
              </tr>
            ) : (
              criancas.map((crianca) => (
                <tr key={crianca.id} style={{borderTop: '1px solid #334155'}}>
                  <td style={{padding: '16px', color: '#e2e8f0'}}>{crianca.nome}</td>
                  <td style={{padding: '16px', color: '#e2e8f0'}}>{calcularIdade(crianca.dataNascimento)} anos</td>
                  <td style={{padding: '16px', color: '#e2e8f0'}}>{crianca.genero === 'M' ? 'Masculino' : 'Feminino'}</td>
                  <td style={{padding: '16px', color: '#e2e8f0'}}>{new Date(crianca.dataEntrada).toLocaleDateString('pt-PT')}</td>
                  <td style={{padding: '16px'}}>
                    <button
                      onClick={() => {
                        setCriancas(criancas.filter(c => c.id !== crianca.id))
                        toast.success('Criança removida')
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
          Total: <strong style={{color: '#6366f1'}}>{criancas.length}</strong> criança(s) registada(s)
        </p>
      </div>
    </div>
  )
}
