import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  BadgeCheck,
  Check,
  GraduationCap,
  Heart,
  LogIn,
  MessageCircle,
  PawPrint,
  Scissors,
  ShieldCheck,
  X,
} from 'lucide-react'
import { getPet } from '@/lib/api/pets'
import { getPetRelationship, swipe as swipeApi } from '@/lib/api/matches'
import { ApiError } from '@/lib/api/client'
import { useAuthStore } from '@/store/useAuthStore'
import { Skeleton } from '@/components/ui/Skeleton'
import { PetAvatar } from '@/components/chat/PetAvatar'
import { speciesEmoji, speciesLabel } from '@/lib/species'
import { genderMark } from '@/lib/petBadges'
import { formatAge } from '@/lib/formatAge'
import { GenderBadge } from '@/components/ui/GenderBadge'

interface PetCardDialogProps {
  petId: string
  onClose: () => void
}

/** Click-to-expand detail view for a Community card — same data as the full
 * pet page, shown inline so browsing the directory doesn't mean leaving it. */
export function PetCardDialog({ petId, onClose }: PetCardDialogProps) {
  const { isAuthenticated, user, pets, activePet } = useAuthStore()
  const [activePhoto, setActivePhoto] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: pet, isLoading } = useQuery({
    queryKey: ['pet', petId],
    queryFn: () => getPet(petId),
  })

  // Whether the caller has already liked, skipped or matched this pet. Without
  // it the dialog offered "Interested" on pets it was already impossible to
  // swipe on, and the resulting 400 looked like a dead button.
  const { data: relationship } = useQuery({
    queryKey: ['pet-relationship', petId],
    queryFn: () => getPetRelationship(petId),
    enabled: isAuthenticated,
  })

  // Pets can only match within their own species, so the pet doing the liking
  // has to be chosen against the *target*, not just taken from the global
  // "active pet". Picking pets[0] blindly is why showing interest in a cat
  // silently failed for anyone whose first pet is a dog: the server rejected
  // dog→cat with a 400 that nothing surfaced, so no like, no notification and
  // no match were ever created.
  const eligiblePets = pets.filter((p) => p.is_active && p.species === pet?.species)
  const swipingPet =
    eligiblePets.find((p) => p.id === activePet?.id) ?? eligiblePets[0] ?? null

  const likeMutation = useMutation({
    mutationFn: () => swipeApi({ pet_id: swipingPet!.id, target_pet_id: pet!.id, action: 'like' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pet-relationship', petId] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
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
  // Three sources because each covers a gap in the others: `user_id` is only
  // returned on the owner's view of a pet, `owner.id` only for signed-in
  // requests, and the relationship call is authoritative but arrives a beat
  // later. Getting this wrong offers you the Interested button on your own pet.
  const isOwnPet = Boolean(
    (pet && user && (pet.user_id === user.id || pet.owner?.id === user.id)) ||
      relationship?.status === 'own',
  )

  const speciesWord = pet?.species === 'cat' ? 'cat' : 'dog'
  const likeError =
    likeMutation.error instanceof ApiError && typeof likeMutation.error.detail === 'string'
      ? likeMutation.error.detail === 'EMAIL_VERIFICATION_REQUIRED'
        ? 'Confirm your email address before showing interest.'
        : likeMutation.error.detail
      : likeMutation.error
        ? 'Could not send that just now. Try again.'
        : null

  /** The one action this dialog offers, in whichever state it's actually in.
   * Every branch either does something or says why it can't — the previous
   * version rendered a single disabled button with a tooltip for all of them. */
  const renderInterest = () => {
    if (isOwnPet || !pet) return null

    if (!isAuthenticated) {
      return (
        <Link
          to="/auth"
          onClick={onClose}
          className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-[#ff6b35] to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#ff6b35]/30 transition-transform hover:-translate-y-0.5"
        >
          <LogIn className="h-4 w-4" />
          Sign in to show interest
        </Link>
      )
    }

    if (relationship?.status === 'matched' && relationship.match_id) {
      return (
        <Link
          to={`/chat?match=${relationship.match_id}`}
          onClick={onClose}
          className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-emerald-700 bg-emerald-950/50 px-4 py-2 text-sm font-semibold text-emerald-300 transition-colors hover:bg-emerald-900/50"
        >
          <MessageCircle className="h-4 w-4" />
          Matched — open chat
        </Link>
      )
    }

    if (likeMutation.isSuccess || relationship?.status === 'liked') {
      return (
        <span className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-[#ff6b35]/50 bg-[#ff6b35]/10 px-4 py-2 text-sm font-semibold text-[#ff6b35]">
          <Check className="h-4 w-4" />
          Interest sent
        </span>
      )
    }

    if (relationship?.status === 'skipped') {
      return (
        <span
          title={`You already passed on ${pet.name} in Discover.`}
          className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-500"
        >
          Passed
        </span>
      )
    }

    return (
      <button
        type="button"
        onClick={() => likeMutation.mutate()}
        disabled={!swipingPet || likeMutation.isPending}
        className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-[#ff6b35] to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#ff6b35]/30 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
      >
        <Heart className="h-4 w-4" />
        {likeMutation.isPending ? 'Sending…' : 'Interested'}
      </button>
    )
  }

  /** Says out loud which pet the like comes from, or why none can be used —
   * both of which the button alone can't communicate. */
  const renderInterestNote = () => {
    if (isOwnPet || !pet || !isAuthenticated) return null
    if (relationship?.status === 'matched') return null

    if (likeError) {
      return <p className="mt-3 text-xs text-rose-400">{likeError}</p>
    }

    if (!swipingPet) {
      const note =
        pets.length === 0
          ? `Add a ${speciesWord} profile to show interest in ${pet.name}.`
          : pets.some((p) => p.species === pet.species)
            ? `Your ${speciesWord} profile needs a photo before it can show interest.`
            : `${pet.name} is a ${speciesWord} — you need a ${speciesWord} profile to show interest.`
      return <p className="mt-3 text-xs text-neutral-500">{note}</p>
    }

    if (likeMutation.isSuccess) {
      return (
        <p className="mt-3 text-xs text-neutral-500">
          {pet.name}&rsquo;s owner has been notified. You&rsquo;ll match once they accept.
        </p>
      )
    }

    if (relationship?.status === 'liked') {
      return (
        <p className="mt-3 text-xs text-neutral-500">
          Waiting on {pet.name}&rsquo;s owner to accept.
        </p>
      )
    }

    return (
      <p className="mt-3 text-xs text-neutral-500">
        Sent as <span className="text-neutral-300">{swipingPet.name}</span>
        {eligiblePets.length > 1 ? ' — switch pets from your profile.' : '.'}
      </p>
    )
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="thin-scrollbar lenis-prevent-scroll max-h-[88vh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-3xl border border-white/10 bg-neutral-900 shadow-2xl"
      >
        <div className="relative aspect-square w-full bg-neutral-800 sm:aspect-[4/3]">
          {isLoading && <Skeleton className="absolute inset-0 rounded-none" />}
          {!isLoading && heroPhoto && (
            <img src={heroPhoto} alt={pet?.name} className="h-full w-full object-cover" />
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
                <img src={photo.url} alt="" className="h-full w-full object-cover" />
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

                {isOwnPet ? (
                  <span className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-[#ff6b35]/40 bg-[#ff6b35]/10 px-4 py-2 text-sm font-semibold text-[#ff6b35]">
                    <PawPrint className="h-4 w-4" />
                    My pet
                  </span>
                ) : (
                  renderInterest()
                )}
              </div>

              {isOwnPet ? (
                <p className="mt-3 text-xs text-neutral-500">
                  This is your own pet — other owners see the Interested button here.
                </p>
              ) : (
                renderInterestNote()
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
