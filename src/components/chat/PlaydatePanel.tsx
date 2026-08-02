import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { X, Plus, CalendarHeart, CalendarDays } from 'lucide-react'
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
  'w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm text-white placeholder:text-neutral-600 transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30'

/** `datetime-local` wants "YYYY-MM-DDTHH:mm" in *local* time, but toISOString
 * emits UTC — hence shifting by the offset before slicing. */
function toDateTimeLocal(d: Date): string {
  const shifted = new Date(d)
  shifted.setMinutes(shifted.getMinutes() - shifted.getTimezoneOffset())
  return shifted.toISOString().slice(0, 16)
}

function at(daysAhead: number, hour: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + daysAhead)
  d.setHours(hour, 0, 0, 0)
  return d
}

/** Next Saturday, or the one after if today is already Saturday. */
function nextSaturday(hour: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7))
  d.setHours(hour, 0, 0, 0)
  return d
}

/** Most playdates get arranged for one of a handful of obvious slots, so offer
 * those directly rather than making everyone drive the date picker. Anything
 * already in the past is filtered out at render. */
const QUICK_SLOTS: { label: string; get: () => Date }[] = [
  { label: 'This evening', get: () => at(0, 18) },
  { label: 'Tomorrow morning', get: () => at(1, 9) },
  { label: 'Tomorrow evening', get: () => at(1, 18) },
  { label: 'Saturday morning', get: () => nextSaturday(10) },
]

const WHEN_FORMAT = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
})

function defaultDateTimeLocal(): string {
  return toDateTimeLocal(at(1, 18))
}

export function PlaydatePanel({ matchId, yourPetId, otherPetName, onClose }: PlaydatePanelProps) {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [respondingId, setRespondingId] = useState<string | null>(null)

  const [when, setWhen] = useState(defaultDateTimeLocal())
  // Read the clock once, when the panel opens, rather than on every render:
  // rendering shouldn't produce different output depending on when React
  // happens to re-run it. Also means the quick slots stay put while you're
  // filling the form instead of disappearing as a boundary passes.
  const [openedAt] = useState(() => Date.now())
  const [minDateTime] = useState(() => toDateTimeLocal(new Date()))
  const [quickSlots] = useState(() =>
    QUICK_SLOTS.map((slot) => ({ label: slot.label, date: slot.get() }))
      // A slot that's already gone isn't a shortcut, it's a dead end.
      .filter((slot) => slot.date.getTime() > Date.now())
      .map((slot) => ({ label: slot.label, value: toDateTimeLocal(slot.date) })),
  )
  const [locationName, setLocationName] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [address, setAddress] = useState('')
  const [pincode, setPincode] = useState('')
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
        address: address.trim() || undefined,
        pincode: pincode.trim() || undefined,
        note: note.trim() || undefined,
      }),
    onSuccess: () => {
      invalidate()
      setShowForm(false)
      setLocationName('')
      setLat(null)
      setLng(null)
      setAddress('')
      setPincode('')
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

  // `when` is free text until it parses — an empty or half-typed date shouldn't
  // render "Invalid Date" under the field.
  const parsed = when ? new Date(when) : null
  const whenDate = parsed && !Number.isNaN(parsed.getTime()) ? parsed : null
  const isSoon = whenDate !== null && whenDate.getTime() - openedAt < 24 * 60 * 60 * 1000
  const playdates = playdatesQuery.data?.items ?? []

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="thin-scrollbar lenis-prevent-scroll flex-shrink-0 max-h-80 overflow-y-auto border-b border-neutral-800/80 bg-gradient-to-b from-brand/5 to-transparent p-3"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-pink-500 text-white shadow shadow-brand/30">
            <CalendarHeart className="h-4 w-4" />
          </span>
          Playdates with {otherPetName}
        </h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-brand to-pink-500 px-2.5 py-1 text-xs font-semibold text-white shadow-sm shadow-brand/30 transition-transform hoverable:hover:-translate-y-0.5"
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
          <div>
            <span className="mb-1.5 block text-xs font-medium text-neutral-500">When</span>

            <div className="mb-2 flex flex-wrap gap-1.5">
              {quickSlots.map((slot) => (
                <button
                  key={slot.label}
                  type="button"
                  onClick={() => setWhen(slot.value)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                    slot.value === when
                      ? 'border-brand bg-brand/15 text-brand'
                      : 'border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                type="datetime-local"
                value={when}
                min={minDateTime}
                onChange={(e) => setWhen(e.target.value)}
                className={`${FIELD} datetime-field pl-9`}
              />
            </div>

            {whenDate && (
              <p className="mt-1.5 text-xs text-neutral-500">
                {WHEN_FORMAT.format(whenDate)}
                {isSoon && <span className="ml-1.5 text-brand">· within 24 hours</span>}
              </p>
            )}
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-neutral-500">Where (name)</span>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="KBR Park walking track"
              className={FIELD}
            />
          </label>

          <LocationPicker
            latitude={lat}
            longitude={lng}
            address={address}
            onChange={({ lat: newLat, lng: newLng, address: newAddress, pincode: newPincode }) => {
              setLat(newLat)
              setLng(newLng)
              if (newAddress !== undefined) setAddress(newAddress)
              if (newPincode !== undefined) setPincode(newPincode)
            }}
          />

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-500">Pincode</span>
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              maxLength={20}
              placeholder="Auto-filled from location"
              className={FIELD}
            />
          </label>

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
            className="w-full rounded-lg bg-gradient-to-r from-brand to-pink-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-brand/30 disabled:cursor-not-allowed disabled:opacity-40"
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
