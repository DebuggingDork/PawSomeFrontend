import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ArrowRight } from 'lucide-react'
import { createPet } from '@/lib/api/pets'
import { LocationPicker } from '@/components/ui/LocationPicker'
import type { Pet } from '@/lib/api/types'

interface Props {
  onSaved: (pet: Pet) => void
}

const SPECIES_OPTIONS = ['dog', 'cat', 'rabbit', 'bird', 'other'] as const

export function PetProfileStep({ onSaved }: Props) {
  const [name, setName] = useState('')
  const [species, setSpecies] = useState<(typeof SPECIES_OPTIONS)[number]>('dog')
  const [breed, setBreed] = useState('')
  const [ageMonths, setAgeMonths] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [bio, setBio] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)

  const mutation = useMutation({
    mutationFn: () =>
      createPet({
        name: name.trim(),
        species,
        breed: breed.trim(),
        age_months: Number(ageMonths),
        gender,
        bio: bio.trim() || undefined,
        lat: lat ?? 0,
        lng: lng ?? 0,
      }),
    onSuccess: onSaved,
  })

  const canSubmit = name.trim() && breed.trim() && Number(ageMonths) > 0 && lat !== null && lng !== null

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        mutation.mutate()
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-300">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Bella"
            required
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:border-[#ff6b35] focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-300">Species</label>
          <select
            value={species}
            onChange={(e) => setSpecies(e.target.value as (typeof SPECIES_OPTIONS)[number])}
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2.5 text-sm text-white focus:border-[#ff6b35] focus:outline-none"
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
          <label className="mb-1.5 block text-sm font-medium text-neutral-300">Breed</label>
          <input
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            placeholder="Golden Retriever"
            required
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:border-[#ff6b35] focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-300">Age (months)</label>
          <input
            type="number"
            min={1}
            max={600}
            value={ageMonths}
            onChange={(e) => setAgeMonths(e.target.value)}
            placeholder="24"
            required
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:border-[#ff6b35] focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-300">Gender</label>
        <div className="flex gap-2">
          {(['male', 'female'] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                gender === g
                  ? 'border-[#ff6b35] bg-[#ff6b35]/10 text-white'
                  : 'border-neutral-800 bg-neutral-950/60 text-neutral-400'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-300">
          Bio <span className="font-normal text-neutral-500">(optional)</span>
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={2}
          placeholder="Playful, loves the park, great with kids…"
          className="w-full resize-none rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:border-[#ff6b35] focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-300">Pet's location</label>
        <LocationPicker latitude={lat} longitude={lng} onChange={(nlat, nlng) => { setLat(nlat); setLng(nlng) }} />
      </div>

      {mutation.isError && <p className="text-sm text-red-400">Couldn't create that pet — check the details and try again.</p>}

      <button
        type="submit"
        disabled={mutation.isPending || !canSubmit}
        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff6b35] to-pink-500 py-3 font-semibold text-white shadow-lg shadow-[#ff6b35]/30 transition-shadow hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
      >
        {mutation.isPending ? 'Creating…' : 'Create pet profile'}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </button>
    </form>
  )
}
