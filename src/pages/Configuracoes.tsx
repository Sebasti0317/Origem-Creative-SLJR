import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

export default function Configuracoes() {
  const [config, setConfig] = useState({
    nomeInstituicao: 'Centro de Acolhimento',
    endereco: '', telefone: '', email: '', nif: '',
    moedaPrincipal: 'AOA', inssPercentagem: '3', simboloMoeda: 'Kz'
  })
  const [saved, setSaved] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [configId, setConfigId] = useState(null)

  useEffect(() => { carregarConfig() }, [])

  const carregarConfig = async () => {
    setCarregando(true)
    // ✅ MUDANÇA CRÍTICA: select('*') evita o erro 406 (columns=...)
    const { data, error } = await supabase.from('configuracoes_sistema').select('*').limit(1).single()
    if (error && error.code !== 'PGRST116') console.error(error)
    else if (data) {
      setConfig({
        nomeInstituicao: data.nome_instituicao || 'Centro de Acolhimento',
        endereco: data.endereco || '',
        telefone: data.telefone || '',
        email: data.email || '',
        nif: data.nif || '',
        moedaPrincipal: data.moeda_principal || 'AOA',
        inssPercentagem: String(data.inss_percentagem || '3'),
        simboloMoeda: data.simbolo_moeda || 'Kz'
      })
      setConfigId(data.id)
    }
    setCarregando(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setCarregando(true)

    const payload = {
      nome_instituicao: config.nomeInstituicao,
      endereco: config.endereco,
      telefone: config.telefone,
      email: config.email,
      nif: config.nif,
      moeda_principal: config.moedaPrincipal,
      inss_percentagem: parseFloat(config.inssPercentagem),
      simbolo_moeda: config.simboloMoeda
    }

    let res
    if (configId) {
      res = await supabase.from('configuracoes_sistema').update(payload).eq('id', configId)
    } else {
      res = await supabase.from('configuracoes_sistema').insert([payload])
      if (!res.error && res.data) setConfigId(res.data[0].id)
    }

    if (res.error) toast.error('Erro: ' + res.error.message)
    else { toast.success('Guardado na nuvem!'); setSaved(true); setTimeout(() => setSaved(false), 3000) }
    setCarregando(false)
  }

  if (carregando && !saved) return <div style={{padding:40,textAlign:'center',color:'#94a3b8'}}>A carregar...</div>

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 26, fontWeight: 'bold', margin: 0 }}>⚙️ Configurações</h2>
        {saved && <span style={{ color: '#10b981', fontSize: 14, fontWeight: 500 }}>✓ Guardado!</span>}
      </div>
      <form onSubmit={handleSave}>
        <div style={{ background: '#1e293b', padding: 20, borderRadius: 12, border: '1px solid #334155', marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 18, color: '#e2e8f0', borderBottom: '1px solid #334155', paddingBottom: 10 }}>🏢 Dados da Instituição</h3>
          <div style={{ marginBottom: 16 }}><label style={{ display: 'block', marginBottom: 6, color: '#94a3b8', fontSize: 13 }}>Nome *</label><input type="text" required value={config.nomeInstituicao} onChange={(e) => setConfig({ ...config, nomeInstituicao: e.target.value })} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0' }} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ marginBottom: 16 }}><label style={{ display: 'block', marginBottom: 6, color: '#94a3b8', fontSize: 13 }}>Endereço</label><input type="text" value={config.endereco} onChange={(e) => setConfig({ ...config, endereco: e.target.value })} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0' }} /></div>
            <div style={{ marginBottom: 16 }}><label style={{ display: 'block', marginBottom: 6, color: '#94a3b8', fontSize: 13 }}>Telefone</label><input type="text" value={config.telefone} onChange={(e) => setConfig({ ...config, telefone: e.target.value })} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0' }} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ marginBottom: 16 }}><label style={{ display: 'block', marginBottom: 6, color: '#94a3b8', fontSize: 13 }}>Email</label><input type="email" value={config.email} onChange={(e) => setConfig({ ...config, email: e.target.value })} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0' }} /></div>
            <div style={{ marginBottom: 16 }}><label style={{ display: 'block', marginBottom: 6, color: '#94a3b8', fontSize: 13 }}>NIF</label><input type="text" value={config.nif} onChange={(e) => setConfig({ ...config, nif: e.target.value })} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0' }} /></div>
          </div>
        </div>
        <div style={{ background: '#1e293b', padding: 20, borderRadius: 12, border: '1px solid #334155', marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 18, color: '#e2e8f0', borderBottom: '1px solid #334155', paddingBottom: 10 }}>💰 Configurações Fiscais</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ marginBottom: 16 }}><label style={{ display: 'block', marginBottom: 6, color: '#94a3b8', fontSize: 13 }}>Percentagem INSS (%)</label><input type="number" value={config.inssPercentagem} onChange={(e) => setConfig({ ...config, inssPercentagem: e.target.value })} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0' }} /></div>
            <div style={{ marginBottom: 16 }}><label style={{ display: 'block', marginBottom: 6, color: '#94a3b8', fontSize: 13 }}>Símbolo da Moeda</label><input type="text" value={config.simboloMoeda} onChange={(e) => setConfig({ ...config, simboloMoeda: e.target.value })} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0' }} /></div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="submit" disabled={carregando} style={{ padding: '10px 20px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>{carregando ? 'A guardar...' : '💾 Guardar'}</button>
        </div>
      </form>
    </div>
  )
}
