import { supabase } from '../lib/supabase'

export async function getDashboardMetrics() {
  try {
    const mesAtual = new Date().toISOString().slice(0, 7) + '-01'

    // Crianças: busca dados reais sem count=exact (evita 400)
    const { data: criancas } = await supabase
      .from('criancas')
      .select('estado')
      .is('deleted_at', null)

    const totalCriancas = criancas?.length || 0
    const criancasAtivas = criancas?.filter((c: any) => c.estado === 'ativo').length || 0
    const criancasTransitorias = criancas?.filter((c: any) => c.estado === 'transitorio' || c.estado === 'transitório').length || 0

    // Funcionários: mesma abordagem
    const { data: funcionarios } = await supabase
      .from('funcionarios')
      .select('estado')

    const totalFuncionarios = funcionarios?.filter((f: any) => f.estado === 'ativo').length || 0
    const funcionariosFerias = funcionarios?.filter((f: any) => f.estado === 'ferias' || f.estado === 'férias').length || 0

    // Folha do mês
    const { data: folhas } = await supabase
      .from('folha_pagamento')
      .select('salario_liquido')
      .eq('mes_referencia', mesAtual)

    const totalPayroll = (folhas || []).reduce((sum: number, f: any) => sum + Number(f?.salario_liquido || 0), 0)

    return {
      criancas: { total: totalCriancas, ativas: criancasAtivas, transitorias: criancasTransitorias },
      funcionarios: { total: totalFuncionarios, ferias: funcionariosFerias },
      payroll: { mensal: Math.round(totalPayroll * 100) / 100 }
    }
  } catch (error) {
    console.error('❌ Erro dashboard:', error)
    return {
      criancas: { total: 0, ativas: 0, transitorias: 0 },
      funcionarios: { total: 0, ferias: 0 },
      payroll: { mensal: 0 }
    }
  }
}