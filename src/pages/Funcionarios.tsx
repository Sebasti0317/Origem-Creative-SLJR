import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

export default function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [formData, setFormData] = useState({
    nome: '', cargo: 'Educador', email: '', telefone: '', data_admissao: new Date().toISOString().split('T')[0], data_nascimento: '', numero_documento: '', morada: ''
  })

  useEffect(() => { carregarFuncionarios() }, [])

  const carregarFuncionarios = async () => {
    setCarregando(true)
    const { data, error } = await supabase.from('funcionarios').select('*').order('id', { ascending: false })
    if (error) {
      console.error('❌ ERRO AO CARREGAR:', error)
      toast.error('Erro: ' + error.message)
    } else {
      setFuncionarios(data || [])
    }
    setCarregando(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCarregando(true)

    // Payload base (ajustaremos conforme a tua tabela)
    const payload = {
      nome: formData.nome,
      cargo: formData.cargo,
      email: formData.email || null,
      telefone: formData.telefone || null,
      data_admissao: formData.data_admissao || null,
      data_nascimento: formData.data_nascimento || null,
      numero_documento: formData.numero_documento || null,
      morada: formData.morada || null
    }

    console.log('📤 Payload enviado:', payload)

    let res
    if (editingId) {
      res = await supabase.from('funcionarios').update(payload).eq('id', editingId)
    } else {
      res = await supabase.from('funcionarios').insert([payload])
    }

    if (res.error) {
      console.error('❌ ERRO SUPABASE 400:', res.error)
      console.error(' Detalhes:', JSON.stringify(res.error, null, 2))
      toast.error('Erro 400: ' + res.error.message)
    } else {
      toast.success(editingId ? 'Atualizado!' : 'Registado!')
      resetForm()
      carregarFuncionarios()
    }
    setCarregando(false)
  }

  const resetForm = () => {
    setFormData({ nome: '', cargo: 'Educador', email: '', telefone: '', data_admissao: new Date().toISOString().split('T')[0], data_nascimento: '', numero_documento: '', morada: '' })
    setEditingId(null)
    setShowForm(false)
  }

  const startEdit = (f) => {
    setFormData({
      nome: f.nome || '', cargo: f.cargo || 'Educador', email: f.email || '', telefone: f.telefone || '',
      data_admissao: f.data_admissao || '', data_nascimento: f.data_nascimento || '',
      numero_documento: f.numero_documento || '', morada: f.morada || ''
    })
    setEditingId(f.id)
    setShowForm(true)
  }

  const remover = async (id) => {
    if (!confirm('Remover?')) return
    setCarregando(true)
    const { error } = await supabase.from('funcionarios').delete().eq('id', id)
    if (error) { toast.error('Erro: ' + error.message); console.error(error) }
    else { toast.success('Removido'); carregarFuncionarios() }
    setCarregando(false)
  }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <h2 style={{fontSize:26,fontWeight:'bold',margin:0}}>Funcionários</h2>
        <button onClick={()=>setShowForm(!showForm)} disabled={carregando} style={{padding:'10px 18px',background:showForm?'#64748b':'#6366f1',color:'#fff',border:'none',borderRadius:8,cursor:'pointer'}}>{showForm?'Cancelar':'+ Novo'}</button>
      </div>

      {showForm && (
        <div style={{background:'#1e293b',padding:20,borderRadius:12,border:'1px solid #334155',marginBottom:24}}>
          <h3 style={{marginTop:0,marginBottom:16,fontSize:18}}>{editingId?'Editar':'Novo'} Funcionário</h3>
          <form onSubmit={handleSubmit}>
            <div style={{marginBottom:16}}>
              <label style={{display:'block',marginBottom:6,color:'#94a3b8',fontSize:13}}>Nome Completo *</label>
              <input type="text" required value={formData.nome} onChange={e=>setFormData({...formData,nome:e.target.value})} style={{width:'100%',padding:'8px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0'}}/>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
              <div>
                <label style={{display:'block',marginBottom:6,color:'#94a3b8',fontSize:13}}>Cargo</label>
                <select value={formData.cargo} onChange={e=>setFormData({...formData,cargo:e.target.value})} style={{width:'100%',padding:'8px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0'}}>
                  <option>Educador</option><option>Coordenador</option><option>Diretor</option><option>Auxiliar</option><option>Cozinheiro</option><option>Motorista</option><option>Segurança</option>
                </select>
              </div>
              <div>
                <label style={{display:'block',marginBottom:6,color:'#94a3b8',fontSize:13}}>Data Admissão</label>
                <input type="date" value={formData.data_admissao} onChange={e=>setFormData({...formData,data_admissao:e.target.value})} style={{width:'100%',padding:'8px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0'}}/>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
              <div><label style={{display:'block',marginBottom:6,color:'#94a3b8',fontSize:13}}>Email</label><input type="email" value={formData.email} onChange={e=>setFormData({...formData,email:e.target.value})} style={{width:'100%',padding:'8px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0'}}/></div>
              <div><label style={{display:'block',marginBottom:6,color:'#94a3b8',fontSize:13}}>Telefone</label><input type="tel" value={formData.telefone} onChange={e=>setFormData({...formData,telefone:e.target.value})} style={{width:'100%',padding:'8px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0'}}/></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
              <div><label style={{display:'block',marginBottom:6,color:'#94a3b8',fontSize:13}}>Data Nascimento</label><input type="date" value={formData.data_nascimento} onChange={e=>setFormData({...formData,data_nascimento:e.target.value})} style={{width:'100%',padding:'8px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0'}}/></div>
              <div><label style={{display:'block',marginBottom:6,color:'#94a3b8',fontSize:13}}>Nº Documento</label><input type="text" value={formData.numero_documento} onChange={e=>setFormData({...formData,numero_documento:e.target.value})} style={{width:'100%',padding:'8px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0'}}/></div>
            </div>
            <div style={{marginBottom:16}}><label style={{display:'block',marginBottom:6,color:'#94a3b8',fontSize:13}}>Morada</label><textarea rows={2} value={formData.morada} onChange={e=>setFormData({...formData,morada:e.target.value})} style={{width:'100%',padding:'8px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0'}}/></div>
            <div style={{display:'flex',gap:12,justifyContent:'flex-end'}}>
              <button type="button" onClick={resetForm} disabled={carregando} style={{padding:'8px 14px',background:'#334155',color:'#e2e8f0',border:'none',borderRadius:6,cursor:'pointer'}}>Cancelar</button>
              <button type="submit" disabled={carregando} style={{padding:'8px 14px',background:'#10b981',color:'#fff',border:'none',borderRadius:6,cursor:'pointer',fontWeight:500}}>{carregando?'A guardar...':(editingId?'Guardar':'Registar')}</button>
            </div>
          </form>
        </div>
      )}

      <div style={{background:'#1e293b',borderRadius:12,border:'1px solid #334155',overflow:'hidden'}}>
        {carregando && <div style={{padding:20,textAlign:'center',color:'#94a3b8'}}>A carregar...</div>}
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead style={{background:'#0f172a'}}><tr><th style={{padding:12,textAlign:'left',borderBottom:'1px solid #334155',color:'#94a3b8'}}>Nome</th><th style={{padding:12,textAlign:'left',borderBottom:'1px solid #334155',color:'#94a3b8'}}>Cargo</th><th style={{padding:12,textAlign:'left',borderBottom:'1px solid #334155',color:'#94a3b8'}}>Contacto</th><th style={{padding:12,textAlign:'left',borderBottom:'1px solid #334155',color:'#94a3b8'}}>Ações</th></tr></thead>
          <tbody>
            {!carregando && funcionarios.length===0 && <tr><td colSpan={4} style={{padding:32,textAlign:'center',color:'#64748b'}}>Sem registos.</td></tr>}
            {!carregando && funcionarios.map(f=>(<tr key={f.id} style={{borderTop:'1px solid #334155'}}>
              <td style={{padding:12,color:'#e2e8f0'}}>{f.nome}</td>
              <td style={{padding:12,color:'#94a3b8'}}>{f.cargo||'-'}</td>
              <td style={{padding:12,color:'#94a3b8',fontSize:13}}>{f.telefone||'-'} {f.email&&<div>{f.email}</div>}</td>
              <td style={{padding:12}}>
                <button onClick={()=>startEdit(f)} style={{padding:'4px 10px',background:'#6366f1',color:'#fff',border:'none',borderRadius:4,cursor:'pointer',marginRight:6,fontSize:12}}>Editar</button>
                <button onClick={()=>remover(f.id)} style={{padding:'4px 10px',background:'#ef4444',color:'#fff',border:'none',borderRadius:4,cursor:'pointer',fontSize:12}}>Remover</button>
              </td>
            </tr>))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
