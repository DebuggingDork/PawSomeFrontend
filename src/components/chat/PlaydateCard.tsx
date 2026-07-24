import { motion } from 'framer-motion'
import { Calendar, MapPin, X, Check, Ban, Clock, CheckCircle2, XCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Playdate } from '@/lib/api/types'

function parts(iso: string) {
  const d = new Date(iso)
  return {
    month: d.toLocaleString(undefined, { month: 'short' }).toUpperCase(),
    day: d.getDate(),
    when: d.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
  }
}

const STATUS: Record<Playdate['status'], { label: string; pill: string; bar: string; icon: LucideIcon }> = {
  pending: { label: 'Awaiting response', pill: 'bg-amber-400/15 text-amber-400', bar: 'bg-amber-400', icon: Clock },
  accepted: { label: 'Confirmed', pill: 'bg-emerald-400/15 text-emerald-400', bar: 'bg-emerald-400', icon: CheckCircle2 },
  declined: { label: 'Declined', pill: 'bg-red-400/15 text-red-400', bar: 'bg-red-400/70', icon: XCircle },
  cancelled: { label: 'Cancelled', pill: 'bg-neutral-700/50 text-neutral-400', bar: 'bg-neutral-600', icon: Ban },
}

interface PlaydateCardProps {
  playdate: Playdate
  yourPetId: string
  onAccept: () => void
  onDecline: () => void
  onCancel: () => void
  responding: boolean
}

export function PlaydateCard({ playdate, yourPetId, onAccept, onDecline, onCancel, responding }: PlaydateCardProps) {
  const isProposer = playdate.proposed_by_pet.id === yourPetId
  const canCancel =
    isProposer &&
    (playdate.status === 'pending' || playdate.status === 'accepted') &&
    new Date(playdate.scheduled_at) > new Date()
  const s = STATUS[playdate.status]
  const StatusIcon = s.icon
  const when = parts(playdate.scheduled_at)
  const dimmed = playdate.status === 'declined' || playdate.status === 'cancelled'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950/60 ${dimmed ? 'opacity-70' : ''}`}
    >
      {/* Status accent bar */}
      <span className={`absolute inset-y-0 left-0 w-1 ${s.bar}`} />

      <div className="flex gap-3 p-3 pl-4">
        {/* Calendar tile */}
        <div className="flex h-14 w-14 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-gradient-to-br from-[#ff6b35] to-pink-500 text-white shadow-md shadow-[#ff6b35]/20">
          <span className="text-[10px] font-bold uppercase leading-none opacity-90">{when.month}</span>
          <span className="text-xl font-extrabold leading-none">{when.day}</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between gap-2">
            <p className="flex items-center gap-1.5 text-sm font-medium text-white">
              <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-[#ff6b35]" />
              {when.when}
            </p>
            <span className={`flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${s.pill}`}>
              <StatusIcon className="h-3 w-3" />
              {s.label}
            </span>
          </div>

          <p className="flex items-center gap-1.5 text-xs text-neutral-400">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{playdate.location_name}</span>
          </p>

          {playdate.note && <p className="mt-1 text-xs italic text-neutral-500">"{playdate.note}"</p>}

          <p className="mt-1.5 text-[11px] text-neutral-600">Proposed by {isProposer ? 'you' : playdate.proposed_by_pet.name}</p>

          {playdate.is_mine_to_respond && (
            <div className="mt-2 flex gap-2">
              <button
                onClick={onAccept}
                disabled={responding}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-[#ff6b35] to-pink-500 px-3 py-1.5 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" /> Accept
              </button>
              <button
                onClick={onDecline}
                disabled={responding}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-400 transition-colors hover:text-white disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" /> Decline
              </button>
            </div>
          )}

          {canCancel && (
            <button
              onClick={onCancel}
              disabled={responding}
              className="mt-2 flex items-center gap-1 text-xs font-medium text-neutral-500 transition-colors hover:text-red-400 disabled:opacity-50"
            >
              <Ban className="h-3.5 w-3.5" /> Cancel playdate
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
