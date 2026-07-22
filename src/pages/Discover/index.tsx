import { useState } from 'react'
import { Link } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Heart, MapPinOff, PawPrint, SlidersHorizontal } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { ApiError } from '@/lib/api/client'
import { browsePets, swipe as swipeApi, undoSwipe, getNotifications, acceptLike, rejectLike } from '@/lib/api/matches'
import { SwipeDeck } from '@/components/discover/SwipeDeck'
import { LikesReceivedList } from '@/components/discover/LikesReceivedList'
import type { BrowseCandidate, BrowseFilters } from '@/lib/api/types'

type Tab = 'discover' | 'likes'

function NoPetPrompt() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff6b35] to-pink-500 shadow-lg shadow-[#ff6b35]/30">
        <PawPrint className="h-7 w-7 text-white" />
      </div>
      <h2 className="mb-2 font-display text-2xl font-bold text-white">Add a pet to start discovering</h2>
      <p className="mb-6 max-w-sm text-neutral-400">
        You'll need a pet profile with at least one photo before you can browse and swipe.
      </p>
      <Link
        to="/onboarding"
        className="rounded-full bg-gradient-to-r from-[#ff6b35] to-pink-500 px-6 py-3 font-semibold text-white shadow-lg shadow-[#ff6b35]/30 transition-transform hover:-translate-y-0.5"
      >
        Create pet profile
      </Link>
    </div>
  )
}

function LocationNeededPrompt() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center text-neutral-500">
      <MapPinOff className="mb-3 h-10 w-10" />
      <p className="mb-1 font-medium text-neutral-300">Set your location to see nearby pets</p>
      <p className="mb-5 text-sm">Discover uses distance to find matches close to you.</p>
      <Link
        to="/profile"
        className="rounded-full border border-neutral-800 px-5 py-2 text-sm font-semibold text-white hover:border-[#ff6b35]"
      >
        Update location
      </Link>
    </div>
  )
}

function DiscoverPage() {
  const { activePet } = useAuthStore()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<Tab>('discover')
  const [filters, setFilters] = useState<BrowseFilters>({ radius: 50 })
  const [deck, setDeck] = useState<BrowseCandidate[]>([])
  const [loadedCandidates, setLoadedCandidates] = useState<BrowseCandidate[] | null>(null)
  const [lastSwipe, setLastSwipe] = useState<{ swipeId: string; candidate: BrowseCandidate } | null>(null)
  const [respondingId, setRespondingId] = useState<string | null>(null)

  const browseQuery = useQuery({
    queryKey: ['browse', activePet?.id, filters],
    queryFn: () => browsePets(activePet!.id, filters),
    enabled: !!activePet,
    retry: false,
  })

  // Seed the locally-mutable deck from the query result exactly once per fetch
  // (React's documented "adjust state during render" escape hatch, not an effect).
  if (browseQuery.data && browseQuery.data.candidates !== loadedCandidates) {
    setLoadedCandidates(browseQuery.data.candidates)
    setDeck(browseQuery.data.candidates)
  }

  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications(false, 100),
    enabled: !!activePet && tab === 'likes',
  })
  const likes = (notificationsQuery.data ?? []).filter((n) => n.notification_type === 'new_like' && !n.is_read)

  const swipeMutation = useMutation({ mutationFn: swipeApi })

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

  const handleSwipe = (candidate: BrowseCandidate, action: 'like' | 'skip') => {
    setDeck((prev) => prev.filter((c) => c.pet.id !== candidate.pet.id))
    swipeMutation.mutate(
      { pet_id: activePet!.id, target_pet_id: candidate.pet.id, action },
      {
        onSuccess: (result) => setLastSwipe({ swipeId: result.id, candidate }),
        onError: () => setDeck((prev) => [candidate, ...prev]),
      },
    )
  }

  if (!activePet) return <NoPetPrompt />

  const locationError =
    browseQuery.error instanceof ApiError && browseQuery.error.status === 400 ? browseQuery.error : null

  return (
    <div className="mx-auto max-w-2xl px-6 pb-16 pt-24 md:pt-28">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-white">Discover</h1>
        <div className="flex rounded-full bg-neutral-900 p-1 text-sm font-semibold">
          {(['discover', 'likes'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 transition-colors ${
                tab === t ? 'bg-gradient-to-r from-[#ff6b35] to-pink-500 text-white' : 'text-neutral-400'
              }`}
            >
              {t === 'discover' ? 'Discover' : 'Likes you'}
              {t === 'likes' && likes.length > 0 && (
                <span className="ml-1.5 rounded-full bg-white/20 px-1.5 text-xs">{likes.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {tab === 'discover' && (
        <>
          <div className="mb-4 flex items-center justify-end gap-2 text-xs text-neutral-500">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <label className="flex items-center gap-2">
              Radius
              <input
                type="range"
                min={5}
                max={500}
                step={5}
                value={filters.radius}
                onChange={(e) => setFilters((f) => ({ ...f, radius: Number(e.target.value) }))}
                className="accent-[#ff6b35]"
              />
              <span className="w-14 text-neutral-400">{filters.radius} km</span>
            </label>
          </div>

          {locationError && <LocationNeededPrompt />}

          {!locationError && browseQuery.isLoading && (
            <div className="flex h-96 items-center justify-center text-neutral-500">Finding pets nearby…</div>
          )}

          {!locationError && !browseQuery.isLoading && deck.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center text-neutral-500">
              <Heart className="mb-3 h-10 w-10" />
              <p className="font-medium text-neutral-300">No pets nearby right now</p>
              <p className="text-sm">Try widening your search radius.</p>
            </div>
          )}

          {!locationError && deck.length > 0 && (
            <SwipeDeck
              candidates={deck}
              onSwipe={handleSwipe}
              onUndo={() => lastSwipe && undoMutation.mutate(lastSwipe.swipeId)}
              canUndo={!!lastSwipe}
              undoing={undoMutation.isPending}
            />
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
