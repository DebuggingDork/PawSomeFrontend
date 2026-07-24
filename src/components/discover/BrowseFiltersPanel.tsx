import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react'
import { getBreeds } from '@/lib/api/matches'
import type { BrowseFilters } from '@/lib/api/types'

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
    <div className="mb-4 rounded-xl border border-neutral-800/80 bg-neutral-900/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-sm text-neutral-300"
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
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 border-t border-neutral-800/80 px-4 py-4">
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
                <input
                  type="text"
                  list="discover-breed-options"
                  placeholder="Any breed"
                  value={filters.breed ?? ''}
                  onChange={(e) => set({ breed: e.target.value || undefined })}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-[#ff6b35] focus:outline-none"
                />
                <datalist id="discover-breed-options">
                  {(breedsQuery.data ?? []).map((breed) => (
                    <option key={breed} value={breed} />
                  ))}
                </datalist>
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
