import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, Plus, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { listEvents, rsvpToEvent, cancelRsvp } from '@/lib/api/events'
import { CreateEventModal } from '@/components/events/CreateEventModal'
import { AttendEventDialog } from '@/components/events/AttendEventDialog'
import { ApiError } from '@/lib/api/client'
import { EventCard } from '@/components/events/EventCard'
import { StaggerRevealContainer, StaggerRevealItem } from '@/components/animations/StaggerReveal'
import { PillTabs } from '@/components/ui/PillTabs'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { SignInPrompt } from '@/components/ui/SignInPrompt'
import type { CommunityEvent } from '@/lib/api/types'

const SPECIES_FILTERS = [
  { key: '', label: 'All' },
  { key: 'dog', label: '🐕 Dogs' },
  { key: 'cat', label: '🐈 Cats' },
  { key: 'rabbit', label: '🐇 Rabbits' },
  { key: 'bird', label: '🐦 Birds' },
  { key: 'other', label: '🐾 Other' },
] as const

function EventsPage() {
  const { isAuthenticated, isHydrating } = useAuthStore()
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [species, setSpecies] = useState<string>('')
  const [attending, setAttending] = useState<CommunityEvent | null>(null)

  const eventsQuery = useQuery({
    queryKey: ['events', species],
    queryFn: () => listEvents({ species: species || undefined, upcoming_only: true, limit: 50 }),
  })

  const rsvpMutation = useMutation({
    mutationFn: ({ eventId, petId }: { eventId: string; petId: string | null }) =>
      rsvpToEvent(eventId, { status: 'going', pet_id: petId ?? undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      setAttending(null)
    },
    onSettled: () => setTogglingId(null),
  })

  const cancelMutation = useMutation({
    mutationFn: (eventId: string) => cancelRsvp(eventId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
    onSettled: () => setTogglingId(null),
  })

  // Joining goes through a confirmation step rather than firing on the click.
  // A species-restricted meetup is easy to RSVP to without registering the
  // restriction, and this is also where you say which pet is coming — a
  // question the card has no room to ask.
  const handleToggleGoing = (event: CommunityEvent) => {
    if (event.your_rsvp_status === 'going') {
      setTogglingId(event.id)
      cancelMutation.mutate(event.id)
      return
    }
    rsvpMutation.reset()
    setAttending(event)
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
    <div className="relative mx-auto max-w-4xl px-4 sm:px-6 pb-20 pt-24 md:pt-28">
      {/* Decorative floating gradient blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-16 -z-10 overflow-hidden">
        <div className="animate-float absolute -left-16 h-64 w-64 rounded-full bg-[#ff6b35]/20 blur-3xl" />
        <div className="animate-float absolute right-0 top-10 h-72 w-72 rounded-full bg-pink-500/20 blur-3xl [animation-delay:-3s]" />
        <div className="animate-float absolute left-1/3 top-0 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl [animation-delay:-1.5s]" />
      </div>

      {/* Hero */}
      <div className="mb-10">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-neutral-300 backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-[#ff6b35]" />
          Community meetups near you
        </div>
        <h1 className="font-display text-4xl font-extrabold leading-tight text-white md:text-5xl">
          Get the pack{' '}
          <span className="animate-gradient-pan bg-gradient-to-r from-[#ff6b35] via-pink-500 to-[#ff6b35] bg-[size:200%_auto] bg-clip-text text-transparent">
            together
          </span>
        </h1>
        <p className="mt-3 max-w-lg text-neutral-400">
          Post a dog-park hangout or adoption drive, RSVP to what's happening, and go make some real-world tail wags.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            onClick={() => setShowCreate(true)}
            className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff6b35] to-pink-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#ff6b35]/30 transition-all hoverable:hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#ff6b35]/40"
          >
            <Plus className="h-4 w-4 transition-transform hoverable:group-hover:rotate-90" /> Post a meetup
          </button>
          <PillTabs layoutId="events-species" active={species} onChange={setSpecies} tabs={SPECIES_FILTERS} />
        </div>
      </div>

      {eventsQuery.isLoading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-3xl" />
          ))}
        </div>
      )}

      {!eventsQuery.isLoading && events.length === 0 && (
        <EmptyState
          size="lg"
          icon={CalendarDays}
          title="No upcoming meetups"
          description="Be the first to post one — dog park hangout, adoption drive, anything goes."
          action={
            <button
              onClick={() => setShowCreate(true)}
              className="rounded-full bg-gradient-to-r from-[#ff6b35] to-pink-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#ff6b35]/30 transition-transform hoverable:hover:-translate-y-0.5"
            >
              Post a meetup
            </button>
          }
        />
      )}

      {!eventsQuery.isLoading && events.length > 0 && (
        <StaggerRevealContainer className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {events.map((event) => (
            <StaggerRevealItem key={event.id}>
              <EventCard event={event} onToggleGoing={handleToggleGoing} togglingId={togglingId} />
            </StaggerRevealItem>
          ))}
        </StaggerRevealContainer>
      )}

      {showCreate && <CreateEventModal onClose={() => setShowCreate(false)} />}

      {attending && (
        <AttendEventDialog
          event={attending}
          isSubmitting={rsvpMutation.isPending}
          error={
            rsvpMutation.error instanceof ApiError && typeof rsvpMutation.error.detail === 'string'
              ? rsvpMutation.error.detail
              : rsvpMutation.error
                ? 'Could not confirm that just now. Try again.'
                : null
          }
          onConfirm={(petId) => {
            setTogglingId(attending.id)
            rsvpMutation.mutate({ eventId: attending.id, petId })
          }}
          onClose={() => setAttending(null)}
        />
      )}
    </div>
  )
}

export default EventsPage
