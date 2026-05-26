import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

interface Crianca {
  id: string
  nome: string
  data_nascimento: string | null
  genero: string | null
  data_entrada: string | null
  data_saida: string | null
  observacoes: string | null
}

export default function Criancas() {
  const [criancas, setCriancas] = useState<Crianca[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [formData, setFormData] = useState({
    nome: '', data_nascimento: '', genero: 'M', data_entrada: new Date().toISOString().split('T')[0], data_saida: '', observacoes: ''
  })

  useEffect(() => { carregarCriancas() }, [])

  const carregarCriancas = async () => {
    setCarregando(true)
    const { data, error } = await supabase.from('criancas').select('*').order('created_at', { ascending: false })
    if (error) {
      toast.error('Erro ao carregar: ' + error.message)
      console.error(error)
    } else {
      setCriancas(data || [])
    }
    setCarregando(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCarregando(true)

    const payload = {
      nome: formData.nome,
      data_nascimento: formData.data_nascimento || null,
      genero: formData.genero,
      data_entrada: formData.data_entrada || null,
      data_saida: formData.data_saida || null,
      observacoes: formData.observacoes || null
    }

    let error
    if (editingId) {
      const res = await supabase.from('criancas').update(payload).eq('id', editingId)
      error = res.error
    } else {
      const res = await supabase.from('criancas').insert([payload])
      error = res.error
    }

    if (error) {
      toast.error('Erro ao guardar: ' + error.message)
    } else {
      toast.success(editingId ? 'Atualizado!' : 'Registado!')
      resetForm()
      carregarCriancas()
    }
    setCarregando(false)
  }

  const resetForm = () => {
    setFormData({ nome: '', data_nascimento: '', genero: 'M', data_entrada: new Date().toISOString().split('T')[0], data_saida: '', observacoes: '' })
    setEditingId(null)
    setShowForm(false)
  }

  const startEdit = (c: Crianca) => {
    setFormData({
      nome: c.nome || '',
      data_nascimento: c.data_nascimento || '',
      genero: c.genero || 'M',
      data_entrada: c.data_entrada || '',
      data_saida: c.data_saida || '',
      observacoes: c.observacoes || ''
    })
    setEditingId(c.id)
    setShowForm(true)
  }

  const remover = async (id: string) => {
    if (!confirm('Remover esta criança?')) return
    setCarregando(true)
    const { error } = await supabase.from('criancas').delete().eq('id', id)
    if (error) toast.error('Erro ao remover')
    else { toast.success('Removido'); carregarCriancas() }
    setCarregando(false)
  }

  const calcularIdade = (d: string | null) => {
    if (!d) return '-'
    const hoje = new Date(), nasc = new Date(d)
    let idade = hoje.getFullYear() - nasc.getFullYear()
    if (hoje.getMonth() < nasc.getMonth() || (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate())) idade--
    return idade
  }

  const isAtiva = (c: Crianca) => !c.data_saida

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <h2 style={{fontSize:26,fontWeight:'bold',margin:0}}>Crianças (Supabase)</h2>
        <button onClick={()=>setShowForm(!showForm)} disabled={carregando} style={{padding:'10px 18px',background:showForm?'#64748b':'#6366f1',color:'#fff',border:'none',borderRadius:8,cursor:'pointer'}}>{showForm?'Cancelar':'+ Nova'}</button>
      </div>

      {showForm && (
        <div style={{background:'#1e293b',padding:20,borderRadius:12,border:'1px solid #334155',marginBottom:24}}>
          <h3 style={{marginTop:0,marginBottom:16,fontSize:18}}>{editingId?'Editar':'Nova'} Criança</h3>
          <form onSubmit={handleSubmit}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
              <div><label style={{display:'block',marginBottom:6,color:'#94a3b8',fontSize:13}}>Nome *</label><input type="text" required value={formData.nome} onChange={e=>setFormData({...formData,nome:e.target.value})} style={{width:'100%',padding:'8px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0'}}/></div>
              <div><label style={{display:'block',marginBottom:6,color:'#94a3b8',fontSize:13}}>Nascimento *</label><input type="date" required value={formData.data_nascimento} onChange={e=>setFormData({...formData,data_nascimento:e.target.value})} style={{width:'100%',padding:'8px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0'}}/></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
              <div><label style={{display:'block',marginBottom:6,color:'#94a3b8',fontSize:13}}>Género</label><select value={formData.genero} onChange={e=>setFormData({...formData,genero:e.target.value})} style={{width:'100%',padding:'8px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0'}}><option value="M">Masculino</option><option value="F">Feminino</option></select></div>
              <div><label style={{display:'block',marginBottom:6,color:'#94a3b8',fontSize:13}}>Entrada</label><input type="date" value={formData.data_entrada} onChange={e=>setFormData({...formData,data_entrada:e.target.value})} style={{width:'100%',padding:'8px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0'}}/></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
              <div><label style={{display:'block',marginBottom:6,color:'#94a3b8',fontSize:13}}>Saída</label><input type="date" value={formData.data_saida} onChange={e=>setFormData({...formData,data_saida:e.target.value})} style={{width:'100%',padding:'8px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0'}}/></div>
              <div><label style={{display:'block',marginBottom:6,color:'#94a3b8',fontSize:13}}>Estado</label><div style={{padding:'8px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:isAtiva({...formData,id:''})?'#10b981':'#ef4444',fontSize:13}}>{isAtiva({...formData,id:''})?'✅ Ativa':' Saída'}</div></div>
            </div>
            <div style={{marginBottom:16}}><label style={{display:'block',marginBottom:6,color:'#94a3b8',fontSize:13}}>Observações</label><textarea rows={2} value={formData.observacoes} onChange={e=>setFormData({...formData,observacoes:e.target.value})} style={{width:'100%',padding:'8px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0'}}/></div>
            <div style={{display:'flex',gap:12,justifyContent:'flex-end'}}>
              <button type="button" onClick={resetForm} disabled={carregando} style={{padding:'8px 14px',background:'#334155',color:'#e2e8f0',border:'none',borderRadius:6,cursor:'pointer'}}>Cancelar</button>
              <button type="submit" disabled={carregando} style={{padding:'8px 14px',background:'#10b981',color:'#fff',border:'none',borderRadius:6,cursor:'pointer',fontWeight:500}}>{carregando?'A guardar...':(editingId?'Guardar':'Registar')}</button>
            </div>
          </form>
        </div>
      )}

      <div style={{background:'#1e293b',borderRadius:12,border:'1px solid #334155',overflow:'hidden'}}>
        {carregando && <div style={{padding:20,textAlign:'center',color:'#94a3b8'}}>A carregar do Supabase...</div>}
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead style={{background:'#0f172a'}}><tr><th style={{padding:12,textAlign:'left',borderBottom:'1px solid #334155',color:'#94a3b8'}}>Nome</th><th style={{padding:12,textAlign:'left',borderBottom:'1px solid #334155',color:'#94a3b8'}}>Idade</th><th style={{padding:12,textAlign:'left',borderBottom:'1px solid #334155',color:'#94a3b8'}}>Entrada</th><th style={{padding:12,textAlign:'left',borderBottom:'1px solid #334155',color:'#94a3b8'}}>Saída</th><th style={{padding:12,textAlign:'left',borderBottom:'1px solid #334155',color:'#94a3b8'}}>Estado</th><th style={{padding:12,textAlign:'left',borderBottom:'1px solid #334155',color:'#94a3b8'}}>Ações</th></tr></thead>
          <tbody>
            {!carregando && criancas.length===0 && <tr><td colSpan={6} style={{padding:32,textAlign:'center',color:'#64748b'}}>Sem registos na base de dados.</td></tr>}
            {!carregando && criancas.map(c=>(<tr key={c.id} style={{borderTop:'1px solid #334155'}}>
              <td style={{padding:12,color:'#e2e8f0'}}>{c.nome}</td>
              <td style={{padding:12,color:'#e2e8f0'}}>{calcularIdade(c.data_nascimento)} anos</td>
              <td style={{padding:12,color:'#94a3b8'}}>{c.data_entrada?new Date(c.data_entrada).toLocaleDateString('pt-PT'):'-'}</td>
              <td style={{padding:12,color:c.data_saida?'#ef4444':'#64748b'}}>{c.data_saida?new Date(c.data_saida).toLocaleDateString('pt-PT'):'-'}</td>
              <td style={{padding:12}}><span style={{padding:'3px 8px',borderRadius:4,fontSize:12,background:isAtiva(c)?'#dcfce7':'#fee2e2',color:isAtiva(c)?'#166534':'#991b1b'}}>{isAtiva(c)?'Ativa':'Saída'}</span></td>
              <td style={{padding:12}}>
                <button onClick={()=>startEdit(c)} style={{padding:'4px 10px',background:'#6366f1',color:'#fff',border:'none',borderRadius:4,cursor:'pointer',marginRight:6,fontSize:12}}>Editar</button>
                <button onClick={()=>remover(c.id)} style={{padding:'4px 10px',background:'#ef4444',color:'#fff',border:'none',borderRadius:4,cursor:'pointer',fontSize:12}}>Remover</button>
              </td>
            </tr>))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
