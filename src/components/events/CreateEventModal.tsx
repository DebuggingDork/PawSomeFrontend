import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { X, PartyPopper, Check } from 'lucide-react'
import { createEvent } from '@/lib/api/events'
import { LocationPicker } from '@/components/ui/LocationPicker'

const SPECIES_OPTIONS = [
  { value: '', label: 'All species welcome' },
  { value: 'dog', label: 'Dogs' },
  { value: 'cat', label: 'Cats' },
  { value: 'rabbit', label: 'Rabbits' },
  { value: 'bird', label: 'Birds' },
  { value: 'other', label: 'Other' },
]

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="my-8 w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-white">
            <PartyPopper className="h-4 w-4 text-[#ff6b35]" /> New meetup
          </h2>
          <button onClick={onClose} aria-label="Close" className="text-neutral-500 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

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
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:border-[#ff6b35] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">When</label>
              <input
                type="datetime-local"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
                required
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2.5 text-sm text-white focus:border-[#ff6b35] focus:outline-none"
              />
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
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:border-[#ff6b35] focus:outline-none"
              />
            </div>

            <LocationPicker latitude={lat} longitude={lng} onChange={(newLat, newLng) => { setLat(newLat); setLng(newLng) }} />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">Who's welcome</label>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2.5 text-sm text-white focus:border-[#ff6b35] focus:outline-none"
              >
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
                className="w-full resize-none rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:border-[#ff6b35] focus:outline-none"
              />
            </div>

            {mutation.isError && <p className="text-sm text-red-400">Could not create that event — try again.</p>}

            <button
              type="submit"
              disabled={!canSubmit || mutation.isPending}
              className="w-full rounded-xl bg-gradient-to-r from-[#ff6b35] to-pink-500 py-2.5 text-sm font-semibold text-white transition-colors hover:shadow-lg hover:shadow-[#ff6b35]/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {mutation.isPending ? 'Posting…' : 'Post meetup'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}
