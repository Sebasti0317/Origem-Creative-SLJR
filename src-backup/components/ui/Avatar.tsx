import { memo } from 'react'

interface AvatarProps {
  name: string
  size?: number
  className?: string
}

export const Avatar = memo(({ name, size = 40, className = '' }: AvatarProps) => {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'
  
  // Cores consistentes baseadas no nome
  const colors = [
    'bg-brand-500', 'bg-blue-500', 'bg-green-500', 
    'bg-amber-500', 'bg-purple-500', 'bg-pink-500'
  ]
  const colorIndex = name ? name.length % colors.length : 0
  
  return (
    <div 
      className={`${colors[colorIndex]} rounded-full flex items-center justify-center text-white font-semibold select-none ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-label={`Avatar de ${name || 'Utilizador'}`}
    >
      {initials}
    </div>
  )
})

Avatar.displayName = 'Avatar'