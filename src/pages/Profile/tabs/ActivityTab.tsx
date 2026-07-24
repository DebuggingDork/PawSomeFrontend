import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PawPrint, Heart, X as XIcon, ThumbsDown, ThumbsUp } from 'lucide-react'
import { listMyPets } from '@/lib/api/pets'
import { getSwipeStatistics, getSwipeHistory, getBreeds } from '@/lib/api/matches'
import type { SwipeHistoryFilters } from '@/lib/api/types'
import { PetAvatar } from '@/components/chat/PetAvatar'
import { EmptyState } from '@/components/ui/EmptyState'
import { PillTabs } from '@/components/ui/PillTabs'
import { Skeleton } from '@/components/ui/Skeleton'

type SubView = 'stats' | 'history'

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/60 p-4 text-center">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="mt-1 text-xs text-neutral-500">{label}</div>
    </div>
  )
}

function StatsView({ petId }: { petId: string }) {
  const statsQuery = useQuery({
    queryKey: ['swipe-statistics', petId],
    queryFn: () => getSwipeStatistics(petId),
  })

  if (statsQuery.isLoading) return <Skeleton className="h-64" />
  if (statsQuery.isError) {
    return <EmptyState icon={ThumbsDown} title="Couldn't load stats" description="Please try again in a moment." />
  }

  const stats = statsQuery.data!
  const maxDaily = Math.max(1, ...stats.last_30_days.map((d) => d.likes + d.skips))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Likes sent" value={stats.total_likes} />
        <StatTile label="Skips" value={stats.total_skips} />
        <StatTile label="Matches" value={stats.matches_created} />
        <StatTile label="Like ratio" value={`${Math.round(stats.like_to_skip_ratio * 100)}%`} />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-300">Last 30 days</h3>
        {stats.last_30_days.length === 0 ? (
          <p className="text-sm text-neutral-500">No swipes in the last 30 days.</p>
        ) : (
          <div className="flex h-24 items-end gap-1">
            {stats.last_30_days.map((day) => (
              <div key={day.date} className="group relative flex-1" title={`${day.date}: ${day.likes} likes, ${day.skips} skips`}>
                <div className="flex h-24 flex-col-reverse gap-px">
                  <div
                    className="w-full rounded-b bg-[#ff6b35]"
                    style={{ height: `${(day.likes / maxDaily) * 100}%` }}
                  />
                  <div
                    className="w-full rounded-t bg-neutral-700"
                    style={{ height: `${(day.skips / maxDaily) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-300">Top breeds liked</h3>
        {stats.top_breeds_liked.length === 0 ? (
          <p className="text-sm text-neutral-500">Like some pets to see your favorite breeds here.</p>
        ) : (
          <ul className="space-y-2">
            {stats.top_breeds_liked.map((b) => (
              <li key={b.breed} className="flex items-center justify-between rounded-lg bg-neutral-900/60 px-3 py-2 text-sm">
                <span className="text-neutral-200">{b.breed}</span>
                <span className="text-neutral-500">{b.count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

const PAGE_SIZE = 10

function HistoryView({ petId }: { petId: string }) {
  const [filters, setFilters] = useState<SwipeHistoryFilters>({ limit: PAGE_SIZE, offset: 0 })

  const breedsQuery = useQuery({ queryKey: ['breeds'], queryFn: () => getBreeds(), staleTime: 5 * 60_000 })
  const historyQuery = useQuery({
    queryKey: ['swipe-history', petId, filters],
    queryFn: () => getSwipeHistory(petId, filters),
  })

  const set = (patch: Partial<SwipeHistoryFilters>) => setFilters((f) => ({ ...f, ...patch, offset: 0 }))

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
        <select
          value={filters.action ?? ''}
          onChange={(e) => set({ action: (e.target.value || undefined) as 'like' | 'skip' | undefined })}
          className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white focus:border-[#ff6b35] focus:outline-none"
        >
          <option value="">All actions</option>
          <option value="like">Likes</option>
          <option value="skip">Skips</option>
        </select>

        <input
          type="text"
          list="history-breed-options"
          placeholder="Any breed"
          value={filters.breed ?? ''}
          onChange={(e) => set({ breed: e.target.value || undefined })}
          className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-[#ff6b35] focus:outline-none"
        />
        <datalist id="history-breed-options">
          {(breedsQuery.data ?? []).map((breed) => (
            <option key={breed} value={breed} />
          ))}
        </datalist>

        <input
          type="date"
          value={filters.date_from ?? ''}
          onChange={(e) => set({ date_from: e.target.value || undefined })}
          className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white focus:border-[#ff6b35] focus:outline-none"
        />
        <input
          type="date"
          value={filters.date_to ?? ''}
          onChange={(e) => set({ date_to: e.target.value || undefined })}
          className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white focus:border-[#ff6b35] focus:outline-none"
        />
      </div>

      {historyQuery.isLoading && <Skeleton className="h-48" />}

      {historyQuery.isError && (
        <EmptyState icon={ThumbsDown} title="Couldn't load swipe history" description="Please try again in a moment." />
      )}

      {historyQuery.data && historyQuery.data.swipes.length === 0 && (
        <EmptyState icon={PawPrint} title="No swipes match these filters" description="Try widening your filters." />
      )}

      {historyQuery.data && historyQuery.data.swipes.length > 0 && (
        <>
          <ul className="space-y-2">
            {historyQuery.data.swipes.map((item) => (
              <li
                key={item.swipe_id}
                className="flex items-center gap-3 rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-3"
              >
                <PetAvatar name={item.target_pet.name} photoUrl={item.target_pet.primary_photo_url} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">{item.target_pet.name}</p>
                  <p className="truncate text-xs text-neutral-500">
                    {item.target_pet.breed} • {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
                {item.action === 'like' ? (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                    <ThumbsUp className="h-3 w-3" /> Liked
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full bg-neutral-800 px-2.5 py-1 text-xs font-medium text-neutral-400">
                    <XIcon className="h-3 w-3" /> Skipped
                  </span>
                )}
              </li>
            ))}
          </ul>

          {historyQuery.data.total > (filters.limit ?? PAGE_SIZE) && (
            <div className="mt-6 flex justify-center gap-2">
              <button
                disabled={(filters.offset ?? 0) === 0}
                onClick={() => setFilters((f) => ({ ...f, offset: Math.max(0, (f.offset ?? 0) - PAGE_SIZE) }))}
                className="rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-[#ff6b35] disabled:opacity-50"
              >
                Previous
              </button>
              <span className="flex items-center px-4 text-sm text-neutral-400">
                Page {Math.floor((filters.offset ?? 0) / PAGE_SIZE) + 1} of{' '}
                {Math.ceil(historyQuery.data.total / PAGE_SIZE)}
              </span>
              <button
                disabled={(filters.offset ?? 0) + PAGE_SIZE >= historyQuery.data.total}
                onClick={() => setFilters((f) => ({ ...f, offset: (f.offset ?? 0) + PAGE_SIZE }))}
                className="rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-[#ff6b35] disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export function ActivityTab() {
  const petsQuery = useQuery({ queryKey: ['pets', 'me'], queryFn: listMyPets })
  const pets = petsQuery.data ?? []
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null)
  const [subView, setSubView] = useState<SubView>('stats')
  const selectedPet = pets.find((p) => p.id === selectedPetId) ?? pets[0]

  if (petsQuery.isLoading) return <Skeleton className="h-48" />

  if (pets.length === 0) {
    return <EmptyState icon={PawPrint} title="Add a pet first" description="Your swipe activity will show up here once you start browsing." />
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        {pets.length > 1 ? (
          <PillTabs
            layoutId="activity-pet-pill"
            active={selectedPet?.id ?? pets[0].id}
            onChange={setSelectedPetId}
            tabs={pets.map((pet) => ({ key: pet.id, label: pet.name }))}
          />
        ) : (
          <span />
        )}
        <PillTabs
          layoutId="activity-view-pill"
          active={subView}
          onChange={setSubView}
          tabs={[
            { key: 'stats', label: 'Stats', icon: Heart },
            { key: 'history', label: 'History', icon: PawPrint },
          ]}
        />
      </div>

      {selectedPet && subView === 'stats' && <StatsView petId={selectedPet.id} />}
      {selectedPet && subView === 'history' && <HistoryView petId={selectedPet.id} />}
    </div>
  )
}
