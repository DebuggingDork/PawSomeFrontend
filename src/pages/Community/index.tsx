import { useEffect, useRef, useState } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { BadgeCheck, PawPrint, Sparkles, Users, Venus } from 'lucide-react'
import { browsePets } from '@/lib/api/pets'
import { getBreeds } from '@/lib/api/matches'
import { useAuthStore } from '@/store/useAuthStore'
import { activeHealthTags, genderMark, isNewHere } from '@/lib/petBadges'
import { GenderBadge } from '@/components/ui/GenderBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { PetAvatar } from '@/components/chat/PetAvatar'
import { PetCardDialog } from '@/components/community/PetCardDialog'
import type { Pet } from '@/lib/api/types'
import { formatAge } from '@/lib/formatAge'
import { Combobox } from '@/components/ui/Combobox'

const PAGE_SIZE = 6

interface PetFilters {
  species?: 'dog' | 'cat'
  gender?: 'male' | 'female'
  breed?: string
}

function PetCard({
  pet,
  index,
  isMine,
  onOpen,
}: {
  pet: Pet
  index: number
  isMine: boolean
  onOpen: (id: string) => void
}) {
  const tags = activeHealthTags(pet)

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(pet.id)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: (index % PAGE_SIZE) * 0.05, ease: 'easeOut' }}
      // `flex flex-col` is load-bearing, not cosmetic. Grid rows stretch every
      // card to the height of the tallest one in the row, and a <button> that is
      // taller than its content centres that content vertically — so a pet with
      // a short bio (or none) rendered with a band of empty card above the photo
      // and the badges floating off the top edge, while its neighbours sat flush.
      // A flex column stacks from the top instead, and the slack lands at the
      // bottom where mt-auto below can use it.
      className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/50 text-left backdrop-blur transition-all hoverable:hover:-translate-y-1 hover:border-brand/70 hover:shadow-xl hover:shadow-brand/10"
    >
      {/* Pet Photo */}
      <div className="relative aspect-square shrink-0 overflow-hidden bg-neutral-800">
        {pet.primary_photo_url ? (
          <img
            src={pet.primary_photo_url}
            alt={pet.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 hoverable:group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <PawPrint className="h-16 w-16 text-neutral-700" />
          </div>
        )}

        {/* "My pet" wins the corner over "New": which pets are yours decides
            whether the card offers anything to act on, so it has to be legible
            from the grid rather than only after opening the card. */}
        {isMine ? (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-bold text-brand shadow-lg backdrop-blur ring-1 ring-brand/50">
            <PawPrint className="h-3 w-3" />
            My pet
          </div>
        ) : (
          isNewHere(pet.created_at) && (
            <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-[11px] font-bold text-white shadow-lg shadow-brand/40">
              <Sparkles className="h-3 w-3" />
              {/* "New paw", not "New" — a bare "New" tag on a photo grid reads
                  like merchandise, and these are animals, not products. */}
              New paw
            </div>
          )
        )}

        {/* Species & Gender Badge */}
        <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 py-1 pl-2.5 pr-1.5 text-xs font-medium text-white backdrop-blur">
          <span aria-hidden="true">{pet.species === 'dog' ? '🐕' : '🐈'}</span>
          <GenderBadge gender={pet.gender} size="sm" decorative />
          <span className="sr-only">
            {pet.species === 'dog' ? 'Dog' : 'Cat'}, {genderMark(pet.gender).label}
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      {/* Pet Info */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-center gap-1.5">
          <h3 className="text-xl font-bold text-white">{pet.name}</h3>
          {pet.owner?.is_verified && <BadgeCheck className="h-4 w-4 flex-shrink-0 text-sky-400" aria-label="Verified owner" />}
        </div>
        <p className="mb-2 text-sm text-neutral-400">
          {pet.breed} • {formatAge(pet.age_months)}
        </p>
        {pet.bio && <p className="mb-3 line-clamp-2 text-sm text-neutral-300">{pet.bio}</p>}

        {tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {tags.map(({ key, label, icon: Icon, className }) => (
              <span key={key} className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${className}`}>
                <Icon className="h-2.5 w-2.5" />
                {label}
              </span>
            ))}
          </div>
        )}

        {/* Owner Info. mt-auto so the owner strips line up across a row
            whatever the bios above them did. */}
        {pet.owner && (
          <div className="mt-auto flex items-center gap-2 border-t border-neutral-800 pt-3">
            <PetAvatar name={pet.owner.full_name ?? 'Unknown'} photoUrl={pet.owner.profile_photo_url} size="sm" />
            <div className="flex-1 overflow-hidden">
              <div className="truncate text-sm font-medium text-white">{pet.owner.full_name ?? 'Anonymous'}</div>
              {pet.owner.occupation && <div className="truncate text-xs text-neutral-400">{pet.owner.occupation}</div>}
            </div>
          </div>
        )}
      </div>
    </motion.button>
  )
}

function CommunityPage() {
  const [filters, setFilters] = useState<PetFilters>({})
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const myPets = useAuthStore((state) => state.pets)
  const myPetIds = new Set(myPets.map((p) => p.id))

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
  const activeFilterCount = Object.values(filters).filter(Boolean).length

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
    <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-[calc(var(--tab-bar-total-h)+1rem)] pt-24 md:pt-28 lg:pb-16">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Community 🐾</h1>
          <p className="text-neutral-400">
            Browse every pet on PawSome and their owners. Want to match instead? Head to Discover to swipe.
          </p>
        </div>
        {!isLoading && (
          <div className="hidden flex-shrink-0 items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900/60 px-4 py-2 text-sm text-neutral-400 sm:flex">
            <Users className="h-4 w-4" />
            {total} pet{total !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-end gap-4 rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-4">
        <div className="min-w-[180px] flex-1">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-neutral-400">
            <PawPrint className="h-3.5 w-3.5" /> Species
          </label>
          <select
            value={filters.species ?? ''}
            onChange={(e) =>
              setFilters((f) => ({ ...f, species: (e.target.value || undefined) as 'dog' | 'cat' | undefined }))
            }
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white focus:border-brand focus:outline-none"
          >
            <option value="">All species</option>
            <option value="dog">Dogs</option>
            <option value="cat">Cats</option>
          </select>
        </div>

        <div className="min-w-[180px] flex-1">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-neutral-400">
            <Venus className="h-3.5 w-3.5" /> Gender
          </label>
          <select
            value={filters.gender ?? ''}
            onChange={(e) =>
              setFilters((f) => ({ ...f, gender: (e.target.value || undefined) as 'male' | 'female' | undefined }))
            }
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white focus:border-brand focus:outline-none"
          >
            <option value="">All genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div className="min-w-[200px] flex-1">
          <label className="mb-1.5 block text-xs font-medium text-neutral-400">Breed</label>
          <Combobox
            value={filters.breed}
            onChange={(breed) => setFilters((f) => ({ ...f, breed }))}
            options={breedsQuery.data ?? []}
            placeholder="Search breed..."
            emptyLabel="No breed found"
          />
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={() => setFilters({})}
            className="rounded-lg px-3 py-2 text-xs font-medium text-neutral-400 hover:text-white"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Results */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
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
          <div className="mb-4 text-sm text-neutral-400 sm:hidden">
            Found {total} pet{total !== 1 ? 's' : ''}
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pets.map((pet, index) => (
              <PetCard
                key={pet.id}
                pet={pet}
                index={index}
                isMine={myPetIds.has(pet.id)}
                onOpen={setSelectedPetId}
              />
            ))}
          </div>

          {/* Lazy-load sentinel */}
          <div ref={sentinelRef} className="h-1" />
          {isFetchingNextPage && (
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-2xl" />
              ))}
            </div>
          )}
          {!hasNextPage && pets.length > 0 && (
            <p className="mt-8 text-center text-sm text-neutral-400">You've reached the end 🐾</p>
          )}
        </>
      )}

      {selectedPetId && <PetCardDialog petId={selectedPetId} onClose={() => setSelectedPetId(null)} />}
    </div>
  )
}

export default CommunityPage
