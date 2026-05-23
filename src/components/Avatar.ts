export function Avatar({ name, size = 32 }: { name?: string; size?: number }) {
  const initial = name?.charAt(0).toUpperCase() || '?'
  return (
    <div style={{ width: size, height: size, borderRadius: '9999px', backgroundColor: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: size * 0.4 }}>
      {initial}
    </div>
  )
}