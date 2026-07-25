import { motion } from 'framer-motion'
import { MapPin, Users, Check } from 'lucide-react'
import { gradientForId } from '@/lib/gradients'
import { useAuthStore } from '@/store/useAuthStore'
import type { CommunityEvent } from '@/lib/api/types'

const SPECIES_EMOJI: Record<string, string> = { dog: '🐕', cat: '🐈', rabbit: '🐇', bird: '🐦', other: '🐾' }

function parts(iso: string) {
  const d = new Date(iso)
  return {
    month: d.toLocaleString(undefined, { month: 'short' }).toUpperCase(),
    day: d.getDate(),
    time: d.toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' }),
  }
}

interface EventCardProps {
  event: CommunityEvent
  onToggleGoing: (event: CommunityEvent) => void
  togglingId: string | null
}

export function EventCard({ event, onToggleGoing, togglingId }: EventCardProps) {
  const { isAuthenticated } = useAuthStore()
  const g = gradientForId(event.id)
  const when = parts(event.event_time)
  const isGoing = event.your_rsvp_status === 'going'
  const emoji = event.species ? (SPECIES_EMOJI[event.species] ?? '🐾') : '🐾'

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="group overflow-hidden rounded-3xl border border-neutral-800/80 bg-neutral-900/60 backdrop-blur transition-shadow hover:border-white/15 hover:shadow-2xl hover:shadow-black/40"
    >
      {/* Cover band with a deterministic gradient + oversized glyph */}
      <div className="relative h-28 overflow-hidden" style={{ background: g.css }}>
        <span className="pointer-events-none absolute -right-3 -top-4 select-none text-[7rem] leading-none opacity-25 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
          {emoji}
        </span>
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-white/10" />

        {event.species && (
          <span className="absolute right-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-xs font-semibold capitalize text-white backdrop-blur">
            {emoji} {event.species}
          </span>
        )}

        {/* Calendar tear-off */}
        <div className="absolute -bottom-5 left-5 flex w-14 flex-col overflow-hidden rounded-xl bg-neutral-950 shadow-lg ring-1 ring-white/10">
          <div className="py-0.5 text-center text-[10px] font-extrabold tracking-wide text-white" style={{ background: g.css }}>
            {when.month}
          </div>
          <div className="py-1 text-center text-xl font-extrabold leading-none text-white">{when.day}</div>
        </div>
      </div>

      <div className="px-5 pb-5 pt-8">
        <h3 className="font-display text-lg font-bold leading-snug text-white">{event.title}</h3>
        <p className="mt-1 text-xs font-medium" style={{ color: g.accent }}>
          {when.time}
        </p>

        <p className="mt-2 flex items-center gap-1.5 text-sm text-neutral-400">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">{event.location_name}</span>
        </p>
        {event.address && <p className="ml-5 truncate text-xs text-neutral-600">{event.address}</p>}

        {event.description && <p className="mt-3 line-clamp-2 text-sm text-neutral-300">{event.description}</p>}

        <div className="mt-4 flex items-center justify-between border-t border-neutral-800 pt-3">
          <p className="flex items-center gap-1.5 text-xs text-neutral-500">
            <Users className="h-3.5 w-3.5" />
            <span className="font-semibold text-neutral-300">{event.attendee_count}</span> going
            <span className="mx-1 text-neutral-700">·</span>
            {event.creator.full_name ?? 'a PawSome owner'}
          </p>

          {isAuthenticated && (
            <button
              onClick={() => onToggleGoing(event)}
              disabled={togglingId === event.id}
              className={`flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-semibold transition-all disabled:opacity-50 ${
                isGoing
                  ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:border-red-400/50 hover:bg-red-400/10 hover:text-red-400'
                  : 'bg-gradient-to-r from-[#ff6b35] to-pink-500 text-white shadow-md shadow-[#ff6b35]/30 hover:-translate-y-0.5'
              }`}
            >
              {isGoing ? (
                <>
                  <Check className="h-3.5 w-3.5" /> Going
                </>
              ) : (
                "I'm going"
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
