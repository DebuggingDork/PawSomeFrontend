import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { X, Plus, CalendarHeart } from 'lucide-react'
import { getPlaydates, proposePlaydate, respondToPlaydate, cancelPlaydate } from '@/lib/api/matches'
import { LocationPicker } from '@/components/ui/LocationPicker'
import { PlaydateCard } from './PlaydateCard'
import { Skeleton } from '@/components/ui/Skeleton'

interface PlaydatePanelProps {
  matchId: string
  yourPetId: string
  otherPetName: string
  onClose: () => void
}

const FIELD =
  'w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-600 transition-colors focus:border-[#ff6b35] focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/30'

function defaultDateTimeLocal(): string {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000) // default: this time tomorrow
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

export function PlaydatePanel({ matchId, yourPetId, otherPetName, onClose }: PlaydatePanelProps) {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [respondingId, setRespondingId] = useState<string | null>(null)

  const [when, setWhen] = useState(defaultDateTimeLocal())
  const [locationName, setLocationName] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [note, setNote] = useState('')

  const playdatesQuery = useQuery({
    queryKey: ['playdates', matchId],
    queryFn: () => getPlaydates(matchId),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['playdates', matchId] })

  const proposeMutation = useMutation({
    mutationFn: () =>
      proposePlaydate(matchId, {
        scheduled_at: new Date(when).toISOString(),
        location_name: locationName.trim(),
        latitude: lat as number,
        longitude: lng as number,
        note: note.trim() || undefined,
      }),
    onSuccess: () => {
      invalidate()
      setShowForm(false)
      setLocationName('')
      setLat(null)
      setLng(null)
      setNote('')
    },
  })

  const respondMutation = useMutation({
    mutationFn: ({ playdateId, status }: { playdateId: string; status: 'accepted' | 'declined' }) =>
      respondToPlaydate(matchId, playdateId, status),
    onSuccess: invalidate,
    onSettled: () => setRespondingId(null),
  })

  const cancelMutation = useMutation({
    mutationFn: (playdateId: string) => cancelPlaydate(matchId, playdateId),
    onSuccess: invalidate,
    onSettled: () => setRespondingId(null),
  })

  const canSubmit = locationName.trim().length > 0 && lat !== null && lng !== null && when.length > 0
  const playdates = playdatesQuery.data?.items ?? []

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="thin-scrollbar lenis-prevent-scroll flex-shrink-0 max-h-80 overflow-y-auto border-b border-neutral-800/80 bg-gradient-to-b from-[#ff6b35]/5 to-transparent p-3"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#ff6b35] to-pink-500 text-white shadow shadow-[#ff6b35]/30">
            <CalendarHeart className="h-4 w-4" />
          </span>
          Playdates with {otherPetName}
        </h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-[#ff6b35] to-pink-500 px-2.5 py-1 text-xs font-semibold text-white shadow-sm shadow-[#ff6b35]/30 transition-transform hover:-translate-y-0.5"
          >
            <Plus className="h-3.5 w-3.5" /> Propose
          </button>
          <button type="button" onClick={onClose} aria-label="Close playdates" className="rounded-lg p-1.5 text-neutral-500 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={(e) => {
            e.preventDefault()
            if (canSubmit) proposeMutation.mutate()
          }}
          className="mb-3 space-y-3 rounded-xl border border-neutral-800 bg-neutral-950/70 p-3"
        >
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-500">When</span>
            <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className={FIELD} />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-500">Where (name)</span>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Cubbon Park dog run"
              className={FIELD}
            />
          </label>

          <LocationPicker
            latitude={lat}
            longitude={lng}
            onChange={({ lat: newLat, lng: newLng }) => {
              setLat(newLat)
              setLng(newLng)
            }}
          />

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-500">Note (optional)</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              maxLength={1000}
              placeholder="Bring water for the pups!"
              className={`${FIELD} resize-none`}
            />
          </label>

          <button
            type="submit"
            disabled={!canSubmit || proposeMutation.isPending}
            className="w-full rounded-lg bg-gradient-to-r from-[#ff6b35] to-pink-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff6b35]/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {proposeMutation.isPending ? 'Sending…' : 'Send proposal'}
          </button>
          {proposeMutation.isError && <p className="text-xs text-red-400">Could not send the proposal — try again.</p>}
        </motion.form>
      )}

      {playdatesQuery.isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-24" />
        </div>
      )}

      {!playdatesQuery.isLoading && playdates.length === 0 && !showForm && (
        <div className="flex flex-col items-center gap-1 py-6 text-center">
          <CalendarHeart className="h-8 w-8 text-neutral-700" />
          <p className="text-sm text-neutral-500">No playdates yet — propose one!</p>
        </div>
      )}

      <div className="space-y-2">
        {playdates.map((p) => (
          <PlaydateCard
            key={p.id}
            playdate={p}
            yourPetId={yourPetId}
            responding={respondingId === p.id}
            onAccept={() => {
              setRespondingId(p.id)
              respondMutation.mutate({ playdateId: p.id, status: 'accepted' })
            }}
            onDecline={() => {
              setRespondingId(p.id)
              respondMutation.mutate({ playdateId: p.id, status: 'declined' })
            }}
            onCancel={() => {
              setRespondingId(p.id)
              cancelMutation.mutate(p.id)
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}
