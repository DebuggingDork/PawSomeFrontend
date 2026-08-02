import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { PawPrint, MapPin, Sparkles, BadgeCheck, Camera } from 'lucide-react'
import { formatAge } from '@/lib/formatAge'
import { speciesEmoji } from '@/lib/species'
import { GenderBadge } from '@/components/ui/GenderBadge'

/** Everything the preview card can show. Values arrive as the user types, before
 * anything is saved, so this is deliberately all-optional: the card has to look
 * deliberate at every stage of being filled in, not just when it's complete. */
export interface CardDraft {
  petName: string
  species: string
  breed: string
  ageMonths: number | null
  gender: 'male' | 'female'
  petPhotoUrl: string | null
  ownerName: string
  ownerPhotoUrl: string | null
  ownerVerified: boolean
  locality: string
}

const EASE_OUT = [0.16, 1, 0.3, 1] as const

/**
 * A pixel-honest replica of the Discover card (see components/discover/SwipeCard),
 * fed from in-progress form state instead of the API.
 *
 * This is the whole reason the redesigned onboarding doesn't read as a form: the
 * user isn't answering questions, they're watching the thing other owners will
 * judge them on assemble itself. Every field has a visible payoff one pane over,
 * which is why the copy can afford to ask for a bio at all.
 */
export function LiveCardPreview({ draft, compact = false }: { draft: CardDraft; compact?: boolean }) {
  const shouldReduceMotion = useReducedMotion()
  const hasName = draft.petName.trim().length > 0
  const hasPhoto = !!draft.petPhotoUrl

  const rise = shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 8, filter: 'blur(4px)' },
        animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
        exit: { opacity: 0, y: -4, filter: 'blur(4px)' },
      }
  const riseTransition = { duration: 0.45, ease: EASE_OUT }

  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-neutral-900/80 p-2.5">
        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-800">
          {hasPhoto ? (
            <img src={draft.petPhotoUrl!} alt="" decoding="async" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <PawPrint className="h-5 w-5 text-neutral-400" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-bold text-white">
            {hasName ? draft.petName : 'Your pet'}
            {draft.ageMonths ? <span className="ml-1.5 font-sans font-normal text-neutral-400">{formatAge(draft.ageMonths)}</span> : null}
          </p>
          <p className="truncate text-xs text-neutral-400">
            {draft.breed || 'Their card builds as you answer'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-[340px]">
      {/* Brand glow, sized to the card so it reads as the card casting light
          rather than a decorative blob parked behind the column. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 -z-10 rounded-[3rem] bg-brand/12 blur-[64px]"
      />

      <motion.div
        layout={!shouldReduceMotion}
        transition={riseTransition}
        className={`relative aspect-[3/4.1] w-full overflow-hidden rounded-3xl shadow-2xl shadow-black/60 transition-colors duration-500 ${
          hasPhoto ? 'border border-white/10 bg-neutral-900' : 'border border-dashed border-neutral-700 bg-neutral-900/70'
        }`}
      >
        {/* Hero photo */}
        <AnimatePresence mode="wait">
          {hasPhoto ? (
            <motion.img
              key={draft.petPhotoUrl}
              src={draft.petPhotoUrl!}
              alt=""
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.06, filter: 'blur(12px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.7, ease: EASE_OUT }}
              className="absolute inset-0 h-full w-full object-cover"
              draggable={false}
            />
          ) : (
            <motion.div
              key="placeholder"
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-950">
                <Camera className="h-6 w-6 text-neutral-400" />
              </div>
              <p className="text-sm font-medium text-neutral-400">
                {hasName ? `${draft.petName}'s photo goes here` : 'The photo lands here'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top-left: the ribbon every genuinely new pet gets in Discover. */}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          <div className="flex items-center gap-1 rounded-full bg-brand px-3 py-1 text-xs font-bold text-white shadow-lg shadow-brand/40">
            <Sparkles className="h-3 w-3" />
            New here!
          </div>
        </div>

        {/* Top-right: gender, only once a pet is actually being described. */}
        <AnimatePresence>
          {hasName && (
            <motion.span
              {...rise}
              transition={riseTransition}
              aria-hidden
              className="absolute right-3 top-3"
            >
              <GenderBadge gender={draft.gender} size="xl" decorative className="shadow-lg" />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Bottom: identity block. Mirrors SwipeCard's layout exactly. */}
        <div
          className={`absolute inset-x-0 bottom-0 p-5 pt-20 ${
            hasPhoto ? 'bg-gradient-to-t from-black/95 via-black/60 to-transparent' : ''
          }`}
        >
          <div className="mb-1 flex items-baseline gap-1.5">
            <h3 className={`font-display text-2xl font-bold ${hasName ? 'text-white' : 'text-neutral-400'}`}>
              {hasName ? draft.petName : 'Name'}
            </h3>
            <AnimatePresence>
              {draft.ownerVerified && (
                <motion.span {...rise} transition={riseTransition} className="flex">
                  <BadgeCheck className="h-5 w-5 flex-shrink-0 text-sky-400" aria-label="Verified owner" />
                </motion.span>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {draft.ageMonths ? (
                <motion.span {...rise} transition={riseTransition} className="text-lg text-neutral-300">
                  {formatAge(draft.ageMonths)}
                </motion.span>
              ) : null}
            </AnimatePresence>
          </div>

          <p className={`mb-2 text-sm ${draft.breed ? 'text-neutral-300' : 'text-neutral-400'}`}>
            {draft.breed || `${speciesEmoji(draft.species)} Breed`}
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {draft.locality ? `Near ${draft.locality}` : '1.2 km away'}
            </span>
            <AnimatePresence>
              {draft.ownerName && (
                <motion.span {...rise} transition={riseTransition} className="flex items-center gap-1.5">
                  {draft.ownerPhotoUrl ? (
                    <img src={draft.ownerPhotoUrl} alt="" width={16} height={16} decoding="async" className="h-4 w-4 rounded-full object-cover" />
                  ) : null}
                  Owned by {draft.ownerName}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
