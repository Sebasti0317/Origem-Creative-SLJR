import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

export default function Usuarios() {
  // ... [Mantém o teu código atual de carregar/listar funcionários] ...
  // Para economizar espaço, vou focar na adição do Aviso Visual.
  // Adiciona este bloco logo após o <div> principal do return, antes da tabela ou formulário.
  
  const AvisoStaff = () => (
    <div style={{ background: '#f59e0b15', border: '1px solid #f59e0b', padding: 12, borderRadius: 8, marginBottom: 20, fontSize: 13, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 18 }}>ℹ️</span>
      <div>
        <b>Nota:</b> Esta lista é apenas para registo interno de funcionários. 
        Para criar um utilizador com <b>acesso de login</b> ao sistema, deve usar a opção "Registar" na página de entrada (Login).
      </div>
    </div>
  )

  return (
    <div>
       <AvisoStaff />
       {/* ... Resto do teu código ... */}
    </div>
  )
}
// Nota: Como o ficheiro é grande, basta adicionares o componente AvisoStaff e chamá-lo no return.
