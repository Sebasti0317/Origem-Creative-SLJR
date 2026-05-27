import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

export default function FolhaSalarial() {
  const [pagamentos, setPagamentos] = useState([])
  const [funcionariosList, setFuncionariosList] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [isento, setIsento] = useState(false)
  const [formData, setFormData] = useState({
    funcionario_nome: '', mes_referencia: new Date().toISOString().slice(0,7), pais: 'Angola', moeda: 'AOA',
    salario_base: '', bonificacoes: '0', subs_ferias: '0', subs_natal: '0',
    subs_taxi: '0', subs_alimentacao: '0', subs_outro: '0', outros_descontos: '0'
  })
  const [calculos, setCalculos] = useState({ inss: 0, irt: 0, liquido: 0 })

  useEffect(() => {
    carregarDados()
    carregarFuncionarios()
  }, [])

  const carregarDados = async () => {
    setCarregando(true)
    const { data, error } = await supabase.from('folha_salarial').select('*').order('created_at', { ascending: false })
    if (error) { toast.error('Erro ao carregar folha'); console.error(error) }
    else { setPagamentos(data || []) }
    setCarregando(false)
  }

  const carregarFuncionarios = async () => {
    const { data } = await supabase.from('funcionarios').select('id, nome_completo, nome').order('nome_completo')
    setFuncionariosList(data || [])
  }

  // Cálculo automático de preview
  useEffect(() => {
    const base = parseFloat(formData.salario_base) || 0
    const subs = ['bonificacoes','subs_ferias','subs_natal','subs_taxi','subs_alimentacao','subs_outro'].reduce((sum, k) => sum + (parseFloat(formData[k]) || 0), 0)
    const bruto = base + subs
    const desc = parseFloat(formData.outros_descontos) || 0
    
    const inss = isento ? 0 : base * 0.03 // 3% INSS Angola
    // IRT simplificado (progressivo Angola)
    let irt = 0
    if (!isento && bruto > 150000) {
      const resto = bruto - 150000
      if (resto <= 150000) irt = resto * 0.05
      else if (resto <= 300000) irt = 150000*0.05 + (resto-150000)*0.10
      else if (resto <= 450000) irt = 150000*0.05 + 150000*0.10 + (resto-300000)*0.15
      else if (resto <= 850000) irt = 150000*0.05 + 150000*0.10 + 150000*0.15 + (resto-450000)*0.20
      else irt = 150000*0.05 + 150000*0.10 + 150000*0.15 + 400000*0.20 + (resto-850000)*0.25
    }
    
    setCalculos({ inss, irt, liquido: bruto - inss - irt - desc })
  }, [formData, isento])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.funcionario_nome || !formData.salario_base) return toast.error('Seleciona funcionário e salário base.')
    setCarregando(true)

    const payload = {
      funcionario_nome: formData.funcionario_nome,
      mes_referencia: formData.mes_referencia,
      pais: formData.pais,
      moeda: formData.moeda,
      salario_base: parseFloat(formData.salario_base) || 0,
      bonificacoes: parseFloat(formData.bonificacoes) || 0,
      subs_ferias: parseFloat(formData.subs_ferias) || 0,
      subs_natal: parseFloat(formData.subs_natal) || 0,
      subs_taxi: parseFloat(formData.subs_taxi) || 0,
      subs_alimentacao: parseFloat(formData.subs_alimentacao) || 0,
      subs_outro: parseFloat(formData.subs_outro) || 0,
      inss: calculos.inss,
      irt: calculos.irt,
      outros_descontos: parseFloat(formData.outros_descontos) || 0,
      salario_liquido: calculos.liquido,
      isento: isento,
      data_pagamento: new Date().toISOString().split('T')[0]
    }

    let res
    if (editingId) {
      res = await supabase.from('folha_salarial').update(payload).eq('id', editingId)
    } else {
      res = await supabase.from('folha_salarial').insert([payload])
    }

    if (res.error) {
      console.error('❌ Erro Folha:', res.error)
      toast.error('Erro ao guardar: ' + res.error.message)
    } else {
      toast.success(editingId ? 'Folha atualizada!' : 'Folha registada!')
      resetForm()
      carregarDados()
    }
    setCarregando(false)
  }

  const resetForm = () => {
    setFormData({ funcionario_nome: '', mes_referencia: new Date().toISOString().slice(0,7), pais: 'Angola', moeda: 'AOA', salario_base: '', bonificacoes: '0', subs_ferias: '0', subs_natal: '0', subs_taxi: '0', subs_alimentacao: '0', subs_outro: '0', outros_descontos: '0' })
    setIsento(false)
    setEditingId(null)
    setShowForm(false)
  }

  const startEdit = (p) => {
    setFormData({
      funcionario_nome: p.funcionario_nome || '', mes_referencia: p.mes_referencia || '', pais: p.pais || 'Angola', moeda: p.moeda || 'AOA',
      salario_base: String(p.salario_base || ''), bonificacoes: String(p.bonificacoes || '0'), subs_ferias: String(p.subs_ferias || '0'),
      subs_natal: String(p.subs_natal || '0'), subs_taxi: String(p.subs_taxi || '0'), subs_alimentacao: String(p.subs_alimentacao || '0'),
      subs_outro: String(p.subs_outro || '0'), outros_descontos: String(p.outros_descontos || '0')
    })
    setIsento(p.isento || false)
    setEditingId(p.id)
    setShowForm(true)
  }

  const remover = async (id) => {
    if (!confirm('Remover este registo de folha?')) return
    setCarregando(true)
    const { error } = await supabase.from('folha_salarial').delete().eq('id', id)
    if (error) toast.error('Erro ao remover')
    else { toast.success('Removido'); carregarDados() }
    setCarregando(false)
  }

  const formatMoney = (v) => v.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <h2 style={{fontSize:26,fontWeight:'bold',margin:0}}>Folha Salarial</h2>
        <button onClick={()=>{resetForm();setShowForm(!showForm)}} disabled={carregando} style={{padding:'10px 18px',background:showForm?'#64748b':'#6366f1',color:'#fff',border:'none',borderRadius:8,cursor:'pointer'}}>{showForm?'Cancelar':'+ Novo Registo'}</button>
      </div>

      {showForm && (
        <div style={{background:'#1e293b',padding:20,borderRadius:12,border:'1px solid #334155',marginBottom:24}}>
          <h3 style={{marginTop:0,marginBottom:16,fontSize:18}}>{editingId?'Editar':'Registar'} Folha</h3>
          <form onSubmit={handleSubmit}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
              <div>
                <label style={{display:'block',marginBottom:6,color:'#94a3b8',fontSize:13}}>Funcionário *</label>
                <select required value={formData.funcionario_nome} onChange={e=>setFormData({...formData,funcionario_nome:e.target.value})} style={{width:'100%',padding:'8px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0'}}>
                  <option value="">Selecionar...</option>
                  {funcionariosList.map(f=><option key={f.id} value={f.nome_completo||f.nome}>{f.nome_completo||f.nome}</option>)}
                </select>
              </div>
              <div>
                <label style={{display:'block',marginBottom:6,color:'#94a3b8',fontSize:13}}>Mês Referência</label>
                <input type="month" value={formData.mes_referencia} onChange={e=>setFormData({...formData,mes_referencia:e.target.value})} style={{width:'100%',padding:'8px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0'}}/>
              </div>
            </div>
            
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
              <div><label style={{display:'block',marginBottom:4,color:'#94a3b8',fontSize:12}}>💰 Salário Base *</label><input type="text" required placeholder="50000" value={formData.salario_base} onChange={e=>setFormData({...formData,salario_base:e.target.value.replace(/[^0-9.]/g,'')})} style={{width:'100%',padding:'8px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0'}}/></div>
              <div><label style={{display:'block',marginBottom:4,color:'#94a3b8',fontSize:12}}>Bonificações</label><input type="text" placeholder="0" value={formData.bonificacoes} onChange={e=>setFormData({...formData,bonificacoes:e.target.value.replace(/[^0-9.]/g,'')})} style={{width:'100%',padding:'8px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0'}}/></div>
              <div><label style={{display:'block',marginBottom:4,color:'#94a3b8',fontSize:12}}>Sub. Férias</label><input type="text" placeholder="0" value={formData.subs_ferias} onChange={e=>setFormData({...formData,subs_ferias:e.target.value.replace(/[^0-9.]/g,'')})} style={{width:'100%',padding:'8px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0'}}/></div>
              <div><label style={{display:'block',marginBottom:4,color:'#94a3b8',fontSize:12}}>Sub. Natal</label><input type="text" placeholder="0" value={formData.subs_natal} onChange={e=>setFormData({...formData,subs_natal:e.target.value.replace(/[^0-9.]/g,'')})} style={{width:'100%',padding:'8px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0'}}/></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
              <div><label style={{display:'block',marginBottom:4,color:'#94a3b8',fontSize:12}}>Sub. Táxi</label><input type="text" placeholder="0" value={formData.subs_taxi} onChange={e=>setFormData({...formData,subs_taxi:e.target.value.replace(/[^0-9.]/g,'')})} style={{width:'100%',padding:'8px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0'}}/></div>
              <div><label style={{display:'block',marginBottom:4,color:'#94a3b8',fontSize:12}}>Sub. Alimentação</label><input type="text" placeholder="0" value={formData.subs_alimentacao} onChange={e=>setFormData({...formData,subs_alimentacao:e.target.value.replace(/[^0-9.]/g,'')})} style={{width:'100%',padding:'8px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0'}}/></div>
              <div><label style={{display:'block',marginBottom:4,color:'#94a3b8',fontSize:12}}>Sub. Outro</label><input type="text" placeholder="0" value={formData.subs_outro} onChange={e=>setFormData({...formData,subs_outro:e.target.value.replace(/[^0-9.]/g,'')})} style={{width:'100%',padding:'8px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#e2e8f0'}}/></div>
              <div><label style={{display:'block',marginBottom:4,color:'#94a3b8',fontSize:12}}>Outros Desc.</label><input type="text" placeholder="0" value={formData.outros_descontos} onChange={e=>setFormData({...formData,outros_descontos:e.target.value.replace(/[^0-9.]/g,'')})} style={{width:'100%',padding:'8px',background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#ef4444'}}/></div>
            </div>

            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:12,background:isento?'#14532d':'#0f172a',border:`1px solid ${isento?'#22c55e':'#334155'}`,borderRadius:8,marginBottom:16}}>
              <span style={{color:isento?'#4ade80':'#94a3b8',fontSize:14}}><b>Regime de Isenção Fiscal?</b> <span style={{fontSize:12}}>(Zera INSS/IRT)</span></span>
              <button type="button" onClick={()=>setIsento(!isento)} style={{width:44,height:24,borderRadius:12,border:'none',background:isento?'#22c55e':'#475569',position:'relative',cursor:'pointer'}}>
                <div style={{width:18,height:18,background:'#fff',borderRadius:'50%',position:'absolute',top:3,left:isento?23:3,transition:'left 0.2s'}}/>
              </button>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:16,padding:12,background:'#0f172a',borderRadius:8,textAlign:'center'}}>
              <div><div style={{color:'#94a3b8',fontSize:12}}>INSS</div><b style={{fontSize:18,color:isento?'#4ade80':'#ef4444'}}>{isento?'ISENTO':`-${formatMoney(calculos.inss)}`}</b></div>
              <div><div style={{color:'#94a3b8',fontSize:12}}>IRT</div><b style={{fontSize:18,color:isento?'#4ade80':'#ef4444'}}>{isento?'ISENTO':`-${formatMoney(calculos.irt)}`}</b></div>
              <div><div style={{color:'#94a3b8',fontSize:12}}>LÍQUIDO</div><b style={{fontSize:22,color:'#10b981'}}>{formatMoney(calculos.liquido)} Kz</b></div>
            </div>

            <div style={{display:'flex',gap:12,justifyContent:'flex-end'}}>
              <button type="button" onClick={resetForm} style={{padding:'8px 14px',background:'#334155',color:'#e2e8f0',border:'none',borderRadius:6,cursor:'pointer'}}>Cancelar</button>
              <button type="submit" disabled={carregando} style={{padding:'8px 14px',background:'#10b981',color:'#fff',border:'none',borderRadius:6,cursor:'pointer',fontWeight:500}}>{carregando?'A guardar...':(editingId?'Guardar':'Registar')}</button>
            </div>
          </form>
        </div>
      )}

      <div style={{background:'#1e293b',borderRadius:12,border:'1px solid #334155',overflow:'hidden'}}>
        {carregando && <div style={{padding:20,textAlign:'center',color:'#94a3b8'}}>A carregar folha...</div>}
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead style={{background:'#0f172a'}}><tr><th style={{padding:12,textAlign:'left',borderBottom:'1px solid #334155',color:'#94a3b8'}}>Funcionário / Mês</th><th style={{padding:12,textAlign:'left',borderBottom:'1px solid #334155',color:'#94a3b8'}}>Bruto</th><th style={{padding:12,textAlign:'left',borderBottom:'1px solid #334155',color:'#94a3b8'}}>Desc.</th><th style={{padding:12,textAlign:'left',borderBottom:'1px solid #334155',color:'#94a3b8'}}>Líquido</th><th style={{padding:12,textAlign:'left',borderBottom:'1px solid #334155',color:'#94a3b8'}}>Ações</th></tr></thead>
          <tbody>
            {!carregando && pagamentos.length===0 && <tr><td colSpan={5} style={{padding:32,textAlign:'center',color:'#64748b'}}>Sem registos de folha.</td></tr>}
            {!carregando && pagamentos.map(p=>(
              <tr key={p.id} style={{borderTop:'1px solid #334155'}}>
                <td style={{padding:12,color:'#e2e8f0'}}><div style={{fontWeight:500}}>{p.funcionario_nome}</div><div style={{fontSize:12,color:'#94a3b8'}}>{p.mes_referencia} {p.isento&&<span style={{background:'#dcfce7',color:'#166534',padding:'2px 6px',borderRadius:4,marginLeft:6,fontSize:10}}>Isento</span>}</div></td>
                <td style={{padding:12,color:'#94a3b8'}}>{formatMoney(p.salario_base+p.bonificacoes+p.subs_ferias+p.subs_natal+p.subs_taxi+p.subs_alimentacao+p.subs_outro)} Kz</td>
                <td style={{padding:12,color:'#ef4444'}}>{p.isento?'0,00':`-${formatMoney(p.inss+p.irt+p.outros_descontos)}`}</td>
                <td style={{padding:12,color:'#10b981',fontWeight:'bold'}}>{formatMoney(p.salario_liquido)} Kz</td>
                <td style={{padding:12}}>
                  <button onClick={()=>startEdit(p)} style={{padding:'4px 10px',background:'#6366f1',color:'#fff',border:'none',borderRadius:4,cursor:'pointer',marginRight:6,fontSize:12}}>Editar</button>
                  <button onClick={()=>remover(p.id)} style={{padding:'4px 10px',background:'#ef4444',color:'#fff',border:'none',borderRadius:4,cursor:'pointer',fontSize:12}}>Remover</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
