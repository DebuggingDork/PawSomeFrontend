import { PawPrint, MapPin, RotateCcw, Sparkles, BadgeCheck } from 'lucide-react'
import { SafetyMenu } from '@/components/safety/SafetyMenu'
import { activeHealthTags, isNewHere } from '@/lib/petBadges'
import { GenderBadge } from '@/components/ui/GenderBadge'
// Shared with the onboarding preview, which mirrors this card so what a new owner
// builds during setup is literally what everyone else will swipe on.
import { formatAge } from '@/lib/formatAge'
import type { BrowseCandidate } from '@/lib/api/types'

interface SwipeCardContentProps {
  candidate: BrowseCandidate
}

/** Color cue for the compatibility dot — lets the eye triage a match at a
 * glance, before the number itself has even been read. */
function scoreTone(score: number) {
  if (score >= 70) return 'bg-emerald-400'
  if (score >= 40) return 'bg-amber-400'
  return 'bg-rose-400'
}

export function SwipeCardContent({ candidate }: SwipeCardContentProps) {
  const { pet, distance_km, compatibility_score, previously_passed } = candidate
  const photo = pet.primary_photo_url
  const activeTags = activeHealthTags(pet)

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 shadow-2xl shadow-black/50">
      {photo ? (
        <img src={photo} alt={pet.name} className="h-full w-full object-cover object-top" draggable={false} />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900">
          <PawPrint className="h-20 w-20 text-neutral-700" />
        </div>
      )}

      {/* Soft top vignette so the corner badges stay legible over light photos too. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/50 to-transparent" />

      {/* Top-left: status ribbon + compatibility score, stacked */}
      <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-2">
        {/* Says why a familiar face is back, so a recycled card doesn't read as
            the deck repeating itself by mistake. */}
        {previously_passed && (
          <div className="flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-neutral-200 ring-1 ring-white/10 backdrop-blur-md">
            <RotateCcw className="h-3 w-3" />
            You passed earlier
          </div>
        )}
        {!previously_passed && isNewHere(pet.created_at) && (
          <div className="flex items-center gap-1.5 rounded-full bg-[#ff6b35] px-3 py-1 text-xs font-bold text-white shadow-lg shadow-[#ff6b35]/40">
            <Sparkles className="h-3 w-3" />
            New here!
          </div>
        )}
        {compatibility_score != null && (
          <div className="flex items-center gap-1.5 rounded-full bg-black/55 py-1 pl-2 pr-3 text-xs font-semibold text-white ring-1 ring-white/10 backdrop-blur-md">
            <span className={`h-1.5 w-1.5 rounded-full ${scoreTone(compatibility_score)}`} aria-hidden="true" />
            {compatibility_score}% match
          </div>
        )}
      </div>

      {/* Top-right: gender + safety menu, grouped into one glass capsule
          instead of two separately-floating circles. */}
      <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-black/40 p-1 ring-1 ring-white/10 backdrop-blur-md">
        <GenderBadge gender={pet.gender} size="lg" />
        {pet.owner?.id && (
          <SafetyMenu
            userId={pet.owner.id}
            petId={pet.id}
            otherName={pet.name}
            className="[&>button]:hover:bg-white/15"
          />
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-6 pt-24">
        <div className="mb-1 flex items-baseline gap-2">
          <h3 className="font-display text-[1.75rem] font-bold leading-none tracking-tight text-white">{pet.name}</h3>
          {pet.owner?.is_verified && (
            <BadgeCheck className="h-5 w-5 flex-shrink-0 text-sky-400" aria-label="Verified owner" />
          )}
          <span className="text-lg font-medium text-neutral-300">{formatAge(pet.age_months)}</span>
        </div>
        <p className="mb-2.5 text-sm font-medium text-neutral-300">{pet.breed}</p>
        <div className="mb-3.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-neutral-400">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {/* Null when neither owner has set a location — those pets are kept
                in the deck rather than dropped, so the card has to cope. */}
            {distance_km == null ? 'Distance unknown' : `${distance_km.toFixed(1)} km away`}
          </span>
          {pet.owner?.full_name && (
            <>
              <span className="text-neutral-600">&middot;</span>
              <span>Owned by {pet.owner.full_name}</span>
            </>
          )}
        </div>

        {activeTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {activeTags.map(({ key, label, icon: Icon, className }) => (
              <span
                key={key}
                className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm ${className}`}
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
