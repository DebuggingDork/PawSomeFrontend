import { PawPrint, MapPin } from 'lucide-react'
import { SafetyMenu } from '@/components/safety/SafetyMenu'
import type { BrowseCandidate } from '@/lib/api/types'

function formatAge(months: number) {
  const years = Math.floor(months / 12)
  const remMonths = months % 12
  if (years === 0) return `${months}mo`
  if (remMonths === 0) return `${years}y`
  return `${years}y ${remMonths}mo`
}

interface SwipeCardContentProps {
  candidate: BrowseCandidate
}

export function SwipeCardContent({ candidate }: SwipeCardContentProps) {
  const { pet, distance_km } = candidate
  const photo = pet.primary_photo_url

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 shadow-2xl shadow-black/50">
      {photo ? (
        <img src={photo} alt={pet.name} className="h-full w-full object-cover" draggable={false} />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900">
          <PawPrint className="h-20 w-20 text-neutral-700" />
        </div>
      )}

      {pet.owner?.id && (
        <SafetyMenu
          userId={pet.owner.id}
          petId={pet.id}
          otherName={pet.name}
          className="absolute right-3 top-3 [&>button]:bg-black/40 [&>button]:backdrop-blur-sm"
        />
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 pt-16">
        <div className="mb-1 flex items-baseline gap-2">
          <h3 className="font-display text-2xl font-bold text-white">{pet.name}</h3>
          <span className="text-lg text-neutral-300">{formatAge(pet.age_months)}</span>
        </div>
        <p className="mb-2 text-sm text-neutral-300">{pet.breed}</p>
        <div className="flex items-center gap-3 text-xs text-neutral-400">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {distance_km.toFixed(1)} km away
          </span>
          {pet.owner?.full_name && <span>Owned by {pet.owner.full_name}</span>}
        </div>
      </div>
    </div>
  )
}
