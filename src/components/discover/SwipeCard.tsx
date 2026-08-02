import { PawPrint, MapPin, RotateCcw, Sparkles, BadgeCheck, Eye } from 'lucide-react'
import { SafetyMenu } from '@/components/safety/SafetyMenu'
import { activeHealthTags, isNewHere } from '@/lib/petBadges'
import { GenderBadge } from '@/components/ui/GenderBadge'
// Shared with the onboarding preview, which mirrors this card so what a new owner
// builds during setup is literally what everyone else will swipe on.
import { formatAge } from '@/lib/formatAge'
import { LAYER } from './layers'
import type { BrowseCandidate } from '@/lib/api/types'

/**
 * Frosted-glass treatment for controls floating over a pet photo.
 *
 * A white tint rather than the black one these used to carry: at the opacity
 * needed to keep an icon legible, black reads as a solid disc punched out of
 * the photo, which is the thing the card exists to show. White plus a blur
 * lets the image through and still separates the control from it. The icon
 * carries its own drop-shadow so it stays readable over a bright photo, where
 * a white chip alone would leave a white glyph on near-white.
 *
 * Written out as literal class strings, never composed at runtime — Tailwind
 * scans source text, so a dynamically built class name is simply never
 * generated.
 */
const GLASS = 'bg-white/15 ring-1 ring-white/25 backdrop-blur-md'
const GLASS_ICON = 'text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]'

interface SwipeCardContentProps {
  candidate: BrowseCandidate
  /** Opens the full photo gallery + profile dialog. One swipe photo is a poor
   * sample of any pet — this is how someone confirms a bad angle isn't the
   * whole story before deciding. Optional so nothing else that renders this
   * card (e.g. the onboarding preview) has to grow a fake handler. */
  onPreview?: () => void
}

export function SwipeCardContent({ candidate, onPreview }: SwipeCardContentProps) {
  const { pet, distance_km, previously_passed } = candidate
  const photo = pet.primary_photo_url
  const activeTags = activeHealthTags(pet)

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-neutral-900 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.85)]">
      {photo ? (
        <img src={photo} alt={pet.name} className="h-full w-full object-cover object-top" draggable={false} />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900">
          <PawPrint className="h-20 w-20 text-neutral-700" />
        </div>
      )}

      {/* Soft top vignette so corner badges stay legible over light photos. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/55 to-transparent" />

      {/* Top-left: a single status ribbon, at most. Every pill added here eats
          into the photo, which is the one thing someone is actually deciding
          on. */}
      <div className={`absolute left-3 top-3 ${LAYER.BADGE} flex flex-col items-start gap-2`}>
        {/* Says why a familiar face is back, so a recycled card doesn't read as
            the deck repeating itself by mistake. */}
        {previously_passed && (
          <div className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-neutral-200 ring-1 ring-white/10 backdrop-blur-md">
            <RotateCcw className="h-3 w-3" />
            You passed earlier
          </div>
        )}
        {!previously_passed && isNewHere(pet.created_at) && (
          <div className="flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-brand/40">
            <Sparkles className="h-3 w-3" />
            New here!
          </div>
        )}
      </div>

      {/* Tap-to-expand hint, stacked under gender/safety rather than floated
          near the bottom text panel — that panel's height shifts with how
          many health tags wrap to a second line, which would put a
          bottom-anchored button on top of the text on a longer card. The
          whole card also opens the gallery on a plain tap (wired by the
          caller); this just makes that discoverable instead of a hidden
          gesture nobody would guess to try. */}
      {/* Top-right: gender and safety as separate floating circles — matches the
          reference deck where each control has its own target. */}
      <div className={`absolute right-3 top-3 ${LAYER.BADGE} flex items-center gap-2`}>
        <GenderBadge gender={pet.gender} size="xl" className="shadow-lg shadow-black/40" />
        {pet.owner?.id && (
          <SafetyMenu
            userId={pet.owner.id}
            petId={pet.id}
            otherName={pet.name}
            className="[&>button]:bg-white/15 [&>button]:text-white [&>button]:ring-1 [&>button]:ring-white/25 [&>button]:backdrop-blur-md [&>button]:hover:bg-white/25"
          />
        )}
      </div>

      {/* The scrim and the text box are deliberately separate elements.
          As one box with a big `pt-28`, the padding that gave the gradient a
          smooth ramp also set the box's height — so the darkened region was
          forced to be ~250px tall and swallowed most of the photo, which is
          the one thing someone is actually deciding on. Splitting them lets
          the fade stay gradual while the opaque text sits in a box only as
          tall as its own content. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/70 to-transparent" />

      {/* Sits in the bottom-right corner, level with the card's own text rather
          than floating over the photo. The text box below reserves matching
          right padding so a long name or a third health tag can never run
          underneath it. */}
      {onPreview && (
        <button
          type="button"
          // Same guard SafetyMenu's trigger uses on this card: without it, the
          // parent card's drag gesture sees this pointerdown too and starts
          // tracking a potential swipe underneath what the user meant as a
          // plain tap on the icon.
          onPointerDownCapture={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onPreview()
          }}
          aria-label={`See more photos of ${pet.name}`}
          title="See more photos"
          className={`absolute bottom-4 right-4 ${LAYER.BADGE} flex h-10 w-10 items-center justify-center rounded-full ${GLASS} transition-colors hover:bg-white/25 active:scale-95 sm:bottom-5 sm:right-5`}
        >
          <Eye className={`h-[1.125rem] w-[1.125rem] ${GLASS_ICON}`} />
        </button>
      )}

      <div className="absolute inset-x-0 bottom-0 p-4 pr-16 sm:p-5 sm:pr-[4.5rem]">
        {/* `min-w-0` + `truncate` on the name: a long name with an age beside it
            would otherwise push the age off the card's right edge rather than
            shortening itself. */}
        <div className="mb-1 flex items-baseline gap-2">
          <h3 className="min-w-0 truncate font-display text-2xl font-bold leading-none tracking-tight text-white sm:text-[1.75rem]">
            {pet.name}
          </h3>
          {pet.owner?.is_verified && (
            <BadgeCheck className="h-5 w-5 flex-shrink-0 self-center text-sky-400" aria-label="Verified owner" />
          )}
          <span className="flex-shrink-0 text-base font-medium text-neutral-300 sm:text-lg">
            {formatAge(pet.age_months)}
          </span>
        </div>
        <p className="mb-1.5 truncate text-sm font-medium text-neutral-300">{pet.breed}</p>
        {/* One line, never two: `truncate` on the owner plus `flex-nowrap`
            keeps this row from wrapping and pushing the tags down into the
            photo. */}
        <div className="mb-2.5 flex flex-nowrap items-center gap-x-2 overflow-hidden text-xs text-neutral-400">
          <span className="flex flex-shrink-0 items-center gap-1">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            {/* Null when neither owner has set a location — those pets are kept
                in the deck rather than dropped, so the card has to cope. */}
            {distance_km == null ? 'Distance unknown' : `${distance_km.toFixed(1)} km away`}
          </span>
          {pet.owner?.full_name && (
            <>
              <span aria-hidden="true" className="flex-shrink-0 text-neutral-400">
                &middot;
              </span>
              <span className="truncate">{pet.owner.full_name}</span>
            </>
          )}
        </div>

        {/* Allowed to wrap rather than clip: a clipped third tag would silently
            drop real information about the pet. The text box growing by one
            row is fine now that it no longer carries the gradient's height —
            the chevrons are positioned to clear two rows of tags. */}
        {activeTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {activeTags.map(({ key, label, icon: Icon, className }) => (
              <span
                key={key}
                className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium backdrop-blur-sm ${className}`}
              >
                <Icon className="h-3 w-3 flex-shrink-0" />
                {label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
