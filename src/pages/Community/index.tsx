import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { PawPrint, Search } from 'lucide-react'
import { browsePets } from '@/lib/api/pets'
import { getBreeds } from '@/lib/api/matches'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { PetAvatar } from '@/components/chat/PetAvatar'

const PAGE_SIZE = 6

interface PetFilters {
  species?: 'dog' | 'cat'
  gender?: 'male' | 'female'
  breed?: string
}

function CommunityPage() {
  const [filters, setFilters] = useState<PetFilters>({})
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['pets', 'browse', filters],
    queryFn: ({ pageParam }) => browsePets({ ...filters, limit: PAGE_SIZE, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, page) => sum + page.items.length, 0)
      return loaded < lastPage.total ? loaded : undefined
    },
  })

  const breedsQuery = useQuery({
    queryKey: ['breeds', filters.species],
    queryFn: () => getBreeds(filters.species),
    staleTime: 5 * 60_000,
  })

  const pets = data?.pages.flatMap((page) => page.items) ?? []
  const total = data?.pages[0]?.total ?? 0

  // Lazy-load the next page of pets as the sentinel scrolls into view.
  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { rootMargin: '400px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  return (
    <div className="mx-auto max-w-6xl px-6 pb-16 pt-24 md:pt-28">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-2">Community</h1>
        <p className="text-neutral-400">
          Browse every pet on PawSome and their owners. Want to match instead? Head to Discover to swipe.
        </p>
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
              list="pets-breed-options"
              placeholder="Search breed..."
              value={filters.breed ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, breed: e.target.value || undefined }))}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 pl-10 pr-4 py-2 text-white placeholder-neutral-500 focus:border-[#ff6b35] focus:outline-none"
            />
            <datalist id="pets-breed-options">
              {(breedsQuery.data ?? []).map((breed) => (
                <option key={breed} value={breed} />
              ))}
            </datalist>
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
            Found {total} pet{total !== 1 ? 's' : ''}
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pets.map((pet) => (
              <Link
                to={`/pets/${pet.id}`}
                key={pet.id}
                className="group overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/50 backdrop-blur transition-all hover:border-[#ff6b35] hover:shadow-lg hover:shadow-[#ff6b35]/20"
              >
                {/* Pet Photo */}
                <div className="relative aspect-square overflow-hidden bg-neutral-800">
                  {pet.primary_photo_url ? (
                    <img
                      src={pet.primary_photo_url}
                      alt={pet.name}
                      loading="lazy"
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
              </Link>
            ))}
          </div>

          {/* Lazy-load sentinel */}
          <div ref={sentinelRef} className="h-1" />
          {isFetchingNextPage && (
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-lg" />
              ))}
            </div>
          )}
          {!hasNextPage && pets.length > 0 && (
            <p className="mt-8 text-center text-sm text-neutral-500">You've reached the end 🐾</p>
          )}
        </>
      )}
    </div>
  )
}

export default CommunityPage
