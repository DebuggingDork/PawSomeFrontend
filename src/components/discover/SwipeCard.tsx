import { PawPrint, MapPin, Sparkles, BadgeCheck } from 'lucide-react'
import { SafetyMenu } from '@/components/safety/SafetyMenu'
import { activeHealthTags, isNewHere } from '@/lib/petBadges'
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
  const { pet, distance_km, compatibility_score } = candidate
  const photo = pet.primary_photo_url
  const activeTags = activeHealthTags(pet)

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 shadow-2xl shadow-black/50">
      {photo ? (
        <img src={photo} alt={pet.name} className="h-full w-full object-cover" draggable={false} />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900">
          <PawPrint className="h-20 w-20 text-neutral-700" />
        </div>
      )}

      {/* Top-left: "new here" ribbon + compatibility score, stacked */}
      <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
        {isNewHere(pet.created_at) && (
          <div className="flex items-center gap-1 rounded-full bg-[#ff6b35] px-3 py-1 text-xs font-bold text-white shadow-lg shadow-[#ff6b35]/40">
            <Sparkles className="h-3 w-3" />
            New here!
          </div>
        )}
        {compatibility_score != null && (
          <div className="rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {compatibility_score}% match
          </div>
        )}
      </div>

      {/* Top-right: gender + safety menu */}
      <div className="absolute right-3 top-3 flex items-center gap-2">
        <span
          aria-label={pet.gender === 'male' ? 'Male' : 'Female'}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-base text-white backdrop-blur-sm"
        >
          {pet.gender === 'male' ? '♂' : '♀'}
        </span>
        {pet.owner?.id && (
          <SafetyMenu
            userId={pet.owner.id}
            petId={pet.id}
            otherName={pet.name}
            className="[&>button]:bg-black/60 [&>button]:backdrop-blur-sm"
          />
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-6 pt-20">
        <div className="mb-1 flex items-baseline gap-1.5">
          <h3 className="font-display text-2xl font-bold text-white">{pet.name}</h3>
          {pet.owner?.is_verified && (
            <BadgeCheck className="h-5 w-5 flex-shrink-0 text-sky-400" aria-label="Verified owner" />
          )}
          <span className="text-lg text-neutral-300">{formatAge(pet.age_months)}</span>
        </div>
        <p className="mb-2 text-sm text-neutral-300">{pet.breed}</p>
        <div className="mb-3 flex items-center gap-3 text-xs text-neutral-400">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {distance_km.toFixed(1)} km away
          </span>
          {pet.owner?.full_name && <span>Owned by {pet.owner.full_name}</span>}
        </div>

        {activeTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {activeTags.map(({ key, label, icon: Icon, className }) => (
              <span
                key={key}
                className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${className}`}
              >
                <Icon className="h-3 w-3" />
                {label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
