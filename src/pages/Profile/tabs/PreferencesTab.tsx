import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { SlidersHorizontal } from 'lucide-react'
import { updateMatchPreferences } from '@/lib/api/users'
import { SectionHeader } from '@/components/ui/SectionHeader'

const SPECIES_OPTIONS = ['', 'dog', 'cat', 'rabbit', 'bird', 'other'] as const
const GENDER_OPTIONS = ['', 'male', 'female'] as const

export function PreferencesTab() {
  const [species, setSpecies] = useState('')
  const [ageMin, setAgeMin] = useState('')
  const [ageMax, setAgeMax] = useState('')
  const [gender, setGender] = useState('')
  const [radius, setRadius] = useState(50)
  const [breeds, setBreeds] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      updateMatchPreferences({
        preferred_species: species || undefined,
        preferred_age_min: ageMin ? Number(ageMin) : undefined,
        preferred_age_max: ageMax ? Number(ageMax) : undefined,
        preferred_gender: gender || undefined,
        preferred_radius_km: radius,
        breed_preferences: breeds
          .split(',')
          .map((b) => b.trim())
          .filter(Boolean),
      }),
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        mutation.mutate()
      }}
      className="space-y-5 rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-6"
    >
      <SectionHeader
        icon={SlidersHorizontal}
        title="Match preferences"
        subtitle="Tune what shows up in Discover — leave a field blank to not filter on it"
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-300">Species</label>
          <select
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2.5 text-sm text-white focus:border-[#ff6b35] focus:outline-none"
          >
            {SPECIES_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s ? s[0].toUpperCase() + s.slice(1) : 'Any'}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-300">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2.5 text-sm text-white focus:border-[#ff6b35] focus:outline-none"
          >
            {GENDER_OPTIONS.map((g) => (
              <option key={g} value={g}>
                {g ? g[0].toUpperCase() + g.slice(1) : 'Any'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-300">Min age (months)</label>
          <input
            type="number"
            min={0}
            value={ageMin}
            onChange={(e) => setAgeMin(e.target.value)}
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2.5 text-sm text-white focus:border-[#ff6b35] focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-300">Max age (months)</label>
          <input
            type="number"
            min={0}
            value={ageMax}
            onChange={(e) => setAgeMax(e.target.value)}
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2.5 text-sm text-white focus:border-[#ff6b35] focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 flex items-center justify-between text-sm font-medium text-neutral-300">
          Search radius
          <span className="font-semibold text-[#ff6b35]">{radius} km</span>
        </label>
        <input
          type="range"
          min={1}
          max={500}
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="w-full accent-[#ff6b35]"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-300">Preferred breeds</label>
        <input
          value={breeds}
          onChange={(e) => setBreeds(e.target.value)}
          placeholder="Golden Retriever, Labrador (comma-separated)"
          className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:border-[#ff6b35] focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff6b35] to-pink-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#ff6b35]/30 transition-all hover:shadow-xl hover:shadow-[#ff6b35]/40 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {mutation.isPending ? 'Saving…' : mutation.isSuccess ? 'Saved' : 'Save preferences'}
      </button>
    </form>
  )
}
