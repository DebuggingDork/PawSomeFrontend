import { useState } from 'react'
import { Link } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bookmark, Heart, PawPrint, X } from 'lucide-react'
import { listMyPets } from '@/lib/api/pets'
import { listFavorites, removeFavorite } from '@/lib/api/favorites'
import { swipe as swipeApi } from '@/lib/api/matches'
import { ApiError } from '@/lib/api/client'
import { PetAvatar } from '@/components/chat/PetAvatar'
import { EmptyState } from '@/components/ui/EmptyState'
import { PillTabs } from '@/components/ui/PillTabs'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Skeleton } from '@/components/ui/Skeleton'

export function FavoritesTab() {
  const queryClient = useQueryClient()
  const petsQuery = useQuery({ queryKey: ['pets', 'me'], queryFn: listMyPets })
  const pets = petsQuery.data ?? []
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null)
  const selectedPet = pets.find((p) => p.id === selectedPetId) ?? pets[0]
  const [actingOn, setActingOn] = useState<string | null>(null)

  const favoritesQuery = useQuery({
    queryKey: ['favorites', selectedPet?.id],
    queryFn: () => listFavorites(selectedPet!.id),
    enabled: !!selectedPet,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['favorites'] })
    queryClient.invalidateQueries({ queryKey: ['pet-relationship'] })
  }

  const removeMutation = useMutation({
    mutationFn: removeFavorite,
    onSuccess: invalidate,
    onSettled: () => setActingOn(null),
  })

  // Acting on a saved pet is the whole point of saving it. The server clears
  // the favourite itself once the swipe lands, so the row leaves the list on
  // its own — a shortlist that empties as you work through it.
  const interestMutation = useMutation({
    mutationFn: (targetPetId: string) =>
      swipeApi({ pet_id: selectedPet!.id, target_pet_id: targetPetId, action: 'like' }),
    onSuccess: () => {
      invalidate()
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['matches'] })
    },
    onSettled: () => setActingOn(null),
  })

  if (petsQuery.isLoading) return <Skeleton className="h-48" />

  if (pets.length === 0) {
    return <EmptyState icon={PawPrint} title="Add a pet first" />
  }

  const favorites = favoritesQuery.data?.items ?? []
  const interestError =
    interestMutation.error instanceof ApiError && typeof interestMutation.error.detail === 'string'
      ? interestMutation.error.detail
      : null

  return (
    <div>
      <SectionHeader
        icon={Bookmark}
        title="Saved pets"
        subtitle={
          selectedPet
            ? `Pets ${selectedPet.name} saved to decide on later. Only you can see this list.`
            : undefined
        }
        className="mb-5"
      />

      {pets.length > 1 && (
        <PillTabs
          layoutId="favorites-pet-pill"
          active={selectedPet?.id ?? pets[0].id}
          onChange={setSelectedPetId}
          className="mb-5"
          tabs={pets.map((pet) => ({ key: pet.id, label: pet.name }))}
        />
      )}

      {interestError && (
        <p className="mb-4 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-400">
          {interestError}
        </p>
      )}

      {favoritesQuery.isLoading && <Skeleton className="h-32" />}

      {!favoritesQuery.isLoading && favorites.length === 0 && (
        <EmptyState
          icon={Bookmark}
          title="Nothing saved yet"
          description={`Use Save on any pet in Community to shortlist them for ${selectedPet?.name} without telling their owner. Show interest when you're ready.`}
          action={
            <Link
              to="/community"
              className="rounded-full bg-gradient-to-r from-brand to-pink-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-transform hoverable:hover:-translate-y-0.5"
            >
              Browse Community
            </Link>
          }
        />
      )}

      <ul className="space-y-3">
        {favorites.map((fav) => {
          const busy = actingOn === fav.id
          return (
            <li
              key={fav.id}
              className="flex items-center gap-3 rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-3 transition-colors hover:border-neutral-700"
            >
              <Link to={`/pets/${fav.target_pet.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                <PetAvatar name={fav.target_pet.name} photoUrl={fav.target_pet.primary_photo_url} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">{fav.target_pet.name}</p>
                  <p className="truncate text-xs text-neutral-500">{fav.target_pet.breed}</p>
                </div>
              </Link>
              <button
                onClick={() => {
                  setActingOn(fav.id)
                  interestMutation.mutate(fav.target_pet.id)
                }}
                disabled={busy}
                title={`Tell ${fav.target_pet.name}'s owner that ${selectedPet?.name} is interested`}
                className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand/25 transition-transform hoverable:enabled:hover:-translate-y-0.5 disabled:opacity-50"
              >
                <Heart className="h-3.5 w-3.5" />
                Interested
              </button>
              <button
                onClick={() => {
                  setActingOn(fav.id)
                  removeMutation.mutate(fav.id)
                }}
                disabled={busy}
                aria-label={`Remove ${fav.target_pet.name} from saved`}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-neutral-400 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
