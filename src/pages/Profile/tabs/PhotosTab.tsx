import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Star, Trash2, PawPrint, Image as ImageIcon } from 'lucide-react'
import { listMyPets } from '@/lib/api/pets'
import { confirmPetPhoto, deletePetPhoto, presignPetPhoto, setPrimaryPhoto } from '@/lib/api/petPhotos'
import { PhotoUploader } from '@/components/ui/PhotoUploader'
import { EmptyState } from '@/components/ui/EmptyState'
import { PillTabs } from '@/components/ui/PillTabs'
import { Skeleton } from '@/components/ui/Skeleton'

export function PhotosTab() {
  const queryClient = useQueryClient()
  const petsQuery = useQuery({ queryKey: ['pets', 'me'], queryFn: listMyPets })
  const pets = petsQuery.data ?? []
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null)
  const selectedPet = pets.find((p) => p.id === selectedPetId) ?? pets[0]

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['pets', 'me'] })

  const setPrimaryMutation = useMutation({
    mutationFn: (photoId: string) => setPrimaryPhoto(selectedPet!.id, photoId),
    onSuccess: invalidate,
  })
  const deleteMutation = useMutation({
    mutationFn: (photoId: string) => deletePetPhoto(selectedPet!.id, photoId),
    onSuccess: invalidate,
  })

  if (petsQuery.isLoading) return <Skeleton className="h-48" />

  if (pets.length === 0) {
    return (
      <EmptyState
        icon={PawPrint}
        title="Add a pet first"
        description="Once you have a pet, you can manage its photos here."
      />
    )
  }

  const photos = selectedPet?.photos ?? []

  return (
    <div>
      {pets.length > 1 && (
        <PillTabs
          layoutId="photos-pet-pill"
          active={selectedPet?.id ?? pets[0].id}
          onChange={setSelectedPetId}
          className="mb-5"
          tabs={pets.map((pet) => ({ key: pet.id, label: pet.name }))}
        />
      )}

      {photos.length === 0 && (
        <EmptyState icon={ImageIcon} title={`No photos of ${selectedPet?.name} yet`} className="py-10" />
      )}

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo) => (
          <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-xl border border-neutral-800">
            <img src={photo.url} alt="" className="h-full w-full object-cover" />
            {photo.is_primary && (
              <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                <Star className="h-3 w-3" fill="currentColor" /> Primary
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
              {!photo.is_primary && (
                <button
                  onClick={() => setPrimaryMutation.mutate(photo.id)}
                  aria-label="Set as primary"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                >
                  <Star className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => deleteMutation.mutate(photo.id)}
                disabled={photos.length <= 1}
                aria-label="Delete photo"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white hover:bg-red-500/30 disabled:cursor-not-allowed disabled:opacity-30"
                title={photos.length <= 1 ? 'A pet needs at least one photo' : undefined}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedPet && (
        <PhotoUploader
          label={`Add a photo of ${selectedPet.name}`}
          presign={(contentType) => presignPetPhoto(selectedPet.id, contentType)}
          confirm={(key) => confirmPetPhoto(selectedPet.id, key).then(() => invalidate())}
        />
      )}
    </div>
  )
}
