import { useAuth } from '../hooks/useAuth'
import { APP_CONFIG } from '../config/appConfig'

export default function Dashboard() {
  const { user } = useAuth()
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400">Bem-vindo, {user?.email}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-dark-800 p-6 rounded-xl border border-dark-600">
          <h3 className="text-lg font-semibold text-white">Crianças</h3>
          <p className="text-3xl font-bold text-brand-500 mt-2">0</p>
        </div>
        <div className="bg-dark-800 p-6 rounded-xl border border-dark-600">
          <h3 className="text-lg font-semibold text-white">Funcionários</h3>
          <p className="text-3xl font-bold text-brand-500 mt-2">0</p>
        </div>
        <div className="bg-dark-800 p-6 rounded-xl border border-dark-600">
          <h3 className="text-lg font-semibold text-white">Centro</h3>
          <p className="text-lg text-slate-300 mt-2">{APP_CONFIG.name}</p>
        </div>
      </div>
    </div>
  )
}