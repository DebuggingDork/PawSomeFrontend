import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ArrowRight } from 'lucide-react'
import { updateMyProfile } from '@/lib/api/users'
import { LocationPicker } from '@/components/ui/LocationPicker'

interface Props {
  initialFullName: string
  initialOccupation: string
  initialLat: number | null
  initialLng: number | null
  onSaved: () => void
}

export function ProfileBasicsStep({ initialFullName, initialOccupation, initialLat, initialLng, onSaved }: Props) {
  const [fullName, setFullName] = useState(initialFullName)
  const [occupation, setOccupation] = useState(initialOccupation)
  const [lat, setLat] = useState<number | null>(initialLat)
  const [lng, setLng] = useState<number | null>(initialLng)

  const mutation = useMutation({
    mutationFn: () =>
      updateMyProfile({
        full_name: fullName.trim(),
        occupation: occupation.trim(),
        ...(lat !== null && lng !== null ? { latitude: lat, longitude: lng } : {}),
      }),
    onSuccess: onSaved,
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        mutation.mutate()
      }}
      className="space-y-4"
    >
      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-300">Your name</label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Jordan Rivera"
          required
          className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:border-[#ff6b35] focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-300">Occupation</label>
        <input
          value={occupation}
          onChange={(e) => setOccupation(e.target.value)}
          placeholder="Veterinarian, designer, student…"
          required
          className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:border-[#ff6b35] focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-300">
          Your location <span className="font-normal text-neutral-500">(recommended — powers nearby matches)</span>
        </label>
        <LocationPicker latitude={lat} longitude={lng} onChange={(nlat, nlng) => { setLat(nlat); setLng(nlng) }} />
      </div>

      {mutation.isError && <p className="text-sm text-red-400">Couldn't save that — try again.</p>}

      <button
        type="submit"
        disabled={mutation.isPending || !fullName.trim() || !occupation.trim()}
        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff6b35] to-pink-500 py-3 font-semibold text-white shadow-lg shadow-[#ff6b35]/30 transition-shadow hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
      >
        {mutation.isPending ? 'Saving…' : 'Continue'}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </button>
    </form>
  )
}
