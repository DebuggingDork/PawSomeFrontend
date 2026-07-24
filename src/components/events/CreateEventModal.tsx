import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { X, PartyPopper, Check } from 'lucide-react'
import { createEvent } from '@/lib/api/events'
import { gradientForId } from '@/lib/gradients'
import { LocationPicker } from '@/components/ui/LocationPicker'

const SPECIES_OPTIONS = [
  { value: '', label: 'All species welcome' },
  { value: 'dog', label: 'Dogs' },
  { value: 'cat', label: 'Cats' },
  { value: 'rabbit', label: 'Rabbits' },
  { value: 'bird', label: 'Birds' },
  { value: 'other', label: 'Other' },
]

const FIELD =
  'w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 transition-colors focus:border-[#ff6b35] focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/30'

function defaultDateTimeLocal(): string {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

interface CreateEventModalProps {
  onClose: () => void
}

export function CreateEventModal({ onClose }: CreateEventModalProps) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [locationName, setLocationName] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [when, setWhen] = useState(defaultDateTimeLocal())
  const [species, setSpecies] = useState('')

  // Live preview of the cover this event will get once created.
  const preview = gradientForId(title || 'new-meetup')

  const mutation = useMutation({
    mutationFn: () =>
      createEvent({
        title: title.trim(),
        description: description.trim() || undefined,
        location_name: locationName.trim(),
        latitude: lat as number,
        longitude: lng as number,
        event_time: new Date(when).toISOString(),
        species: species || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })

  const canSubmit = title.trim().length > 0 && locationName.trim().length > 0 && lat !== null && lng !== null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0.28, duration: 0.5 }}
        onClick={(e) => e.stopPropagation()}
        className="my-8 w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 shadow-2xl"
      >
        {/* Live gradient cover preview */}
        <div className="relative h-20" style={{ background: preview.css }}>
          <span className="absolute -right-2 -top-3 select-none text-7xl opacity-25">🎉</span>
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent" />
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white/90 backdrop-blur transition-colors hover:bg-black/50"
          >
            <X className="h-4 w-4" />
          </button>
          <h2 className="absolute bottom-3 left-5 flex items-center gap-2 font-display text-lg font-bold text-white drop-shadow">
            <PartyPopper className="h-4 w-4" /> New meetup
          </h2>
        </div>

        <div className="p-6">
          {mutation.isSuccess ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                <Check className="h-6 w-6" />
              </div>
              <p className="font-medium text-white">Your meetup is live!</p>
              <button onClick={onClose} className="mt-4 text-sm text-neutral-400 hover:text-white">
                Close
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (canSubmit) mutation.mutate()
              }}
              className="space-y-4"
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-300">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={150}
                  required
                  placeholder="Saturday dog park meetup"
                  className={FIELD}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-300">When</label>
                <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} required className={FIELD} />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-300">Where (name)</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  maxLength={255}
                  required
                  placeholder="Cubbon Park dog run"
                  className={FIELD}
                />
              </div>

              <LocationPicker
                latitude={lat}
                longitude={lng}
                onChange={(newLat, newLng) => {
                  setLat(newLat)
                  setLng(newLng)
                }}
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-300">Who's welcome</label>
                <select value={species} onChange={(e) => setSpecies(e.target.value)} className={FIELD}>
                  {SPECIES_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-300">Details (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  maxLength={2000}
                  placeholder="What to bring, what to expect..."
                  className={`${FIELD} resize-none`}
                />
              </div>

              {mutation.isError && <p className="text-sm text-red-400">Could not create that event — try again.</p>}

              <button
                type="submit"
                disabled={!canSubmit || mutation.isPending}
                className="w-full rounded-xl bg-gradient-to-r from-[#ff6b35] to-pink-500 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff6b35]/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {mutation.isPending ? 'Posting…' : 'Post meetup'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}
