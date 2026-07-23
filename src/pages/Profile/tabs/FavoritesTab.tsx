import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Heart, PawPrint, X } from 'lucide-react'
import { listMyPets } from '@/lib/api/pets'
import { listFavorites, removeFavorite } from '@/lib/api/favorites'
import { PetAvatar } from '@/components/chat/PetAvatar'
import { EmptyState } from '@/components/ui/EmptyState'
import { PillTabs } from '@/components/ui/PillTabs'
import { Skeleton } from '@/components/ui/Skeleton'

export function FavoritesTab() {
  const queryClient = useQueryClient()
  const petsQuery = useQuery({ queryKey: ['pets', 'me'], queryFn: listMyPets })
  const pets = petsQuery.data ?? []
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null)
  const selectedPet = pets.find((p) => p.id === selectedPetId) ?? pets[0]

  const favoritesQuery = useQuery({
    queryKey: ['favorites', selectedPet?.id],
    queryFn: () => listFavorites(selectedPet!.id),
    enabled: !!selectedPet,
  })

  const removeMutation = useMutation({
    mutationFn: removeFavorite,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites', selectedPet?.id] }),
  })

  if (petsQuery.isLoading) return <Skeleton className="h-48" />

  if (pets.length === 0) {
    return <EmptyState icon={PawPrint} title="Add a pet first" />
  }

  const favorites = favoritesQuery.data?.items ?? []

  return (
    <div>
      {pets.length > 1 && (
        <PillTabs
          layoutId="favorites-pet-pill"
          active={selectedPet?.id ?? pets[0].id}
          onChange={setSelectedPetId}
          className="mb-5"
          tabs={pets.map((pet) => ({ key: pet.id, label: pet.name }))}
        />
      )}

      {favoritesQuery.isLoading && <Skeleton className="h-32" />}

      {!favoritesQuery.isLoading && favorites.length === 0 && (
        <EmptyState
          icon={Heart}
          title="No favorites yet"
          description={`Pets ${selectedPet?.name} favorites while browsing will show up here.`}
        />
      )}

      <ul className="space-y-3">
        {favorites.map((fav) => (
          <li
            key={fav.id}
            className="flex items-center gap-3 rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-3 transition-colors hover:border-neutral-700"
          >
            <PetAvatar name={fav.target_pet.name} photoUrl={fav.target_pet.primary_photo_url} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-white">{fav.target_pet.name}</p>
              <p className="truncate text-xs text-neutral-500">{fav.target_pet.breed}</p>
            </div>
            <button
              onClick={() => removeMutation.mutate(fav.id)}
              aria-label="Remove favorite"
              className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 hover:bg-red-500/10 hover:text-red-400"
            >
              <X className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
