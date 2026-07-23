import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PawPrint, Search } from 'lucide-react'
import { browsePets } from '@/lib/api/pets'
import type { BrowsePetsParams } from '@/lib/api/pets'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { PetAvatar } from '@/components/chat/PetAvatar'

function CatalogPage() {
  const [filters, setFilters] = useState<BrowsePetsParams>({
    limit: 20,
    offset: 0,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['pets', 'catalog', filters],
    queryFn: () => browsePets(filters),
  })

  const pets = data?.items ?? []

  return (
    <div className="mx-auto max-w-6xl px-6 pb-16 pt-24 md:pt-28">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-2">Pet Catalog</h1>
        <p className="text-neutral-400">Browse all available pets looking for matches</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 rounded-lg bg-neutral-900/50 p-4 backdrop-blur">
        <div className="flex-1 min-w-[200px]">
          <label className="mb-2 block text-sm font-medium text-neutral-400">Species</label>
          <select
            value={filters.species ?? ''}
            onChange={(e) =>
              setFilters((f) => ({ ...f, species: (e.target.value || undefined) as 'dog' | 'cat' | undefined }))
            }
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-white focus:border-[#ff6b35] focus:outline-none"
          >
            <option value="">All Species</option>
            <option value="dog">Dogs</option>
            <option value="cat">Cats</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="mb-2 block text-sm font-medium text-neutral-400">Gender</label>
          <select
            value={filters.gender ?? ''}
            onChange={(e) =>
              setFilters((f) => ({ ...f, gender: (e.target.value || undefined) as 'male' | 'female' | undefined }))
            }
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-white focus:border-[#ff6b35] focus:outline-none"
          >
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="mb-2 block text-sm font-medium text-neutral-400">Breed</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search breed..."
              value={filters.breed ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, breed: e.target.value || undefined }))}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 pl-10 pr-4 py-2 text-white placeholder-neutral-500 focus:border-[#ff6b35] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && pets.length === 0 && (
        <EmptyState
          icon={PawPrint}
          title="No pets found"
          description="Try adjusting your filters to see more results."
        />
      )}

      {!isLoading && pets.length > 0 && (
        <>
          <div className="mb-4 text-sm text-neutral-400">
            Found {data.total} pet{data.total !== 1 ? 's' : ''}
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pets.map((pet) => (
              <div
                key={pet.id}
                className="group overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/50 backdrop-blur transition-all hover:border-[#ff6b35] hover:shadow-lg hover:shadow-[#ff6b35]/20"
              >
                {/* Pet Photo */}
                <div className="relative aspect-square overflow-hidden bg-neutral-800">
                  {pet.primary_photo_url ? (
                    <img
                      src={pet.primary_photo_url}
                      alt={pet.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <PawPrint className="h-16 w-16 text-neutral-700" />
                    </div>
                  )}
                  {/* Species & Gender Badge */}
                  <div className="absolute top-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                    {pet.species === 'dog' ? '🐕' : '🐈'} {pet.gender === 'male' ? '♂' : '♀'}
                  </div>
                </div>

                {/* Pet Info */}
                <div className="p-4">
                  <h3 className="mb-1 text-xl font-bold text-white">{pet.name}</h3>
                  <p className="mb-2 text-sm text-neutral-400">
                    {pet.breed} • {Math.floor(pet.age_months / 12)} years old
                  </p>
                  {pet.bio && (
                    <p className="mb-3 line-clamp-2 text-sm text-neutral-300">{pet.bio}</p>
                  )}

                  {/* Owner Info */}
                  {pet.owner && (
                    <div className="flex items-center gap-2 border-t border-neutral-800 pt-3">
                      <PetAvatar
                        name={pet.owner.full_name ?? 'Unknown'}
                        photoUrl={pet.owner.profile_photo_url}
                        size="sm"
                      />
                      <div className="flex-1 overflow-hidden">
                        <div className="truncate text-sm font-medium text-white">
                          {pet.owner.full_name ?? 'Anonymous'}
                        </div>
                        {pet.owner.occupation && (
                          <div className="truncate text-xs text-neutral-500">{pet.owner.occupation}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data.total > filters.limit! && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                disabled={filters.offset === 0}
                onClick={() => setFilters((f) => ({ ...f, offset: Math.max(0, f.offset! - f.limit!) }))}
                className="rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-[#ff6b35] disabled:opacity-50 disabled:hover:border-neutral-700"
              >
                Previous
              </button>
              <span className="flex items-center px-4 text-sm text-neutral-400">
                Page {Math.floor(filters.offset! / filters.limit!) + 1} of{' '}
                {Math.ceil(data.total / filters.limit!)}
              </span>
              <button
                disabled={filters.offset! + filters.limit! >= data.total}
                onClick={() => setFilters((f) => ({ ...f, offset: f.offset! + f.limit! }))}
                className="rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-[#ff6b35] disabled:opacity-50 disabled:hover:border-neutral-700"
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

export default CatalogPage
