import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Heart, PawPrint, X } from 'lucide-react'
import { listMyPets } from '@/lib/api/pets'
import { listFavorites, removeFavorite } from '@/lib/api/favorites'
import { PetAvatar } from '@/components/chat/PetAvatar'

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

  if (petsQuery.isLoading) return <div className="h-48 animate-pulse rounded-2xl bg-neutral-900/60" />

  if (pets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center text-neutral-500">
        <PawPrint className="mb-3 h-9 w-9" />
        <p className="font-medium text-neutral-300">Add a pet first</p>
      </div>
    )
  }

  const favorites = favoritesQuery.data?.items ?? []

  return (
    <div>
      {pets.length > 1 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {pets.map((pet) => (
            <button
              key={pet.id}
              onClick={() => setSelectedPetId(pet.id)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedPet?.id === pet.id
                  ? 'bg-gradient-to-r from-[#ff6b35] to-pink-500 text-white'
                  : 'bg-neutral-900 text-neutral-400'
              }`}
            >
              {pet.name}
            </button>
          ))}
        </div>
      )}

      {favoritesQuery.isLoading && <div className="h-32 animate-pulse rounded-2xl bg-neutral-900/60" />}

      {!favoritesQuery.isLoading && favorites.length === 0 && (
        <div className="flex flex-col items-center justify-center py-14 text-center text-neutral-500">
          <Heart className="mb-3 h-9 w-9" />
          <p className="font-medium text-neutral-300">No favorites yet</p>
          <p className="text-sm">Pets {selectedPet?.name} favorites while browsing will show up here.</p>
        </div>
      )}

      <ul className="space-y-3">
        {favorites.map((fav) => (
          <li
            key={fav.id}
            className="flex items-center gap-3 rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-3"
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
