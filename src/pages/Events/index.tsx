import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, MapPin, Plus, Users } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { listEvents, rsvpToEvent, cancelRsvp } from '@/lib/api/events'
import { CreateEventModal } from '@/components/events/CreateEventModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { SignInPrompt } from '@/components/ui/SignInPrompt'
import type { CommunityEvent } from '@/lib/api/types'

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const SPECIES_EMOJI: Record<string, string> = { dog: '🐕', cat: '🐈', rabbit: '🐇', bird: '🐦', other: '🐾' }

function EventCard({ event, onToggleGoing, togglingId }: { event: CommunityEvent; onToggleGoing: (event: CommunityEvent) => void; togglingId: string | null }) {
  const { isAuthenticated } = useAuthStore()
  const isGoing = event.your_rsvp_status === 'going'

  return (
    <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/50 p-5 backdrop-blur">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-white">{event.title}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-400">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatWhen(event.event_time)}
          </p>
        </div>
        {event.species && (
          <span className="flex-shrink-0 rounded-full bg-black/40 px-2.5 py-1 text-xs text-white">
            {SPECIES_EMOJI[event.species] ?? '🐾'} {event.species}
          </span>
        )}
      </div>

      <p className="mb-3 flex items-center gap-1.5 text-sm text-neutral-400">
        <MapPin className="h-3.5 w-3.5" />
        {event.location_name}
      </p>

      {event.description && <p className="mb-4 text-sm text-neutral-300">{event.description}</p>}

      <div className="flex items-center justify-between border-t border-neutral-800 pt-3">
        <p className="flex items-center gap-1.5 text-xs text-neutral-500">
          <Users className="h-3.5 w-3.5" />
          {event.attendee_count} going · organized by {event.creator.full_name ?? 'a PawSome owner'}
        </p>

        {isAuthenticated && (
          <button
            onClick={() => onToggleGoing(event)}
            disabled={togglingId === event.id}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
              isGoing
                ? 'border border-neutral-700 text-neutral-300 hover:border-red-400 hover:text-red-400'
                : 'bg-gradient-to-r from-[#ff6b35] to-pink-500 text-white'
            }`}
          >
            {isGoing ? "I'm going ✓" : "I'm going"}
          </button>
        )}
      </div>
    </div>
  )
}

function EventsPage() {
  const { isAuthenticated, isHydrating } = useAuthStore()
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [species, setSpecies] = useState<string>('')

  const eventsQuery = useQuery({
    queryKey: ['events', species],
    queryFn: () => listEvents({ species: species || undefined, upcoming_only: true, limit: 50 }),
  })

  const rsvpMutation = useMutation({
    mutationFn: (eventId: string) => rsvpToEvent(eventId, { status: 'going' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
    onSettled: () => setTogglingId(null),
  })

  const cancelMutation = useMutation({
    mutationFn: (eventId: string) => cancelRsvp(eventId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
    onSettled: () => setTogglingId(null),
  })

  const handleToggleGoing = (event: CommunityEvent) => {
    setTogglingId(event.id)
    if (event.your_rsvp_status === 'going') cancelMutation.mutate(event.id)
    else rsvpMutation.mutate(event.id)
  }

  if (!isHydrating && !isAuthenticated) {
    return (
      <SignInPrompt
        title="Sign in to see local meetups"
        message="Community events — dog park hangouts, adoption drives, and more — live here once you're signed in."
      />
    )
  }

  const events = eventsQuery.data?.items ?? []

  return (
    <div className="mx-auto max-w-3xl px-6 pb-16 pt-24 md:pt-28">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Events</h1>
          <p className="mt-1 text-neutral-400">Local meetups other owners have posted — RSVP and go say hi.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff6b35] to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#ff6b35]/30 transition-all hover:shadow-xl"
        >
          <Plus className="h-4 w-4" /> Post a meetup
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {['', 'dog', 'cat', 'rabbit', 'bird', 'other'].map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setSpecies(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              species === s ? 'bg-[#ff6b35] text-white' : 'bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
          >
            {s ? `${SPECIES_EMOJI[s]} ${s}` : 'All'}
          </button>
        ))}
      </div>

      {eventsQuery.isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      )}

      {!eventsQuery.isLoading && events.length === 0 && (
        <EmptyState
          icon={CalendarDays}
          title="No upcoming meetups"
          description="Be the first to post one — dog park hangout, adoption drive, anything goes."
          action={
            <button
              onClick={() => setShowCreate(true)}
              className="rounded-full border border-neutral-800 px-5 py-2 text-sm font-semibold text-white hover:border-[#ff6b35]"
            >
              Post a meetup
            </button>
          }
        />
      )}

      {!eventsQuery.isLoading && events.length > 0 && (
        <div className="space-y-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} onToggleGoing={handleToggleGoing} togglingId={togglingId} />
          ))}
        </div>
      )}

      {showCreate && <CreateEventModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}

export default EventsPage
