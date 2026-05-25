import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface Crianca {
  id: string
  nome: string
  dataNascimento: string
  genero: string
  dataEntrada: string
  dataSaida?: string
  observacoes: string
}

export default function Criancas() {
  const [criancas, setCriancas] = useState<Crianca[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nome: '', dataNascimento: '', genero: 'M', dataEntrada: new Date().toISOString().split('T')[0], dataSaida: '', observacoes: ''
  })

  useEffect(() => {
    const saved = localStorage.getItem('criancas_db')
    if (saved) setCriancas(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('criancas_db', JSON.stringify(criancas))
  }, [criancas])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      setCriancas(criancas.map(c => c.id === editingId ? { ...c, ...formData } : c))
      toast.success('Registo atualizado!')
    } else {
      setCriancas([...criancas, { id: Date.now().toString(), ...formData }])
      toast.success('Criança registada!')
    }
    resetForm()
  }

  const resetForm = () => {
    setFormData({ nome: '', dataNascimento: '', genero: 'M', dataEntrada: new Date().toISOString().split('T')[0], dataSaida: '', observacoes: '' })
    setEditingId(null)
    setShowForm(false)
  }

  const startEdit = (c: Crianca) => {
    setFormData(c)
    setEditingId(c.id)
    setShowForm(true)
  }

  const calcularIdade = (d: string) => {
    if (!d) return '-'
    const hoje = new Date(), nasc = new Date(d)
    let idade = hoje.getFullYear() - nasc.getFullYear()
    if (hoje.getMonth() < nasc.getMonth() || (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate())) idade--
    return idade
  }

  const isAtiva = (c: Crianca) => !c.dataSaida

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <h2 style={{fontSize:26,fontWeight:'bold',margin:0}}>Gestão de Crianças</h2>
        <button onClick={()=>setShowForm(!showForm)} style={{padding:'10px 18px',background:showForm?'#64748b':'#6366f1',color:'#fff',border:'none',borderRadius:8,cursor:'pointer'}}>{showForm?'Cancelar':'+ Nova Criança'}</button>
      </div>

      {showForm && (
        <div style={{background:'#1e293b',padding:20,borderRadius:12,border:'1px solid #334155',marginBottom:24}}>
          <h3 style={{marginTop:0,marginBottom:16,fontSize:18}}>{editingId?'Editar':'Registar'} Criança</h3>
          <form onSubmit={handleSubmit}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
              <div><label style={{display:'block',marginBottom:6,color:'#94a3b8',fontSize:13}}>Nome *</label><input type="text" required value={formData.nome} onChange={e=>setFormData({...formData,nome:e.target.value})} style={{width:'100%',padding:'8px 10px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0'}} /></div>
              <div><label style={{display:'block',marginBottom:6,color:'#94a3b8',fontSize:13}}>Data Nascimento *</label><input type="date" required value={formData.dataNascimento} onChange={e=>setFormData({...formData,dataNascimento:e.target.value})} style={{width:'100%',padding:'8px 10px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0'}} /></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
              <div><label style={{display:'block',marginBottom:6,color:'#94a3b8',fontSize:13}}>Género</label><select value={formData.genero} onChange={e=>setFormData({...formData,genero:e.target.value})} style={{width:'100%',padding:'8px 10px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0'}}><option value="M">Masculino</option><option value="F">Feminino</option></select></div>
              <div><label style={{display:'block',marginBottom:6,color:'#94a3b8',fontSize:13}}>Data Entrada</label><input type="date" value={formData.dataEntrada} onChange={e=>setFormData({...formData,dataEntrada:e.target.value})} style={{width:'100%',padding:'8px 10px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0'}} /></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
              <div><label style={{display:'block',marginBottom:6,color:'#94a3b8',fontSize:13}}>Data Saída (opcional)</label><input type="date" value={formData.dataSaida} onChange={e=>setFormData({...formData,dataSaida:e.target.value})} style={{width:'100%',padding:'8px 10px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0'}} /></div>
              <div><label style={{display:'block',marginBottom:6,color:'#94a3b8',fontSize:13}}>Estado</label><div style={{padding:'8px 10px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:isAtiva({...formData,id:''})?'#10b981':'#ef4444',fontSize:13}}>{isAtiva({...formData,id:''})?'✅ Ativa no Centro':' Saída Registada'}</div></div>
            </div>
            <div style={{marginBottom:16}}><label style={{display:'block',marginBottom:6,color:'#94a3b8',fontSize:13}}>Observações</label><textarea rows={2} value={formData.observacoes} onChange={e=>setFormData({...formData,observacoes:e.target.value})} style={{width:'100%',padding:'8px 10px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0'}} /></div>
            <div style={{display:'flex',gap:12,justifyContent:'flex-end'}}>
              <button type="button" onClick={resetForm} style={{padding:'8px 14px',background:'#334155',color:'#e2e8f0',border:'none',borderRadius:6,cursor:'pointer'}}>Cancelar</button>
              <button type="submit" style={{padding:'8px 14px',background:'#10b981',color:'#fff',border:'none',borderRadius:6,cursor:'pointer',fontWeight:500}}>{editingId?'Guardar Alterações':'Registar'}</button>
            </div>
          </form>
        </div>
      )}

      <div style={{background:'#1e293b',borderRadius:12,border:'1px solid #334155',overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead style={{background:'#0f172a'}}><tr><th style={{padding:12,textAlign:'left',borderBottom:'1px solid #334155',color:'#94a3b8'}}>Nome</th><th style={{padding:12,textAlign:'left',borderBottom:'1px solid #334155',color:'#94a3b8'}}>Idade</th><th style={{padding:12,textAlign:'left',borderBottom:'1px solid #334155',color:'#94a3b8'}}>Entrada</th><th style={{padding:12,textAlign:'left',borderBottom:'1px solid #334155',color:'#94a3b8'}}>Saída</th><th style={{padding:12,textAlign:'left',borderBottom:'1px solid #334155',color:'#94a3b8'}}>Estado</th><th style={{padding:12,textAlign:'left',borderBottom:'1px solid #334155',color:'#94a3b8'}}>Ações</th></tr></thead>
          <tbody>
            {criancas.length===0?<tr><td colSpan={6} style={{padding:32,textAlign:'center',color:'#64748b'}}>Nenhuma criança registada.</td></tr>:
            criancas.map(c=>(
              <tr key={c.id} style={{borderTop:'1px solid #334155'}}>
                <td style={{padding:12,color:'#e2e8f0'}}>{c.nome}</td>
                <td style={{padding:12,color:'#e2e8f0'}}>{calcularIdade(c.dataNascimento)} anos</td>
                <td style={{padding:12,color:'#94a3b8'}}>{c.dataEntrada?new Date(c.dataEntrada).toLocaleDateString('pt-PT'):'-'}</td>
                <td style={{padding:12,color:c.dataSaida?'#ef4444':'#64748b'}}>{c.dataSaida?new Date(c.dataSaida).toLocaleDateString('pt-PT'):'-'}</td>
                <td style={{padding:12}}><span style={{padding:'3px 8px',borderRadius:4,fontSize:12,background:isAtiva(c)?'#dcfce7':'#fee2e2',color:isAtiva(c)?'#166534':'#991b1b'}}>{isAtiva(c)?'Ativa':'Saída'}</span></td>
                <td style={{padding:12}}>
                  <button onClick={()=>startEdit(c)} style={{padding:'4px 10px',background:'#6366f1',color:'#fff',border:'none',borderRadius:4,cursor:'pointer',marginRight:6,fontSize:12}}>Editar</button>
                  <button onClick={()=>{setCriancas(criancas.filter(x=>x.id!==c.id));toast.success('Removido')}} style={{padding:'4px 10px',background:'#ef4444',color:'#fff',border:'none',borderRadius:4,cursor:'pointer',fontSize:12}}>Remover</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
