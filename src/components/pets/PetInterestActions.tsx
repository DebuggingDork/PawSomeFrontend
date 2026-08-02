import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bookmark, BookmarkCheck, Check, Heart, LogIn, MessageCircle, RotateCcw } from 'lucide-react'
import { getPetRelationship, swipe as swipeApi, unskipPet } from '@/lib/api/matches'
import { addFavorite, removeFavorite } from '@/lib/api/favorites'
import { ApiError } from '@/lib/api/client'
import { useAuthStore } from '@/store/useAuthStore'
import { PetAvatar } from '@/components/chat/PetAvatar'
import type { Pet, PetRelationshipEntry } from '@/lib/api/types'

interface PetInterestActionsProps {
  pet: Pet
  /** Called after a like or a save, so the host can refresh its own lists. */
  onChanged?: () => void
  /** Closes the host dialog when a link navigates away. */
  onNavigate?: () => void
}

function speciesWord(species: string) {
  return species === 'cat' ? 'cat' : 'dog'
}

/**
 * Everything you can do *to another pet*: show interest, or save it for later.
 *
 * Both actions are taken by one of your pets, not by your account, so this owns
 * the choice of which pet is acting. The two call sites (the Community card
 * dialog and the full pet profile) each had their own copy of this and both
 * chose the pet implicitly — `activePet`, which is just pets[0] and was never
 * settable. An owner of a dog and a cat had no way to say who was interested,
 * and a dog→cat swipe is refused by the server, so the button did nothing at
 * all and no notification ever reached the other owner.
 */
export function PetInterestActions({ pet, onChanged, onNavigate }: PetInterestActionsProps) {
  const { isAuthenticated, user, pets } = useAuthStore()
  const queryClient = useQueryClient()
  const [chosenPetId, setChosenPetId] = useState<string | null>(null)

  const relationshipKey = ['pet-relationship', pet.id]
  const { data: relationship, isLoading } = useQuery({
    queryKey: relationshipKey,
    queryFn: () => getPetRelationship(pet.id),
    enabled: isAuthenticated,
  })

  const isOwnPet =
    (user && (pet.user_id === user.id || pet.owner?.id === user.id)) || relationship?.status === 'own'

  // Only pets that can actually act: right species (the server refuses anything
  // else) and active (an unphotographed draft is rejected too).
  const candidates = useMemo(
    () => (relationship?.pets ?? []).filter((p) => p.is_active),
    [relationship],
  )

  const matched = candidates.find((p) => p.status === 'matched')
  const selected: PetRelationshipEntry | null =
    candidates.find((p) => p.pet_id === chosenPetId) ??
    candidates.find((p) => p.status === 'none') ??
    candidates[0] ??
    null

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: relationshipKey })
    onChanged?.()
  }

  const likeMutation = useMutation({
    mutationFn: () => swipeApi({ pet_id: selected!.pet_id, target_pet_id: pet.id, action: 'like' }),
    onSuccess: () => {
      refresh()
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['matches'] })
      queryClient.invalidateQueries({ queryKey: ['pets', 'browse'] })
    },
  })

  // Undoing a pass from here is the only way back into the deck for a pet you
  // scrolled past — the five-minute swipe undo is long gone by the time anyone
  // goes looking for them.
  const unskipMutation = useMutation({
    mutationFn: () => unskipPet(pet.id, selected!.pet_id),
    onSuccess: () => {
      refresh()
      queryClient.invalidateQueries({ queryKey: ['browse'] })
    },
  })

  const favoriteMutation = useMutation<void, unknown, void>({
    mutationFn: async () => {
      if (selected!.is_favorite && selected!.favorite_id) {
        await removeFavorite(selected!.favorite_id)
        return
      }
      await addFavorite(selected!.pet_id, pet.id)
    },
    onSuccess: () => {
      refresh()
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })

  const errorFrom = (error: unknown) => {
    if (error instanceof ApiError && typeof error.detail === 'string') {
      return error.detail === 'EMAIL_VERIFICATION_REQUIRED'
        ? 'Confirm your email address first.'
        : error.detail
    }
    return error ? 'Could not do that just now. Try again.' : null
  }
  const actionError =
    errorFrom(likeMutation.error) ?? errorFrom(favoriteMutation.error) ?? errorFrom(unskipMutation.error)

  if (isOwnPet) {
    return (
      <div className="rounded-xl border border-brand/30 bg-brand/5 p-3 text-sm text-neutral-300">
        <span className="font-semibold text-brand">This is your pet.</span> Other owners see
        Interested and Save buttons here.
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Link
        to="/auth"
        onClick={onNavigate}
        className="flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-brand to-pink-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-transform hoverable:hover:-translate-y-0.5"
      >
        <LogIn className="h-4 w-4" />
        Sign in to show interest
      </Link>
    )
  }

  if (isLoading) {
    return <div className="h-11 animate-pulse rounded-xl bg-neutral-800/60" />
  }

  // Already matched — the conversation is the only thing left to offer.
  if (matched?.match_id) {
    return (
      <div className="space-y-2">
        <Link
          to={`/chat?match=${matched.match_id}`}
          onClick={onNavigate}
          className="flex items-center justify-center gap-1.5 rounded-full border border-emerald-700 bg-emerald-950/50 px-4 py-2.5 text-sm font-semibold text-emerald-300 transition-colors hover:bg-emerald-900/50"
        >
          <MessageCircle className="h-4 w-4" />
          Matched — open chat
        </Link>
        <p className="text-center text-xs text-neutral-500">
          {matched.name} and {pet.name} are matched.
        </p>
      </div>
    )
  }

  if (candidates.length === 0) {
    const word = speciesWord(pet.species)
    const hasSameSpecies = pets.some((p) => p.species === pet.species)
    return (
      <p className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-3 text-xs text-neutral-400">
        {pets.length === 0
          ? `Add a ${word} profile to show interest in ${pet.name}.`
          : hasSameSpecies
            ? `Your ${word} profile needs a photo before it can show interest.`
            : `${pet.name} is a ${word} — you need a ${word} profile to show interest.`}
      </p>
    )
  }

  const alreadyLiked = selected?.status === 'liked'
  const alreadySkipped = selected?.status === 'skipped'
  const justLiked = likeMutation.isSuccess

  return (
    <div className="space-y-3">
      {/* Who is acting. Shown whenever there's a real choice to make — with one
          eligible pet the answer is never in doubt and a picker is just noise. */}
      {candidates.length > 1 && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-neutral-500">Acting as</p>
          <div className="flex flex-wrap gap-2">
            {candidates.map((candidate) => {
              const isSelected = candidate.pet_id === selected?.pet_id
              return (
                <button
                  key={candidate.pet_id}
                  type="button"
                  onClick={() => setChosenPetId(candidate.pet_id)}
                  aria-pressed={isSelected}
                  className={`flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-3 text-sm font-medium transition-colors ${
                    isSelected
                      ? 'border-brand bg-brand/10 text-white'
                      : 'border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
                  }`}
                >
                  <PetAvatar name={candidate.name} photoUrl={candidate.primary_photo_url} size="sm" />
                  {candidate.name}
                  {candidate.status === 'liked' && (
                    <Check className="h-3.5 w-3.5 text-brand" aria-label="already interested" />
                  )}
                  {candidate.is_favorite && (
                    <BookmarkCheck className="h-3.5 w-3.5 text-sky-400" aria-label="saved" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {justLiked || alreadyLiked ? (
          <span className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-brand/50 bg-brand/10 px-4 py-2.5 text-sm font-semibold text-brand">
            <Check className="h-4 w-4" />
            Interest sent
          </span>
        ) : alreadySkipped ? (
          <button
            type="button"
            onClick={() => unskipMutation.mutate()}
            disabled={unskipMutation.isPending}
            title={`Put ${pet.name} back in ${selected?.name}'s deck`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-neutral-700 px-4 py-2.5 text-sm font-medium text-neutral-400 transition-colors hover:border-neutral-500 hover:text-white disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" />
            {unskipMutation.isPending ? 'Undoing…' : 'Passed — undo'}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => likeMutation.mutate()}
            disabled={!selected || likeMutation.isPending}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-brand to-pink-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-transform hoverable:enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Heart className="h-4 w-4" />
            {likeMutation.isPending ? 'Sending…' : 'Interested'}
          </button>
        )}

        <button
          type="button"
          onClick={() => favoriteMutation.mutate()}
          disabled={!selected || favoriteMutation.isPending}
          aria-pressed={!!selected?.is_favorite}
          title={selected?.is_favorite ? `Remove from ${selected.name}'s saved list` : `Save for ${selected?.name} to decide later`}
          className={`flex items-center justify-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${
            selected?.is_favorite
              ? 'border-sky-500/50 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20'
              : 'border-neutral-800 text-neutral-300 hover:border-neutral-600 hover:text-white'
          }`}
        >
          {selected?.is_favorite ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          {selected?.is_favorite ? 'Saved' : 'Save'}
        </button>
      </div>

      {actionError ? (
        <p className="text-xs text-rose-400">{actionError}</p>
      ) : (
        <p className="text-xs text-neutral-500">
          {justLiked
            ? `${pet.name}'s owner has been notified. You'll match once they accept.`
            : alreadySkipped
              ? `${selected?.name} passed on ${pet.name}. Undo to put them back in the deck.`
              : alreadyLiked
              ? `Waiting on ${pet.name}'s owner to accept ${selected?.name}'s interest.`
              : selected?.is_favorite
                ? `Saved to ${selected.name}'s list — only you can see it.`
                : 'Interested notifies the owner. Save just bookmarks them for you.'}
        </p>
      )}
    </div>
  )
}

/** Convenience for hosts that only need to know whether to hide their own UI. */
export type { PetInterestActionsProps }
export type { Pet }
