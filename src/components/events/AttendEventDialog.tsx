import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, PawPrint, X } from 'lucide-react'
import { PetAvatar } from '@/components/chat/PetAvatar'
import type { CommunityEvent } from '@/lib/api/types'

const SPECIES: Record<string, { emoji: string; plural: string; ring: string; glow: string }> = {
  dog: { emoji: '🐕', plural: 'Dogs', ring: 'from-amber-400 to-orange-500', glow: 'shadow-amber-500/30' },
  cat: { emoji: '🐈', plural: 'Cats', ring: 'from-violet-400 to-fuchsia-500', glow: 'shadow-violet-500/30' },
  rabbit: { emoji: '🐇', plural: 'Rabbits', ring: 'from-pink-400 to-rose-500', glow: 'shadow-pink-500/30' },
  bird: { emoji: '🐦', plural: 'Birds', ring: 'from-sky-400 to-cyan-500', glow: 'shadow-sky-500/30' },
}

interface AttendEventDialogProps {
  event: CommunityEvent
  isSubmitting: boolean
  error: string | null
  onConfirm: (petId: string | null) => void
  onClose: () => void
}

/**
 * The step between "I'm going" and actually being on the list.
 *
 * A species-restricted meetup is easy to RSVP to without noticing the
 * restriction — the badge on the card is small and the button is the obvious
 * thing to press. This makes the restriction the largest thing on screen at the
 * moment it matters, and asks which pet is coming, which is the question the
 * restriction is really about. Deliberately celebratory rather than a warning:
 * nothing has gone wrong, the user just needs to see what they're joining.
 */
export function AttendEventDialog({ event, isSubmitting, error, onConfirm, onClose }: AttendEventDialogProps) {
  const species = event.species ? (SPECIES[event.species] ?? null) : null
  const pets = event.eligible_pets
  const [petId, setPetId] = useState<string | null>(pets[0]?.id ?? null)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`Attend ${event.title}`}
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        // Bottom sheet on a phone, centred card from `sm`. Capped in `dvh` and
        // scrollable: with several eligible pets and an error line this runs
        // taller than a short screen, and an uncapped centred panel inside a
        // flex overlay puts its top edge at an offset no scroll can reach —
        // "Yes, we're in" was off the bottom with no way down to it.
        // `relative` also matters: without it the close button resolved against
        // the full-screen overlay and sat in the corner of the screen rather
        // than the corner of the dialog.
        className="thin-scrollbar lenis-prevent-scroll relative max-h-[92dvh] w-full overflow-y-auto overscroll-contain rounded-t-3xl border border-white/10 bg-neutral-900 pb-[env(safe-area-inset-bottom)] shadow-2xl sm:max-h-[88dvh] sm:max-w-sm sm:rounded-3xl sm:pb-0"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-6 top-6 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/80"
        >
          <X className="h-4 w-4" />
        </button>

        {/* The restriction, at the size it deserves. */}
        <div className="relative flex flex-col items-center px-6 pb-5 pt-9 text-center">
          {species ? (
            <>
              <motion.div
                initial={{ scale: 0.5, rotate: -12 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', duration: 0.6, bounce: 0.45 }}
                className={`flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${species.ring} text-5xl shadow-xl ${species.glow}`}
              >
                <span aria-hidden="true">{species.emoji}</span>
              </motion.div>
              <h2 className="mt-4 font-display text-2xl font-bold text-white">
                {species.plural} only
              </h2>
              <p className="mt-1.5 text-sm text-neutral-400">
                <span className="font-medium text-neutral-200">{event.title}</span> is a{' '}
                {event.species}s-only meetup. Only your {event.species}
                {pets.length === 1 ? '' : 's'} can come along.
              </p>
            </>
          ) : (
            <>
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.6, bounce: 0.45 }}
                className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-brand to-pink-500 text-5xl shadow-xl shadow-brand/30"
              >
                <span aria-hidden="true">🐾</span>
              </motion.div>
              <h2 className="mt-4 font-display text-2xl font-bold text-white">All pets welcome</h2>
              <p className="mt-1.5 text-sm text-neutral-400">
                Joining <span className="font-medium text-neutral-200">{event.title}</span>.
              </p>
            </>
          )}
        </div>

        {/* Which pet is coming — the question the restriction is really about. */}
        {pets.length > 0 && (
          <div className="border-t border-neutral-800 px-6 py-4">
            <p className="mb-2.5 text-xs font-medium text-neutral-400">
              {pets.length === 1 ? 'Bringing' : "Who's coming?"}
            </p>
            <div className="flex flex-wrap gap-2">
              {pets.map((pet) => {
                const selected = pet.id === petId
                return (
                  <button
                    key={pet.id}
                    type="button"
                    onClick={() => setPetId(pet.id)}
                    aria-pressed={selected}
                    className={`flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-sm font-medium transition-colors ${
                      selected
                        ? 'border-brand bg-brand/10 text-white'
                        : 'border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-white'
                    }`}
                  >
                    <PetAvatar name={pet.name} photoUrl={pet.primary_photo_url} size="sm" />
                    {pet.name}
                    {selected && <Check className="h-3.5 w-3.5 text-brand" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {error && (
          <p className="border-t border-neutral-800 px-6 py-3 text-sm text-rose-400">{error}</p>
        )}

        <div className="flex gap-2 border-t border-neutral-800 p-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-neutral-800 px-4 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:border-neutral-600 hover:text-white"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={() => onConfirm(petId)}
            disabled={isSubmitting}
            className="flex flex-[1.4] items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-brand to-pink-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-transform hoverable:enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PawPrint className="h-4 w-4" />
            {isSubmitting ? 'Confirming…' : "Yes, we're in"}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
