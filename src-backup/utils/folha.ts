export type Moeda = 'AOA' | 'USD' | 'EUR' | 'BRL' | 'GBP' | string
export type Regiao = 'Angola' | 'Portugal' | 'Brasil' | 'Cabo_Verde' | 'Outro'

export interface RegraDesconto {
  nome: string
  percentagem: number
  tipo: 'percentual' | 'fixo'
  valor?: number
  ativo: boolean // ✅ Novo: permite desativar individualmente
  codigo?: 'irt' | 'inss' | 'tsu' | 'outro' // ✅ Para ligação com isenções
}

export interface ResultadoFolha {
  bruto: number
  descontos: { nome: string; valor: number; ativo: boolean }[]
  totalDescontos: number
  liquido: number
}

export interface ConfigFiscal {
  isento_irt: boolean
  isento_inss: boolean
  isento_tsu: boolean
  percentagem_irt_personalizada?: number | null
  percentagem_inss_personalizada?: number | null
}

export function getRegrasDefault(regiao: Regiao, config?: ConfigFiscal): RegraDesconto[] {
  const regrasBase: RegraDesconto[] = []

  // INSS / TSU / INPS (conforme região)
  if (regiao === 'Angola') {
    regrasBase.push({
      nome: 'INSS (3%)',
      percentagem: config?.percentagem_inss_personalizada || 3,
      tipo: 'percentual',
      ativo: !config?.isento_inss,
      codigo: 'inss'
    })
    regrasBase.push({
      nome: 'IRT (Simplificado)',
      percentagem: config?.percentagem_irt_personalizada || 10,
      tipo: 'percentual',
      ativo: !config?.isento_irt,
      codigo: 'irt'
    })
  }
  if (regiao === 'Portugal') {
    regrasBase.push({
      nome: 'TSU (11%)',
      percentagem: config?.percentagem_inss_personalizada || 11,
      tipo: 'percentual',
      ativo: !config?.isento_tsu,
      codigo: 'tsu'
    })
    regrasBase.push({
      nome: 'IRS (Média)',
      percentagem: config?.percentagem_irt_personalizada || 15,
      tipo: 'percentual',
      ativo: !config?.isento_irt,
      codigo: 'irt'
    })
  }
  if (regiao === 'Brasil') {
    regrasBase.push({
      nome: 'INSS (Tabela)',
      percentagem: config?.percentagem_inss_personalizada || 8,
      tipo: 'percentual',
      ativo: !config?.isento_inss,
      codigo: 'inss'
    })
    regrasBase.push({
      nome: 'IRPF (Média)',
      percentagem: config?.percentagem_irt_personalizada || 12,
      tipo: 'percentual',
      ativo: !config?.isento_irt,
      codigo: 'irt'
    })
  }
  if (regiao === 'Cabo_Verde') {
    regrasBase.push({
      nome: 'INPS (5%)',
      percentagem: config?.percentagem_inss_personalizada || 5,
      tipo: 'percentual',
      ativo: !config?.isento_inss,
      codigo: 'inss'
    })
    regrasBase.push({
      nome: 'IRS (Média)',
      percentagem: config?.percentagem_irt_personalizada || 14,
      tipo: 'percentual',
      ativo: !config?.isento_irt,
      codigo: 'irt'
    })
  }

  // Região genérica
  if (regiao === 'Outro' || regrasBase.length === 0) {
    regrasBase.push({
      nome: 'Desconto Padrão',
      percentagem: 5,
      tipo: 'percentual',
      ativo: true,
      codigo: 'outro'
    })
  }

  return regrasBase
}

export function calcularFolha(salarioBase: number, diasTrabalhados: number, regras: RegraDesconto[]): ResultadoFolha {
  const bruto = (salarioBase / 30) * Math.max(1, diasTrabalhados)
  
  // Aplica apenas descontos ATIVOS
  const descontosAplicados = regras
    .filter(r => r.ativo) // ✅ Filtra isenções
    .map(d => {
      const valor = d.tipo === 'fixo' ? (d.valor || 0) : bruto * (d.percentagem / 100)
      return { nome: d.nome, valor: Math.round(valor * 100) / 100, ativo: true }
    })
  
  // Mostra também descontos INATIVOS (para transparência)
  const descontosInativos = regras
    .filter(r => !r.ativo)
    .map(d => ({ nome: `${d.nome} (Isento)`, valor: 0, ativo: false }))
  
  const todosDescontos = [...descontosAplicados, ...descontosInativos]
  const totalDescontos = descontosAplicados.reduce((sum, d) => sum + d.valor, 0)
  const liquido = Math.round((bruto - totalDescontos) * 100) / 100
  
  return { 
    bruto: Math.round(bruto * 100) / 100, 
    descontos: todosDescontos, 
    totalDescontos, 
    liquido 
  }
}