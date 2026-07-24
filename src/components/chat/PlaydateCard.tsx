import { Calendar, MapPin, X, Check, Ban } from 'lucide-react'
import type { Playdate } from '@/lib/api/types'

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const STATUS_STYLE: Record<Playdate['status'], string> = {
  pending: 'bg-amber-400/15 text-amber-400',
  accepted: 'bg-emerald-400/15 text-emerald-400',
  declined: 'bg-red-400/15 text-red-400',
  cancelled: 'bg-neutral-700/50 text-neutral-400',
}

const STATUS_LABEL: Record<Playdate['status'], string> = {
  pending: 'Awaiting response',
  accepted: 'Confirmed',
  declined: 'Declined',
  cancelled: 'Cancelled',
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
    isProposer && (playdate.status === 'pending' || playdate.status === 'accepted') && new Date(playdate.scheduled_at) > new Date()

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <Calendar className="h-4 w-4 flex-shrink-0 text-[#ff6b35]" />
          {formatWhen(playdate.scheduled_at)}
        </div>
        <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLE[playdate.status]}`}>
          {STATUS_LABEL[playdate.status]}
        </span>
      </div>

      <p className="mb-1 flex items-center gap-1.5 text-xs text-neutral-400">
        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
        {playdate.location_name}
      </p>

      {playdate.note && <p className="mb-2 text-xs text-neutral-500">"{playdate.note}"</p>}

      <p className="mb-2 text-[11px] text-neutral-600">
        Proposed by {isProposer ? 'you' : playdate.proposed_by_pet.name}
      </p>

      {playdate.is_mine_to_respond && (
        <div className="flex gap-2">
          <button
            onClick={onAccept}
            disabled={responding}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-[#ff6b35] to-pink-500 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" /> Accept
          </button>
          <button
            onClick={onDecline}
            disabled={responding}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-400 disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" /> Decline
          </button>
        </div>
      )}

      {canCancel && (
        <button
          onClick={onCancel}
          disabled={responding}
          className="flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-red-400 disabled:opacity-50"
        >
          <Ban className="h-3.5 w-3.5" /> Cancel playdate
        </button>
      )}
    </div>
  )
}
