import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react'
import { getBreeds } from '@/lib/api/matches'
import type { BrowseFilters } from '@/lib/api/types'
import { Combobox } from '@/components/ui/Combobox'
import { useMediaQuery } from '@/hooks/useMediaQuery'

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
  // Below Tailwind's `sm`. Read in JS because it decides Framer's enter/exit
  // direction and whether the dismiss header renders at all, neither of which a
  // breakpoint class can reach.
  const isPhone = useMediaQuery('(max-width: 639px)')

  const breedsQuery = useQuery({
    queryKey: ['breeds', filters.species],
    queryFn: () => getBreeds(filters.species),
    staleTime: 5 * 60_000,
  })

  const set = (patch: Partial<BrowseFilters>) => onChange({ ...filters, ...patch })

  return (
    /* Overlays rather than expands. Pushing the deck down when filters opened
       was part of why the swipe buttons ended up below the fold. */
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 whitespace-nowrap rounded-full border py-1.5 pl-3 pr-2.5 text-sm font-medium transition-colors ${
          open || activeCount > 0
            ? 'border-brand bg-brand/10 text-white'
            : 'border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
        }`}
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Filters
        {activeCount > 0 && (
          <span className="rounded-full bg-brand/20 px-1.5 py-0.5 text-xs font-medium text-brand-light">
            {activeCount}
          </span>
        )}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <>
            {/* On a phone the panel leaves the flow entirely, so it needs its
                own way out — and something to stop taps landing on the deck
                behind it. */}
            {isPhone && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                onClick={() => setOpen(false)}
                className="fixed inset-0 z-[59] bg-black/60 backdrop-blur-sm"
              />
            )}
            <motion.div
              // A 20rem popover hanging off a button is a desktop shape. On a
              // phone it left a cramped column of paired selects and number
              // fields squeezed against the right edge, on the control people
              // reach for most. Bottom sheet below `sm`, anchored dropdown from
              // `sm` up — unchanged on a laptop.
              initial={isPhone ? { opacity: 0, y: 24 } : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={isPhone ? { opacity: 0, y: 24 } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              // `sm:bottom-auto` is load-bearing: the phone sheet pins bottom-0,
              // and without clearing it the desktop popover gets both top-full
              // AND bottom-0 inside a button-sized container — a zero-height
              // box, i.e. an open panel that shows nothing at all.
              className="thin-scrollbar lenis-prevent-scroll fixed inset-x-0 bottom-0 z-[60] max-h-[85dvh] overflow-y-auto overscroll-contain rounded-t-2xl border border-neutral-800 bg-neutral-950 pb-[env(safe-area-inset-bottom)] shadow-2xl shadow-black/60 sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-full sm:mt-2 sm:max-h-[60dvh] sm:w-80 sm:max-w-[calc(100vw-3rem)] sm:rounded-xl sm:pb-0"
            >
              {/* Phone-only header. Filters apply as you set them, so this is a
                  dismiss, not an apply — worded so it doesn't read as one. */}
              {isPhone && (
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-800 bg-neutral-950/95 px-4 py-3 backdrop-blur">
                  <span className="text-sm font-semibold text-white">Filters</span>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close filters"
                    className="-mr-1 flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}
              <div className="space-y-4 px-4 py-4">
              <div>
                <label className="mb-1.5 flex items-center justify-between text-xs font-medium text-neutral-400">
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
                  className="w-full accent-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-neutral-400">Species</label>
                  <select
                    value={filters.species ?? ''}
                    onChange={(e) => set({ species: e.target.value || undefined, breed: undefined })}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white focus:border-brand focus:outline-none"
                  >
                    <option value="">Any</option>
                    <option value="dog">Dogs</option>
                    <option value="cat">Cats</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-neutral-400">Gender</label>
                  <select
                    value={filters.gender ?? ''}
                    onChange={(e) => set({ gender: e.target.value || undefined })}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white focus:border-brand focus:outline-none"
                  >
                    <option value="">Any</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-400">Breed</label>
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
                  <label className="mb-1.5 block text-xs font-medium text-neutral-400">Min age (months)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={filters.age_min ?? ''}
                    onChange={(e) => set({ age_min: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-400 focus:border-brand focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-neutral-400">Max age (months)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="Any"
                    value={filters.age_max ?? ''}
                    onChange={(e) => set({ age_max: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-400 focus:border-brand focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-400">Health & training</label>
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
                            ? 'border-brand bg-brand/15 text-brand-light'
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
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
