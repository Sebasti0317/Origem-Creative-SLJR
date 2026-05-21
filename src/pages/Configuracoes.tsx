import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Save, Bell, Palette, Shield, Database } from 'lucide-react'

export default function Configuracoes() {
  const [config, setConfig] = useState({
    nomeCentro: 'Origem Creative SLJR',
    email: 'geral@origemcreative.com',
    notificacoes: true,
    tema: 'dark'
  })

  const saveConfig = () => {
    localStorage.setItem('origem_config', JSON.stringify(config))
    toast.success('Configurações guardadas!')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Configurações</h1>
        <p className="text-slate-400 text-sm mt-1">Personaliza o sistema</p>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Shield size={20} className="text-brand-400" />
          Informações do Centro
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nome do Centro</label>
            <input
              type="text"
              value={config.nomeCentro}
              onChange={(e) => setConfig({ ...config, nomeCentro: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email de Contacto</label>
            <input
              type="email"
              value={config.email}
              onChange={(e) => setConfig({ ...config, email: e.target.value })}
              className="input-field"
            />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Bell size={20} className="text-brand-400" />
          Notificações
        </h3>
        <label className="flex items-center justify-between p-3 bg-dark-600/50 rounded-lg cursor-pointer">
          <div>
            <p className="text-sm font-medium text-white">Ativar Notificações</p>
            <p className="text-xs text-slate-400">Receber alertas de aniversários, stock, etc.</p>
          </div>
          <input
            type="checkbox"
            checked={config.notificacoes}
            onChange={(e) => setConfig({ ...config, notificacoes: e.target.checked })}
            className="w-5 h-5 rounded"
          />
        </label>
      </div>

      <div className="flex justify-end">
        <button onClick={saveConfig} className="btn-primary flex items-center gap-2">
          <Save size={18} />
          Guardar Configurações
        </button>
      </div>
    </div>
  )
}