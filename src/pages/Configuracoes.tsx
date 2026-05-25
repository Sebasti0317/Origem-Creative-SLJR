import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export default function Configuracoes() {
  const [config, setConfig] = useState({
    nomeInstituicao: 'Centro de Acolhimento',
    endereco: '',
    telefone: '',
    email: '',
    nif: '',
    moedaPrincipal: 'AOA',
    inssPercentagem: '3',
    simboloMoeda: 'Kz',
    idioma: 'pt-PT'
  })

  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const savedConfig = localStorage.getItem('configuracoes_db')
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig))
    }
  }, [])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem('configuracoes_db', JSON.stringify(config))
    localStorage.setItem('instituicao_nome', config.nomeInstituicao)
    toast.success('Configurações guardadas com sucesso!')
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleReset = () => {
    if (confirm('Desejas restaurar as configurações padrão?')) {
      const defaultConfig = {
        nomeInstituicao: 'Centro de Acolhimento',
        endereco: '',
        telefone: '',
        email: '',
        nif: '',
        moedaPrincipal: 'AOA',
        inssPercentagem: '3',
        simboloMoeda: 'Kz',
        idioma: 'pt-PT'
      }
      setConfig(defaultConfig)
      localStorage.setItem('configuracoes_db', JSON.stringify(defaultConfig))
      toast.success('Configurações restauradas!')
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: 6,
    color: '#e2e8f0',
    fontSize: 14,
    boxSizing: 'border-box' as const
  }

  const labelStyle = {
    display: 'block',
    marginBottom: 6,
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: 500
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 26, fontWeight: 'bold', margin: 0 }}>⚙️ Configurações</h2>
        {saved && <span style={{ color: '#10b981', fontSize: 14, fontWeight: 500 }}>✓ Guardado!</span>}
      </div>

      <form onSubmit={handleSave}>
        {/* Dados da Instituição */}
        <div style={{ background: '#1e293b', padding: 20, borderRadius: 12, border: '1px solid #334155', marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 18, color: '#e2e8f0', borderBottom: '1px solid #334155', paddingBottom: 10 }}>🏢 Dados da Instituição</h3>
          
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Nome da Instituição *</label>
            <input
              type="text"
              value={config.nomeInstituicao}
              onChange={(e) => setConfig({ ...config, nomeInstituicao: e.target.value })}
              placeholder="Ex: Centro de Acolhimento de Crianças"
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Endereço</label>
              <input
                type="text"
                value={config.endereco}
                onChange={(e) => setConfig({ ...config, endereco: e.target.value })}
                placeholder="Rua, Cidade, Província"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Telefone</label>
              <input
                type="text"
                value={config.telefone}
                onChange={(e) => setConfig({ ...config, telefone: e.target.value })}
                placeholder="+244 XXX XXX XXX"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={config.email}
                onChange={(e) => setConfig({ ...config, email: e.target.value })}
                placeholder="exemplo@email.com"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>NIF</label>
              <input
                type="text"
                value={config.nif}
                onChange={(e) => setConfig({ ...config, nif: e.target.value })}
                placeholder="Número de Identificação Fiscal"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Configurações Fiscais */}
        <div style={{ background: '#1e293b', padding: 20, borderRadius: 12, border: '1px solid #334155', marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 18, color: '#e2e8f0', borderBottom: '1px solid #334155', paddingBottom: 10 }}>💰 Configurações Fiscais</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Percentagem INSS (%)</label>
              <input
                type="number"
                value={config.inssPercentagem}
                onChange={(e) => setConfig({ ...config, inssPercentagem: e.target.value })}
                placeholder="3"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Moeda Principal</label>
              <select
                value={config.moedaPrincipal}
                onChange={(e) => setConfig({ ...config, moedaPrincipal: e.target.value })}
                style={inputStyle}
              >
                <option value="AOA">Kwanza (AOA)</option>
                <option value="USD">Dólar Americano (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Símbolo da Moeda</label>
            <input
              type="text"
              value={config.simboloMoeda}
              onChange={(e) => setConfig({ ...config, simboloMoeda: e.target.value })}
              placeholder="Kz"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Preferências */}
        <div style={{ background: '#1e293b', padding: 20, borderRadius: 12, border: '1px solid #334155', marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 18, color: '#e2e8f0', borderBottom: '1px solid #334155', paddingBottom: 10 }}>🌍 Preferências</h3>
          
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Idioma</label>
            <select
              value={config.idioma}
              onChange={(e) => setConfig({ ...config, idioma: e.target.value })}
              style={inputStyle}
            >
              <option value="pt-PT">Português (Portugal)</option>
              <option value="pt-AO">Português (Angola)</option>
              <option value="en-US">English</option>
            </select>
          </div>
        </div>

        {/* Botões de Ação */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={handleReset}
            style={{
              padding: '10px 20px',
              background: '#64748b',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500
            }}
          >
            🔄 Restaurar Padrão
          </button>
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              background: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500
            }}
          >
            💾 Guardar Configurações
          </button>
        </div>
      </form>

      {/* Informações Adicionais */}
      <div style={{ marginTop: 24, padding: 16, background: '#0f172a', borderRadius: 8, border: '1px solid #334155' }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#94a3b8', fontSize: 13 }}>ℹ️ Informações</h4>
        <ul style={{ margin: 0, paddingLeft: 20, color: '#64748b', fontSize: 12, lineHeight: 1.8 }}>
          <li>As configurações são guardadas localmente no teu navegador</li>
          <li>O nome da instituição aparece automaticamente nos recibos</li>
          <li>A percentagem INSS é aplicada automaticamente na folha salarial</li>
          <li>Podes alterar estas configurações a qualquer momento</li>
        </ul>
      </div>
    </div>
  )
}
