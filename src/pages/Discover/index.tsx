import { useState } from 'react'
import { Link } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Heart, MapPinOff } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useDiscoverStore } from '@/store/useDiscoverStore'
import { ApiError } from '@/lib/api/client'
import {
  browsePets,
  swipe as swipeApi,
  undoSwipe,
  getNotifications,
  acceptLike,
  rejectLike,
  getSuperWoofStatus,
} from '@/lib/api/matches'
import { SwipeDeck } from '@/components/discover/SwipeDeck'
import { LikesReceivedList } from '@/components/discover/LikesReceivedList'
import { BrowseFiltersPanel } from '@/components/discover/BrowseFiltersPanel'
import { PetAvatar } from '@/components/chat/PetAvatar'
import { EmptyState } from '@/components/ui/EmptyState'
import { PillTabs } from '@/components/ui/PillTabs'
import { Skeleton } from '@/components/ui/Skeleton'
import type { BrowseCandidate, BrowsePetsResponse, Pet } from '@/lib/api/types'

function LocationNeededPrompt() {
  return (
    <EmptyState
      icon={MapPinOff}
      title="Set your location to see nearby pets"
      description="Discover uses distance to find matches close to you."
      action={
        <Link
          to="/profile"
          className="rounded-full border border-neutral-800 px-5 py-2 text-sm font-semibold text-white hover:border-[#ff6b35]"
        >
          Update location
        </Link>
      }
    />
  )
}

/** Which of your pets is doing the swiping.
 *
 * The deck only ever contains pets of the same species as this one, so with
 * more than one pet there has to be a way to change it — `activePet` was fixed
 * at pets[0] for the whole session because nothing in the UI ever set it, which
 * left owners of a dog and a cat permanently unable to reach half the app. */
function SwipingAsSelector({
  pets,
  activePet,
  onSelect,
}: {
  pets: Pet[]
  activePet: Pet | null
  onSelect: (pet: Pet) => void
}) {
  const selectable = pets.filter((p) => p.is_active)
  if (selectable.length < 2) return null

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <span className="flex-shrink-0 text-xs font-medium text-neutral-500">Swiping as</span>
      {selectable.map((pet) => {
        const isActive = pet.id === activePet?.id
        return (
          <button
            key={pet.id}
            type="button"
            onClick={() => onSelect(pet)}
            aria-pressed={isActive}
            className={`flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-3 text-sm font-medium transition-colors ${
              isActive
                ? 'border-[#ff6b35] bg-[#ff6b35]/10 text-white'
                : 'border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
            }`}
          >
            <PetAvatar name={pet.name} photoUrl={pet.primary_photo_url} size="sm" />
            {pet.name}
          </button>
        )
      })}
    </div>
  )
}

function DiscoverPage() {
  const activePet = useAuthStore((s) => s.activePet)
  const myPets = useAuthStore((s) => s.pets)
  const setActivePet = useAuthStore((s) => s.setActivePet)
  const queryClient = useQueryClient()
  // Tab and filters live in the Discover store rather than local state: this page
  // unmounts on every navigation, and resetting them meant a trip to Community and
  // back dropped you on the default tab with the default radius, looking at the
  // deck from the top again.
  const tab = useDiscoverStore((s) => s.tab)
  const setTab = useDiscoverStore((s) => s.setTab)
  const filters = useDiscoverStore((s) => s.filters)
  const setFilters = useDiscoverStore((s) => s.setFilters)
  const [deck, setDeck] = useState<BrowseCandidate[]>([])
  const [lastSwipe, setLastSwipe] = useState<{ swipeId: string; candidate: BrowseCandidate } | null>(null)
  const [respondingId, setRespondingId] = useState<string | null>(null)

  const browseQuery = useQuery({
    queryKey: ['browse', activePet?.id, filters],
    queryFn: () => browsePets(activePet?.id, filters), // pet_id is now optional
    enabled: true, // Always enabled, no pet required for simple browsing
    retry: false,
  })

  // Seed the locally-mutable deck once per distinct (pet, filters) combo — keyed
  // explicitly rather than by data reference, so a background refetch (e.g. after
  // an unrelated mutation invalidates the 'browse' query) never silently wipes
  // out the swipes the user has already made against the currently-loaded deck.
  // Tracked in state (not a ref) and compared during render — React's documented
  // pattern for "adjust state when an input changes" — since mutating a ref while
  // rendering isn't safe under concurrent rendering.
  const browseKey = JSON.stringify([activePet?.id, filters])
  const [seededKey, setSeededKey] = useState<string | null>(null)
  if (browseQuery.data && seededKey !== browseKey) {
    setSeededKey(browseKey)
    setDeck(browseQuery.data.candidates)
  }

  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications(false, 100),
    enabled: !!activePet && tab === 'likes',
  })
  const likes = (notificationsQuery.data ?? [])
    .filter((n) => n.notification_type === 'new_like' && !n.is_read)
    .sort((a, b) => Number(b.is_super) - Number(a.is_super))

  const superWoofQuery = useQuery({
    queryKey: ['super-woof-remaining'],
    queryFn: getSuperWoofStatus,
    enabled: !!activePet,
    staleTime: 30_000,
  })

  const swipeMutation = useMutation({
    mutationFn: swipeApi,
    onSuccess: (result, variables) => {
      if (variables.action === 'super_like') {
        queryClient.invalidateQueries({ queryKey: ['super-woof-remaining'] })
      }
      // Swiping is the single richest source of badges (first swipe, fifty
      // swipes, a Super Woof, and any match that results). Re-reading lets the
      // server award them and the watcher celebrate without waiting for a poll.
      queryClient.invalidateQueries({ queryKey: ['achievements', 'me'] })

      // A mutual like matches on the spot, which means a new conversation
      // exists — drop the cached match/chat lists so it's there when the user
      // follows the celebration into the chat.
      if (result.is_match) {
        queryClient.invalidateQueries({ queryKey: ['matches'] })
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
      }
    },
  })

  const undoMutation = useMutation({
    mutationFn: undoSwipe,
    onSuccess: () => {
      if (lastSwipe) setDeck((prev) => [lastSwipe.candidate, ...prev])
      setLastSwipe(null)
      queryClient.invalidateQueries({ queryKey: ['browse'] })
    },
  })

  const acceptMutation = useMutation({
    mutationFn: acceptLike,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    onSettled: () => setRespondingId(null),
  })
  const rejectMutation = useMutation({
    mutationFn: rejectLike,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    onSettled: () => setRespondingId(null),
  })

  // Keep the underlying 'browse' query cache in sync with every swipe, not just
  // the local `deck` state. Without this, the cache still holds the pre-swipe
  // candidate list; if the component ever remounts (e.g. the user leaves
  // Discover and comes back), `seededKey` resets and reseeds `deck` straight
  // from that stale cache — resurfacing pets already swiped away in this
  // session. Patching the cache here means a reseed always reflects reality.
  const browseQueryKey = ['browse', activePet?.id, filters] as const
  const patchBrowseCache = (updater: (candidates: BrowseCandidate[]) => BrowseCandidate[]) => {
    queryClient.setQueryData<BrowsePetsResponse>(browseQueryKey, (old) =>
      old ? { ...old, candidates: updater(old.candidates) } : old,
    )
  }

  const handleSwipe = (candidate: BrowseCandidate, action: 'like' | 'skip' | 'super_like') => {
    if (!activePet) {
      // If no active pet, just show a message or redirect to onboarding
      return
    }

    setDeck((prev) => prev.filter((c) => c.pet.id !== candidate.pet.id))
    patchBrowseCache((candidates) => candidates.filter((c) => c.pet.id !== candidate.pet.id))
    swipeMutation.mutate(
      { pet_id: activePet!.id, target_pet_id: candidate.pet.id, action },
      {
        onSuccess: (result) => setLastSwipe({ swipeId: result.id, candidate }),
        onError: (error) => {
          // Only put the card back when the swipe could plausibly succeed on a
          // retry. A 400 means this pair is permanently un-swipeable (wrong
          // species, already swiped), and restoring it to the *front* of the
          // deck is what turned those into an unbreakable loop: the same
          // handful of cards came back on every attempt and nothing else could
          // be reached behind them.
          if (error instanceof ApiError && error.status === 400) return
          setDeck((prev) => [candidate, ...prev])
          patchBrowseCache((candidates) => [candidate, ...candidates])
        },
      },
    )
  }

  // Remove the "no pet" requirement for browsing
  // if (!activePet) return <NoPetPrompt />

  // Set when the server rejects a swipe because the address isn't confirmed. Read
  // from the rejection rather than from user.is_verified so the banner reflects
  // what the API will actually allow, including when enforcement is switched off.
  const needsVerification =
    swipeMutation.error instanceof ApiError &&
    swipeMutation.error.status === 403 &&
    swipeMutation.error.detail === 'EMAIL_VERIFICATION_REQUIRED'

  const locationError =
    browseQuery.error instanceof ApiError && browseQuery.error.status === 400 ? browseQuery.error : null

  // Every other way a swipe can be refused. These were swallowed entirely, so a
  // rejected like was indistinguishable from a card that simply came back.
  const swipeError =
    !needsVerification && swipeMutation.error instanceof ApiError && typeof swipeMutation.error.detail === 'string'
      ? swipeMutation.error.detail
      : null

  return (
    /* A viewport-height column rather than a growing page: the deck takes
       whatever is left after the header and controls, so the swipe buttons are
       always visible. Before this they sat below a fixed-height card and users
       had to scroll to discover that skip, Super Woof and like even existed. */
    <div className="mx-auto flex h-[calc(100dvh-4.5rem)] max-w-2xl flex-col px-6 pb-3 pt-16 md:pt-20">
      <div className="mb-2 flex flex-shrink-0 items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-white">Discover</h1>
        <PillTabs
          layoutId="discover-tab-pill"
          active={tab}
          onChange={setTab}
          tabs={[
            { key: 'discover', label: 'Discover' },
            { key: 'likes', label: 'Likes you', badge: likes.length },
          ]}
        />
      </div>

      {tab === 'discover' && (
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Both controls share one row — two stacked full-width bars cost
              enough height on a laptop to push the deck's buttons off screen. */}
          <div className="mb-3 flex flex-shrink-0 items-center gap-3">
            <SwipingAsSelector pets={myPets} activePet={activePet} onSelect={setActivePet} />
            <div className="ml-auto flex-shrink-0">
              <BrowseFiltersPanel filters={filters} onChange={setFilters} />
            </div>
          </div>

          {locationError && <LocationNeededPrompt />}

          {/* Skeleton mirrors the real card's geometry so the deck doesn't
              visibly jump size when the first card replaces it. */}
          {!locationError && browseQuery.isLoading && (
            <div
              className="mx-auto max-h-full"
              style={{ aspectRatio: '4 / 5', width: 'min(100%, 32rem)' }}
            >
              <Skeleton className="h-full w-full rounded-[1.75rem]" />
            </div>
          )}

          {!locationError && !browseQuery.isLoading && deck.length === 0 && (
            <EmptyState
              icon={Heart}
              title={
                activePet
                  ? `No more ${activePet.species === 'cat' ? 'cats' : 'dogs'} for ${activePet.name} right now`
                  : 'No pets available right now'
              }
              // The deck only holds pets of the active pet's species, so an
              // empty one usually means "you've seen them all as this pet",
              // not "the app is broken" — and with another pet there may well
              // be a full deck one click away.
              description={
                activePet && myPets.filter((p) => p.is_active).length > 1
                  ? 'You’ve seen everyone here. Switch pets above, widen the radius, or check back later.'
                  : 'You’ve seen everyone nearby. Try adjusting your filters or check back later.'
              }
            />
          )}

          {!locationError && deck.length > 0 && (
            <div className="flex min-h-0 flex-1 flex-col">
              {/* Verification is checked first: an unverified user with a pet would
                  otherwise see no banner at all and have every swipe silently
                  rejected by the server. */}
              {needsVerification ? (
                <div className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-center text-sm text-amber-400">
                  <Link to="/onboarding" className="underline hover:text-amber-300">
                    Verify your email
                  </Link>{' '}
                  to start swiping and matching.
                </div>
              ) : (
                !activePet && (
                  <div className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-center text-sm text-amber-400">
                    <Link to="/onboarding" className="underline hover:text-amber-300">
                      Create a pet profile
                    </Link>{' '}
                    to start swiping and matching.
                  </div>
                )
              )}
              {swipeError && (
                <div className="mb-4 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-center text-sm text-rose-400">
                  {swipeError}
                </div>
              )}
              <div className="min-h-0 flex-1">
                <SwipeDeck
                  candidates={deck}
                  deckKey={browseKey}
                  onSwipe={handleSwipe}
                  onUndo={() => lastSwipe && activePet && undoMutation.mutate(lastSwipe.swipeId)}
                  canUndo={!!lastSwipe && !!activePet}
                  undoing={undoMutation.isPending}
                  superWoofRemaining={superWoofQuery.data?.remaining}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'likes' && (
        <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto">
        <LikesReceivedList
          likes={likes}
          isLoading={notificationsQuery.isLoading}
          respondingId={respondingId}
          onAccept={(id) => {
            setRespondingId(id)
            acceptMutation.mutate(id)
          }}
          onReject={(id) => {
            setRespondingId(id)
            rejectMutation.mutate(id)
          }}
        />
        </div>
      )}
    </div>
  )
}

export default DiscoverPage
