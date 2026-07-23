import { useState } from 'react'
import { LocationPicker } from '@/components/ui/LocationPicker'
import type { Pet, PetCreateInput } from '@/lib/api/types'

const SPECIES_OPTIONS = ['dog', 'cat', 'rabbit', 'bird', 'other'] as const

interface PetFormProps {
  initial?: Pet
  onSubmit: (values: PetCreateInput) => void
  onCancel: () => void
  submitting: boolean
  submitLabel: string
}

export function PetForm({ initial, onSubmit, onCancel, submitting, submitLabel }: PetFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [species, setSpecies] = useState<(typeof SPECIES_OPTIONS)[number]>(
    (initial?.species as (typeof SPECIES_OPTIONS)[number]) ?? 'dog',
  )
  const [breed, setBreed] = useState(initial?.breed ?? '')
  const [ageMonths, setAgeMonths] = useState(initial?.age_months ? String(initial.age_months) : '')
  const [gender, setGender] = useState<'male' | 'female'>((initial?.gender as 'male' | 'female') ?? 'male')
  const [bio, setBio] = useState(initial?.bio ?? '')
  const [lat, setLat] = useState<number | null>(initial?.lat ?? null)
  const [lng, setLng] = useState<number | null>(initial?.lng ?? null)

  const canSubmit = name.trim() && breed.trim() && Number(ageMonths) > 0 && lat !== null && lng !== null

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!canSubmit) return
        onSubmit({
          name: name.trim(),
          species,
          breed: breed.trim(),
          age_months: Number(ageMonths),
          gender,
          bio: bio.trim() || undefined,
          lat: lat as number,
          lng: lng as number,
        })
      }}
      className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950/40 p-5"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-400">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-white focus:border-[#ff6b35] focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-400">Species</label>
          <select
            value={species}
            onChange={(e) => setSpecies(e.target.value as (typeof SPECIES_OPTIONS)[number])}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-white focus:border-[#ff6b35] focus:outline-none"
          >
            {SPECIES_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s[0].toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-400">Breed</label>
          <input
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            required
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-white focus:border-[#ff6b35] focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-400">Age (months)</label>
          <input
            type="number"
            min={1}
            max={600}
            value={ageMonths}
            onChange={(e) => setAgeMonths(e.target.value)}
            required
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-white focus:border-[#ff6b35] focus:outline-none"
          />
        </div>
      </div>

      <div className="flex gap-2">
        {(['male', 'female'] as const).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGender(g)}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize ${
              gender === g ? 'border-[#ff6b35] bg-[#ff6b35]/10 text-white' : 'border-neutral-800 text-neutral-400'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-neutral-400">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={2}
          className="w-full resize-none rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-white focus:border-[#ff6b35] focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-neutral-400">Location</label>
        <LocationPicker latitude={lat} longitude={lng} onChange={(nlat, nlng) => { setLat(nlat); setLng(nlng) }} />
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={submitting || !canSubmit}
          className="flex-1 rounded-xl bg-gradient-to-r from-[#ff6b35] to-pink-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#ff6b35]/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Saving…' : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-neutral-800 px-5 py-2.5 text-sm font-medium text-neutral-400 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
