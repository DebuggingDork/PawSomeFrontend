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
import { EmptyState } from '@/components/ui/EmptyState'
import { PillTabs } from '@/components/ui/PillTabs'
import { Skeleton } from '@/components/ui/Skeleton'
import type { BrowseCandidate, BrowsePetsResponse } from '@/lib/api/types'

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

function DiscoverPage() {
  const { activePet } = useAuthStore()
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
    onSuccess: (_result, variables) => {
      if (variables.action === 'super_like') {
        queryClient.invalidateQueries({ queryKey: ['super-woof-remaining'] })
      }
      // Swiping is the single richest source of badges (first swipe, fifty
      // swipes, a Super Woof, and any match that results). Re-reading lets the
      // server award them and the watcher celebrate without waiting for a poll.
      queryClient.invalidateQueries({ queryKey: ['achievements', 'me'] })
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
        onError: () => {
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

  return (
    <div className="mx-auto max-w-2xl px-6 pb-16 pt-24 md:pt-28">
      <div className="mb-6 flex items-center justify-between">
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
        <>
          <BrowseFiltersPanel filters={filters} onChange={setFilters} />

          {locationError && <LocationNeededPrompt />}

          {!locationError && browseQuery.isLoading && (
            <Skeleton className="mx-auto h-96 w-full max-w-sm" />
          )}

          {!locationError && !browseQuery.isLoading && deck.length === 0 && (
            <EmptyState
              icon={Heart}
              title="No pets available right now"
              description="Try adjusting your filters or check back later."
            />
          )}

          {!locationError && deck.length > 0 && (
            <>
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
              <SwipeDeck
                candidates={deck}
                deckKey={browseKey}
                onSwipe={handleSwipe}
                onUndo={() => lastSwipe && activePet && undoMutation.mutate(lastSwipe.swipeId)}
                canUndo={!!lastSwipe && !!activePet}
                undoing={undoMutation.isPending}
                superWoofRemaining={superWoofQuery.data?.remaining}
              />
            </>
          )}
        </>
      )}

      {tab === 'likes' && (
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
      )}
    </div>
  )
}

export default DiscoverPage
