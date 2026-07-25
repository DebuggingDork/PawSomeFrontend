import { useState } from 'react'
import { PawPrint } from 'lucide-react'

const GRADIENTS = [
  'from-[#ff6b35] to-pink-500',
  'from-violet-500 to-fuchsia-500',
  'from-emerald-500 to-teal-500',
  'from-sky-500 to-indigo-500',
  'from-amber-500 to-orange-600',
]

function gradientFor(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  return GRADIENTS[hash % GRADIENTS.length]
}

interface PetAvatarProps {
  name: string
  photoUrl?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  online?: boolean
  className?: string
}

const SIZE_CLASSES = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-28 w-28 text-3xl',
}

export function PetAvatar({ name, photoUrl, size = 'md', online, className = '' }: PetAvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase()
  // A URL that 404s, times out, or hits a flaky CDN shouldn't leave a blank
  // circle — fall back to the same gradient+initial treatment as "no photo".
  const [failed, setFailed] = useState(false)

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      {photoUrl && !failed ? (
        <img
          src={photoUrl}
          alt={name}
          onError={() => setFailed(true)}
          className={`${SIZE_CLASSES[size]} rounded-full object-cover ring-2 ring-white/10`}
        />
      ) : (
        <div
          className={`${SIZE_CLASSES[size]} flex items-center justify-center rounded-full bg-gradient-to-br font-display font-bold text-white ring-2 ring-white/10 ${gradientFor(name)}`}
        >
          {initial || <PawPrint className="h-1/2 w-1/2" />}
        </div>
      )}
      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-neutral-950 ${
            online ? 'bg-emerald-400' : 'bg-neutral-600'
          }`}
        />
      )}
    </div>
  )
}
