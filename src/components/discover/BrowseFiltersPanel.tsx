import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react'
import { getBreeds } from '@/lib/api/matches'
import type { BrowseFilters } from '@/lib/api/types'
import { Combobox } from '@/components/ui/Combobox'

interface Props {
  filters: BrowseFilters
  onChange: (filters: BrowseFilters) => void
}

const HEALTH_TOGGLES: { key: keyof BrowseFilters; label: string }[] = [
  { key: 'is_vaccinated', label: 'Vaccinated' },
  { key: 'is_neutered', label: 'Neutered/Spayed' },
  { key: 'is_trained', label: 'Trained' },
]

function countActive(filters: BrowseFilters): number {
  let count = 0
  if (filters.species) count++
  if (filters.gender) count++
  if (filters.breed) count++
  if (filters.age_min != null) count++
  if (filters.age_max != null) count++
  if (filters.is_vaccinated) count++
  if (filters.is_neutered) count++
  if (filters.is_trained) count++
  return count
}

export function BrowseFiltersPanel({ filters, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const activeCount = countActive(filters)

  const breedsQuery = useQuery({
    queryKey: ['breeds', filters.species],
    queryFn: () => getBreeds(filters.species),
    staleTime: 5 * 60_000,
  })

  const set = (patch: Partial<BrowseFilters>) => onChange({ ...filters, ...patch })

  return (
    /* Overlays rather than expands. Pushing the deck down when filters opened
       was part of why the swipe buttons ended up below the fold. */
    <div className="relative rounded-xl border border-neutral-800/80 bg-neutral-900/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between gap-2 whitespace-nowrap px-3 py-2 text-sm text-neutral-300"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
          {activeCount > 0 && (
            <span className="rounded-full bg-[#ff6b35]/20 px-2 py-0.5 text-xs font-medium text-[#ff8c5c]">
              {activeCount}
            </span>
          )}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full z-[60] mt-2 max-h-[60vh] w-80 max-w-[calc(100vw-3rem)] overflow-y-auto rounded-xl border border-neutral-800 bg-neutral-950 shadow-2xl shadow-black/60"
          >
            <div className="space-y-4 px-4 py-4">
              <div>
                <label className="mb-1.5 flex items-center justify-between text-xs font-medium text-neutral-500">
                  <span>Distance</span>
                  <span className="text-neutral-400">
                    {(filters.radius ?? 5000) >= 5000 ? 'Anywhere' : `${filters.radius} km`}
                  </span>
                </label>
                <input
                  type="range"
                  min={5}
                  max={5000}
                  step={50}
                  value={filters.radius ?? 5000}
                  onChange={(e) => set({ radius: Number(e.target.value) })}
                  className="w-full accent-[#ff6b35]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-neutral-500">Species</label>
                  <select
                    value={filters.species ?? ''}
                    onChange={(e) => set({ species: e.target.value || undefined, breed: undefined })}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white focus:border-[#ff6b35] focus:outline-none"
                  >
                    <option value="">Any</option>
                    <option value="dog">Dogs</option>
                    <option value="cat">Cats</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-neutral-500">Gender</label>
                  <select
                    value={filters.gender ?? ''}
                    onChange={(e) => set({ gender: e.target.value || undefined })}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white focus:border-[#ff6b35] focus:outline-none"
                  >
                    <option value="">Any</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-500">Breed</label>
                <Combobox
                  value={filters.breed}
                  onChange={(breed) => set({ breed })}
                  options={breedsQuery.data ?? []}
                  placeholder="Any breed"
                  emptyLabel="No breed found"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-neutral-500">Min age (months)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={filters.age_min ?? ''}
                    onChange={(e) => set({ age_min: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-[#ff6b35] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-neutral-500">Max age (months)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="Any"
                    value={filters.age_max ?? ''}
                    onChange={(e) => set({ age_max: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-[#ff6b35] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-500">Health & training</label>
                <div className="flex flex-wrap gap-2">
                  {HEALTH_TOGGLES.map(({ key, label }) => {
                    const active = Boolean(filters[key])
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => set({ [key]: active ? undefined : true })}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                          active
                            ? 'border-[#ff6b35] bg-[#ff6b35]/15 text-[#ff8c5c]'
                            : 'border-neutral-700 text-neutral-400 hover:border-neutral-600'
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    onChange({ radius: filters.radius, limit: filters.limit })
                  }
                  className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
