import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface Funcionario {
  id: string
  nome: string
  cargo: string
  email: string
  telefone: string
  dataAdmissao: string
  dataNascimento: string
  numeroDocumento: string
  morada: string
}

export default function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nome: '', cargo: 'Educador', email: '', telefone: '', dataAdmissao: new Date().toISOString().split('T')[0],
    dataNascimento: '', numeroDocumento: '', morada: ''
  })

  useEffect(() => {
    const saved = localStorage.getItem('funcionarios_db')
    if (saved) setFuncionarios(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('funcionarios_db', JSON.stringify(funcionarios))
  }, [funcionarios])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      setFuncionarios(funcionarios.map(f => f.id === editingId ? { ...f, ...formData } : f))
      toast.success('Funcionário atualizado!')
    } else {
      setFuncionarios([...funcionarios, { id: Date.now().toString(), ...formData }])
      toast.success('Funcionário registado!')
    }
    resetForm()
  }

  const resetForm = () => {
    setFormData({ nome: '', cargo: 'Educador', email: '', telefone: '', dataAdmissao: new Date().toISOString().split('T')[0], dataNascimento: '', numeroDocumento: '', morada: '' })
    setEditingId(null)
    setShowForm(false)
  }

  const startEdit = (f: Funcionario) => {
    setFormData(f)
    setEditingId(f.id)
    setShowForm(true)
  }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <h2 style={{fontSize:26,fontWeight:'bold',margin:0}}>Gestão de Funcionários</h2>
        <button onClick={()=>setShowForm(!showForm)} style={{padding:'10px 18px',background:showForm?'#64748b':'#6366f1',color:'#fff',border:'none',borderRadius:8,cursor:'pointer'}}>{showForm?'Cancelar':'+ Novo Funcionário'}</button>
      </div>

      {showForm && (
        <div style={{background:'#1e293b',padding:20,borderRadius:12,border:'1px solid #334155',marginBottom:24}}>
          <h3 style={{marginTop:0,marginBottom:16,fontSize:18}}>{editingId?'Editar':'Registar'} Funcionário</h3>
          <form onSubmit={handleSubmit}>
            <h4 style={{color:'#94a3b8',margin:'12px 0 8px',fontSize:14}}>Dados Pessoais</h4>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
              <div style={{gridColumn:'span 2'}}><label style={{display:'block',marginBottom:6,color:'#94a3b8',fontSize:13}}>Nome *</label><input type="text" required value={formData.nome} onChange={e=>setFormData({...formData,nome:e.target.value})} style={{width:'100%',padding:'8px 10px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0'}} /></div>
              <div><label style={{display:'block',marginBottom:6,color:'#94a3b8',fontSize:13}}>Data Nascimento</label><input type="date" value={formData.dataNascimento} onChange={e=>setFormData({...formData,dataNascimento:e.target.value})} style={{width:'100%',padding:'8px 10px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0'}} /></div>
              <div><label style={{display:'block',marginBottom:6,color:'#94a3b8',fontSize:13}}>Nº Documento</label><input type="text" value={formData.numeroDocumento} onChange={e=>setFormData({...formData,numeroDocumento:e.target.value})} style={{width:'100%',padding:'8px 10px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0'}} /></div>
              <div style={{gridColumn:'span 2'}}><label style={{display:'block',marginBottom:6,color:'#94a3b8',fontSize:13}}>Morada</label><input type="text" value={formData.morada} onChange={e=>setFormData({...formData,morada:e.target.value})} style={{width:'100%',padding:'8px 10px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0'}} /></div>
            </div>
            <h4 style={{color:'#94a3b8',margin:'12px 0 8px',fontSize:14,borderTop:'1px solid #334155',paddingTop:12}}>Dados Profissionais</h4>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
              <div><label style={{display:'block',marginBottom:6,color:'#94a3b8',fontSize:13}}>Cargo</label><select value={formData.cargo} onChange={e=>setFormData({...formData,cargo:e.target.value})} style={{width:'100%',padding:'8px 10px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0'}}><option>Educador</option><option>Diretor(a)</option><option>Auxiliar</option><option>Cozinheiro(a)</option><option>Motorista</option><option>Técnico(a)</option><option>Segurança</option></select></div>
              <div><label style={{display:'block',marginBottom:6,color:'#94a3b8',fontSize:13}}>Data Admissão</label><input type="date" value={formData.dataAdmissao} onChange={e=>setFormData({...formData,dataAdmissao:e.target.value})} style={{width:'100%',padding:'8px 10px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0'}} /></div>
              <div><label style={{display:'block',marginBottom:6,color:'#94a3b8',fontSize:13}}>Email</label><input type="email" value={formData.email} onChange={e=>setFormData({...formData,email:e.target.value})} style={{width:'100%',padding:'8px 10px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0'}} /></div>
              <div><label style={{display:'block',marginBottom:6,color:'#94a3b8',fontSize:13}}>Telefone</label><input type="tel" value={formData.telefone} onChange={e=>setFormData({...formData,telefone:e.target.value})} style={{width:'100%',padding:'8px 10px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0'}} /></div>
            </div>
            <div style={{display:'flex',gap:12,justifyContent:'flex-end'}}>
              <button type="button" onClick={resetForm} style={{padding:'8px 14px',background:'#334155',color:'#e2e8f0',border:'none',borderRadius:6,cursor:'pointer'}}>Cancelar</button>
              <button type="submit" style={{padding:'8px 14px',background:'#10b981',color:'#fff',border:'none',borderRadius:6,cursor:'pointer',fontWeight:500}}>{editingId?'Guardar Alterações':'Registar'}</button>
            </div>
          </form>
        </div>
      )}

      <div style={{background:'#1e293b',borderRadius:12,border:'1px solid #334155',overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead style={{background:'#0f172a'}}><tr><th style={{padding:12,textAlign:'left',borderBottom:'1px solid #334155',color:'#94a3b8'}}>Nome</th><th style={{padding:12,textAlign:'left',borderBottom:'1px solid #334155',color:'#94a3b8'}}>Cargo</th><th style={{padding:12,textAlign:'left',borderBottom:'1px solid #334155',color:'#94a3b8'}}>Contacto</th><th style={{padding:12,textAlign:'left',borderBottom:'1px solid #334155',color:'#94a3b8'}}>Ações</th></tr></thead>
          <tbody>
            {funcionarios.length===0?<tr><td colSpan={4} style={{padding:32,textAlign:'center',color:'#64748b'}}>Nenhum funcionário registado.</td></tr>:
            funcionarios.map(f=>(
              <tr key={f.id} style={{borderTop:'1px solid #334155'}}>
                <td style={{padding:12,color:'#e2e8f0'}}><b>{f.nome}</b>{f.numeroDocumento&&<div style={{fontSize:11,color:'#94a3b8'}}>Doc: {f.numeroDocumento}</div>}</td>
                <td style={{padding:12,color:'#e2e8f0'}}><span style={{padding:'3px 8px',background:f.cargo==='Diretor(a)'?'#f59e0b20':'#6366f120',color:f.cargo==='Diretor(a)'?'#f59e0b':'#6366f1',borderRadius:4,fontSize:12}}>{f.cargo}</span></td>
                <td style={{padding:12,color:'#94a3b8',fontSize:13}}>{f.telefone||'-'}<br/>{f.email||''}</td>
                <td style={{padding:12}}>
                  <button onClick={()=>startEdit(f)} style={{padding:'4px 10px',background:'#6366f1',color:'#fff',border:'none',borderRadius:4,cursor:'pointer',marginRight:6,fontSize:12}}>Editar</button>
                  <button onClick={()=>{setFuncionarios(funcionarios.filter(x=>x.id!==f.id));toast.success('Removido')}} style={{padding:'4px 10px',background:'#ef4444',color:'#fff',border:'none',borderRadius:4,cursor:'pointer',fontSize:12}}>Remover</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
