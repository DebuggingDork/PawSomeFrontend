import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  BadgeCheck,
  GraduationCap,
  LogIn,
  PawPrint,
  Scissors,
  ShieldCheck,
  X,
} from 'lucide-react'
import { getPet } from '@/lib/api/pets'
import { useAuthStore } from '@/store/useAuthStore'
import { Skeleton } from '@/components/ui/Skeleton'
import { PetAvatar } from '@/components/chat/PetAvatar'
import { PetInterestActions } from '@/components/pets/PetInterestActions'
import { speciesEmoji, speciesLabel } from '@/lib/species'
import { genderMark } from '@/lib/petBadges'
import { formatAge } from '@/lib/formatAge'
import { GenderBadge } from '@/components/ui/GenderBadge'

interface PetCardDialogProps {
  petId: string
  onClose: () => void
  /** Discover already has its own Pass/Super Woof/Like buttons driving the
   * swipe deck — showing PetInterestActions' own Interested/Save buttons here
   * too would be a second, disconnected way to like the same pet that doesn't
   * update the card stack underneath. Community has no such buttons, so it
   * keeps the full actions block. */
  hideActions?: boolean
}

/** Click-to-expand detail view for a pet card — same data as the full pet
 * page, shown inline so browsing the directory or the swipe deck doesn't mean
 * leaving it. Shared by Community and Discover (a card's single swipe photo
 * is never the whole story — this is where the rest of the gallery lives). */
export function PetCardDialog({ petId, onClose, hideActions = false }: PetCardDialogProps) {
  const user = useAuthStore((s) => s.user)
  const [activePhoto, setActivePhoto] = useState<string | null>(null)

  const { data: pet, isLoading } = useQuery({
    queryKey: ['pet', petId],
    queryFn: () => getPet(petId),
  })

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const photos = pet?.photos ?? []
  const heroPhoto = activePhoto ?? pet?.primary_photo_url ?? null
  const isOwnPet = Boolean(pet && user && (pet.user_id === user.id || pet.owner?.id === user.id))

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        // `dvh`, not `vh`. On a phone `vh` is measured against the viewport with
        // the browser chrome retracted, so 88vh is taller than what you can
        // actually see whenever the address bar is showing — the last few rows
        // of the card sat under it.
        className="thin-scrollbar lenis-prevent-scroll max-h-[92dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-3xl border border-white/10 bg-neutral-900 pb-[env(safe-area-inset-bottom)] shadow-2xl sm:max-h-[88dvh] sm:rounded-3xl sm:pb-0"
      >
        <div className="relative aspect-square w-full bg-neutral-800 sm:aspect-[4/3]">
          {isLoading && <Skeleton className="absolute inset-0 rounded-none" />}
          {!isLoading && heroPhoto && (
            <img src={heroPhoto} alt={pet?.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
          )}
          {!isLoading && !heroPhoto && (
            <div className="flex h-full items-center justify-center">
              <PawPrint className="h-16 w-16 text-neutral-700" />
            </div>
          )}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
          >
            <X className="h-4.5 w-4.5" />
          </button>
          {pet && (
            /* A pill, not a 36px circle. Two glyphs never fitted side by side in
               a fixed w-9, so they wrapped onto a second line and spilled out of
               the rounded box. Auto width plus nowrap keeps them on one line
               however wide the emoji renders on a given platform. */
            <span className="absolute left-3 top-3 inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full bg-black/60 py-0 pl-3 pr-1.5 text-base leading-none text-white backdrop-blur-sm">
              <span aria-hidden="true">{speciesEmoji(pet.species)}</span>
              <GenderBadge gender={pet.gender} size="lg" decorative />
              <span className="sr-only">
                {speciesLabel(pet.species)}, {genderMark(pet.gender).label}
              </span>
            </span>
          )}
        </div>

        {photos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto border-b border-white/5 p-3">
            {photos.map((photo) => (
              <button
                key={photo.id}
                onClick={() => setActivePhoto(photo.url)}
                className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                  heroPhoto === photo.url ? 'border-[#ff6b35]' : 'border-transparent hover:border-neutral-600'
                }`}
              >
                <img src={photo.url} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="p-6">
          {isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-7 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-16 w-full" />
            </div>
          )}

          {!isLoading && pet && (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="font-display text-2xl font-bold text-white">{pet.name}</h2>
                    {pet.owner?.is_verified && (
                      <BadgeCheck className="h-5 w-5 text-sky-400" aria-label="Verified owner" />
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-neutral-400">
                    {pet.breed} • {formatAge(pet.age_months)}
                  </p>
                </div>

                {isOwnPet && (
                  <span className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-[#ff6b35]/40 bg-[#ff6b35]/10 px-4 py-2 text-sm font-semibold text-[#ff6b35]">
                    <PawPrint className="h-4 w-4" />
                    My pet
                  </span>
                )}
              </div>

              {!hideActions && (
                <div className="mt-4">
                  <PetInterestActions pet={pet} onNavigate={onClose} />
                </div>
              )}

              {(pet.is_vaccinated || pet.is_neutered || pet.is_trained) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {pet.is_vaccinated && (
                    <span className="flex items-center gap-1.5 rounded-full border border-emerald-800 bg-emerald-950/40 px-3 py-1 text-xs font-medium text-emerald-400">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Vaccinated
                    </span>
                  )}
                  {pet.is_neutered && (
                    <span className="flex items-center gap-1.5 rounded-full border border-sky-800 bg-sky-950/40 px-3 py-1 text-xs font-medium text-sky-400">
                      <Scissors className="h-3.5 w-3.5" />
                      Neutered/Spayed
                    </span>
                  )}
                  {pet.is_trained && (
                    <span className="flex items-center gap-1.5 rounded-full border border-violet-800 bg-violet-950/40 px-3 py-1 text-xs font-medium text-violet-400">
                      <GraduationCap className="h-3.5 w-3.5" />
                      Trained
                    </span>
                  )}
                </div>
              )}

              {pet.bio && <p className="mt-4 whitespace-pre-line text-sm text-neutral-300">{pet.bio}</p>}

              {pet.owner ? (
                <div className="mt-5 flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950/40 p-3.5">
                  <PetAvatar name={pet.owner.full_name ?? 'Unknown'} photoUrl={pet.owner.profile_photo_url} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs uppercase tracking-wide text-neutral-500">Owner</p>
                    <p className="truncate text-sm font-semibold text-white">{pet.owner.full_name ?? 'Anonymous'}</p>
                  </div>
                </div>
              ) : (
                <Link
                  to="/auth"
                  onClick={onClose}
                  className="mt-5 flex items-center gap-3 rounded-xl border border-dashed border-neutral-700 p-3.5 text-neutral-400 transition-colors hover:border-[#ff6b35] hover:text-white"
                >
                  <LogIn className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm font-medium">Sign in to see the owner and start matching</span>
                </Link>
              )}

              <Link
                to={`/pets/${pet.id}`}
                onClick={onClose}
                className="mt-4 flex items-center justify-center gap-1.5 text-sm font-medium text-neutral-400 hover:text-white"
              >
                View full profile
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
