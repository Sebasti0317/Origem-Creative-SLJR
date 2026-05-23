export default function Dashboard() {
  return (
    <div>
      <h2 style={{fontSize: '28px', fontWeight: 'bold', marginBottom: '32px'}}>Dashboard</h2>
      
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px'}}>
        <div style={{
          background: '#1e293b',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #334155',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', transform: 'translate(30px, -30px)'}} />
          <h3 style={{fontSize: '16px', color: '#94a3b8', margin: '0 0 12px 0', position: 'relative'}}>Crianças</h3>
          <p style={{fontSize: '36px', fontWeight: 'bold', color: '#6366f1', margin: 0, position: 'relative'}}>0</p>
          <p style={{fontSize: '13px', color: '#64748b', margin: '8px 0 0 0'}}>Total registadas</p>
        </div>
        
        <div style={{
          background: '#1e293b',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #334155',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', transform: 'translate(30px, -30px)'}} />
          <h3 style={{fontSize: '16px', color: '#94a3b8', margin: '0 0 12px 0', position: 'relative'}}>Funcionários</h3>
          <p style={{fontSize: '36px', fontWeight: 'bold', color: '#10b981', margin: 0, position: 'relative'}}>0</p>
          <p style={{fontSize: '13px', color: '#64748b', margin: '8px 0 0 0'}}>Equipa ativa</p>
        </div>
        
        <div style={{
          background: '#1e293b',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #334155',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '50%', transform: 'translate(30px, -30px)'}} />
          <h3 style={{fontSize: '16px', color: '#94a3b8', margin: '0 0 12px 0', position: 'relative'}}>Centro</h3>
          <p style={{fontSize: '18px', color: '#e2e8f0', margin: '8px 0', position: 'relative'}}>Origem Creative SLJR</p>
          <p style={{fontSize: '13px', color: '#64748b', margin: '0', position: 'relative'}}>Centro de Acolhimento</p>
        </div>
      </div>
      
      <div style={{
        background: '#1e293b',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #334155'
      }}>
        <h3 style={{fontSize: '20px', fontWeight: 'bold', margin: '0 0 16px 0'}}>Bem-vindo ao Sistema</h3>
        <p style={{color: '#94a3b8', margin: 0, lineHeight: '1.6'}}>
          Sistema de Gestão de Centro de Acolhimento. Utiliza o menu lateral para navegar entre as diferentes secções.
          Podes registar crianças, gerir funcionários e acompanhar todas as atividades do centro.
        </p>
      </div>
    </div>
  )
}
