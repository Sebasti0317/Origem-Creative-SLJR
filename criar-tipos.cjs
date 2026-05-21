const fs = require('fs');
const path = require('path');

const dir = path.join('src', 'types');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const content = `export type EstadoAcolhimento = 'ativo' | 'transitório' | 'desligado'

export interface Crianca {
  id: string
  nome_completo: string
  data_nascimento: string
  genero: 'masculino' | 'feminino' | 'outro' | 'prefiro não dizer' | null
  contacto_emergencia: string | null
  estado: EstadoAcolhimento
  observacoes_psicossociais: string | null
  data_entrada: string
  data_saida: string | null
  deleted_at: string | null
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface CriancaFormData {
  nome_completo: string
  data_nascimento: string
  genero: Crianca['genero']
  contacto_emergencia: string
  estado: EstadoAcolhimento
  observacoes_psicossociais: string
  data_entrada: string
  data_saida?: string
}`;

fs.writeFileSync(path.join(dir, 'index.ts'), content, 'utf8');
console.log('✅ Ficheiro src/types/index.ts criado com sucesso.');