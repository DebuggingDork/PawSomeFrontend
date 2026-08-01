import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Star, Trash2, PawPrint, Image as ImageIcon, RefreshCw, Loader2 } from 'lucide-react'
import { listMyPets } from '@/lib/api/pets'
import {
  confirmPetPhoto,
  confirmPetPhotoReplace,
  deletePetPhoto,
  presignPetPhoto,
  presignPetPhotoReplace,
  setPrimaryPhoto,
  uploadPetPhoto,
  uploadPetPhotoReplace,
} from '@/lib/api/petPhotos'
import { contentTypeOf, uploadToPresignedUrl, UploadTransportError } from '@/lib/api/upload'
import { ApiError } from '@/lib/api/client'
import { PhotoUploader } from '@/components/ui/PhotoUploader'
import { PET_CARD_ASPECT } from '@/components/ui/ImageCropper'
import { EmptyState } from '@/components/ui/EmptyState'
import { PillTabs } from '@/components/ui/PillTabs'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Skeleton } from '@/components/ui/Skeleton'

// Mirrors MAX_PHOTOS_PER_PET in backend/app/api/routes/pet_photos.py — the
// backend is the source of truth and rejects past this either way, this
// just avoids letting someone attempt an upload that's already guaranteed to fail.
const MAX_PHOTOS_PER_PET = 5

export function PhotosTab() {
  const queryClient = useQueryClient()
  const petsQuery = useQuery({ queryKey: ['pets', 'me'], queryFn: listMyPets })
  const pets = petsQuery.data ?? []
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null)
  const selectedPet = pets.find((p) => p.id === selectedPetId) ?? pets[0]
  const [replacingPhotoId, setReplacingPhotoId] = useState<string | null>(null)
  const [replaceError, setReplaceError] = useState<string | null>(null)
  const replaceInputRef = useRef<HTMLInputElement | null>(null)
  const replaceTargetRef = useRef<string | null>(null)

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['pets', 'me'] })
    // A photo can complete the gallery badge, or be this pet's first.
    queryClient.invalidateQueries({ queryKey: ['achievements', 'me'] })
  }

  const setPrimaryMutation = useMutation({
    mutationFn: (photoId: string) => setPrimaryPhoto(selectedPet!.id, photoId),
    onSuccess: invalidate,
  })
  const deleteMutation = useMutation({
    mutationFn: (photoId: string) => deletePetPhoto(selectedPet!.id, photoId),
    onSuccess: invalidate,
  })

  const startReplace = (photoId: string) => {
    replaceTargetRef.current = photoId
    replaceInputRef.current?.click()
  }

  const handleReplaceFile = async (file: File) => {
    const photoId = replaceTargetRef.current
    if (!photoId || !selectedPet) return
    const contentType = contentTypeOf(file)
    if (!contentType) {
      setReplaceError('Please choose a JPEG, PNG, or WebP image.')
      return
    }

    setReplaceError(null)
    setReplacingPhotoId(photoId)
    try {
      const presigned = await presignPetPhotoReplace(selectedPet.id, photoId, contentType)
      try {
        await uploadToPresignedUrl(presigned.upload_url, file, contentType)
      } catch (err) {
        // The browser never got the bytes to R2 — almost always its origin
        // missing from the bucket's exactly-matched CORS allowlist. Same
        // fallback as PhotoUploader: send them via our own API instead.
        if (!(err instanceof UploadTransportError)) throw err
        await uploadPetPhotoReplace(selectedPet.id, photoId, file)
        invalidate()
        return
      }
      await confirmPetPhotoReplace(selectedPet.id, photoId, presigned.object_key)
      invalidate()
    } catch (err) {
      setReplaceError(
        err instanceof UploadTransportError
          ? "Couldn't reach photo storage from this device. Check your connection and try again."
          : err instanceof ApiError && typeof err.detail === 'string'
            ? err.detail
            : 'Replace failed. Try again.',
      )
    } finally {
      setReplacingPhotoId(null)
      if (replaceInputRef.current) replaceInputRef.current.value = ''
    }
  }

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
      <SectionHeader
        icon={ImageIcon}
        title="Photos"
        subtitle={selectedPet ? `Managing ${selectedPet.name}'s gallery` : undefined}
        className="mb-5"
      />

      {pets.length > 1 && (
        <PillTabs
          layoutId="photos-pet-pill"
          active={selectedPet?.id ?? pets[0].id}
          onChange={setSelectedPetId}
          className="mb-5"
          tabs={pets.map((pet) => ({ key: pet.id, label: pet.name }))}
        />
      )}

      {/* No "no photos yet" empty state: the add tile occupies the grid's first
          cell and already says what to do, so a separate placeholder above it
          was just saying it twice. */}

      {/* Shared across tiles — startReplace() points it at the right photo before opening it. */}
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleReplaceFile(file)
        }}
      />

      {replaceError && <p className="mb-3 text-xs text-red-400">{replaceError}</p>}

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo) => {
          const isReplacing = replacingPhotoId === photo.id
          return (
          <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-xl border border-neutral-800">
            <img src={photo.url} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
            {photo.is_primary && (
              <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                <Star className="h-3 w-3" fill="currentColor" /> Primary
              </span>
            )}
            {isReplacing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              </div>
            )}
            {/* Always on where nothing hovers. This whole toolbar — set primary,
                replace, delete — was behind `group-hover`, so on a phone there
                was no way to reach any of it: a photo, once uploaded, could not
                be changed or removed at all. */}
            <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1.5 bg-gradient-to-t from-black/80 to-transparent p-2 transition-opacity hoverable:gap-1 hoverable:opacity-0 hoverable:group-hover:opacity-100">
              {!photo.is_primary && (
                <button
                  onClick={() => setPrimaryMutation.mutate(photo.id)}
                  disabled={isReplacing}
                  aria-label="Set as primary"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Star className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => startReplace(photo.id)}
                disabled={isReplacing}
                aria-label="Replace photo"
                title="Replace this photo"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => deleteMutation.mutate(photo.id)}
                disabled={photos.length <= 1 || isReplacing}
                aria-label="Delete photo"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white hover:bg-red-500/30 disabled:cursor-not-allowed disabled:opacity-30"
                title={photos.length <= 1 ? 'A pet needs at least one photo' : undefined}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          )
        })}

        {/* The add control is the last cell of the grid, not a bar underneath it.
            It used to be a full-width "Change photo" button below the grid that
            kept the thumbnail of whatever was uploaded last, so after adding a
            photo there was no visible way to add another: the control described
            replacing the one just added. As a tile it stays in the place your eye
            already is, and it resets itself after each upload. */}
        {selectedPet && photos.length < MAX_PHOTOS_PER_PET && (
          <PhotoUploader
            key={selectedPet.id}
            variant="tile"
            label={photos.length === 0 ? `Add a photo of ${selectedPet.name}` : 'Add another'}
            presign={(contentType) => presignPetPhoto(selectedPet.id, contentType)}
            confirm={(key) => confirmPetPhoto(selectedPet.id, key).then(() => invalidate())}
            directUpload={(file) => uploadPetPhoto(selectedPet.id, file).then(() => invalidate())}
            cropAspect={PET_CARD_ASPECT}
            cropTitle={`Frame ${selectedPet.name}'s photo`}
            cropHint="This is exactly what other owners will see on the card."
          />
        )}
      </div>

      {selectedPet && (
        <p className="text-xs text-neutral-500">
          {photos.length >= MAX_PHOTOS_PER_PET
            ? `That's the ${MAX_PHOTOS_PER_PET}-photo limit. Remove one to add another.`
            : `${photos.length} of ${MAX_PHOTOS_PER_PET} photos. The primary one is what people see first in Discover.`}
        </p>
      )}
    </div>
  )
}
