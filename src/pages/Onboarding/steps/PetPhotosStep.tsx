import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Trash2, Loader2, ImagePlus, ArrowRight } from 'lucide-react'
import { PhotoUploader } from '@/components/ui/PhotoUploader'
import { PET_CARD_ASPECT } from '@/components/ui/ImageCropper'
import {
  confirmPetPhoto,
  deletePetPhoto,
  presignPetPhoto,
  setPrimaryPhoto,
  uploadPetPhoto,
} from '@/lib/api/petPhotos'
import type { PetPhoto } from '@/lib/api/types'

// Mirrors MAX_PHOTOS_PER_PET in backend/app/api/routes/pet_photos.py.
const MAX_PHOTOS = 5

interface Props {
  petId: string
  petName: string
  photos: PetPhoto[]
  onDraft: (patch: { petPhotoUrl?: string }) => void
  /** Photos changed on the server — refresh the pet, but stay on this step. */
  onPhotosChanged: () => void
  /** The user is done here — refresh onboarding status so the wizard advances. */
  onContinue: () => void
}

/**
 * All five photo slots, right here in onboarding.
 *
 * This used to be a single-photo uploader that advanced the wizard the moment
 * one photo landed. Nobody came back later: adding more meant finding Profile,
 * then the Photos tab, then the right pet — so most cards went into Discover
 * on exactly one picture. Now the first photo is still the only required one,
 * but the other four slots are on screen at the moment the person is already
 * holding their camera roll, with delete and set-primary so a wrong pick can
 * be fixed without leaving the wizard.
 */
export function PetPhotosStep({ petId, petName, photos, onDraft, onPhotosChanged, onContinue }: Props) {
  // The id of the photo a delete/set-primary request is in flight for.
  const [busyPhotoId, setBusyPhotoId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const hasPhotos = photos.length > 0

  /** Keep the live card preview pointed at whatever is primary now. */
  const syncPreview = (url: string | undefined) => {
    if (url) onDraft({ petPhotoUrl: url })
  }

  const afterUpload = (photo: PetPhoto) => {
    setActionError(null)
    if (photo.is_primary) syncPreview(photo.url)
    onPhotosChanged()
  }

  const handleSetPrimary = async (photo: PetPhoto) => {
    setBusyPhotoId(photo.id)
    setActionError(null)
    try {
      const updated = await setPrimaryPhoto(petId, photo.id)
      syncPreview(updated.url)
      onPhotosChanged()
    } catch {
      setActionError("Couldn't set that as the main photo. Try again.")
    } finally {
      setBusyPhotoId(null)
    }
  }

  const handleDelete = async (photo: PetPhoto) => {
    setBusyPhotoId(photo.id)
    setActionError(null)
    try {
      await deletePetPhoto(petId, photo.id)
      if (photo.is_primary) {
        // The backend promotes the next photo; mirror that in the preview
        // instead of leaving it showing the picture that was just removed.
        const next = photos.filter((p) => p.id !== photo.id).sort((a, b) => a.sort_order - b.sort_order)[0]
        syncPreview(next?.url)
      }
      onPhotosChanged()
    } catch {
      setActionError("Couldn't remove that photo. Try again.")
    } finally {
      setBusyPhotoId(null)
    }
  }

  // One live add-tile; the remaining unclaimed slots render as inert outlines
  // so "there are five" is visible without five competing buttons.
  const placeholderCount = Math.max(0, MAX_PHOTOS - photos.length - 1)

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo) => {
          const isBusy = busyPhotoId === photo.id
          return (
            <div
              key={photo.id}
              className="group relative aspect-square overflow-hidden rounded-xl border border-neutral-800"
            >
              <img src={photo.url} alt={petName} className="h-full w-full object-cover" />
              {photo.is_primary && (
                <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                  <Star className="h-3 w-3" fill="currentColor" /> Main photo
                </span>
              )}
              {isBusy && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                </div>
              )}
              {/* Always visible on touch — hover-only controls are unreachable
                  on the phones most people onboard from. */}
              <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1.5 bg-gradient-to-t from-black/80 to-transparent p-2 transition-opacity hoverable:opacity-0 hoverable:group-hover:opacity-100">
                {!photo.is_primary && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(photo)}
                    disabled={isBusy}
                    aria-label="Make this the main photo"
                    title="Make this the main photo"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(photo)}
                  disabled={photos.length <= 1 || isBusy}
                  aria-label="Remove photo"
                  title={photos.length <= 1 ? `${petName} needs at least one photo` : 'Remove this photo'}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white hover:bg-red-500/30 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )
        })}

        {photos.length < MAX_PHOTOS && (
          <PhotoUploader
            variant="tile"
            label={hasPhotos ? 'Add another' : `Add a photo of ${petName}`}
            presign={(contentType) => presignPetPhoto(petId, contentType)}
            confirm={(key) => confirmPetPhoto(petId, key).then(afterUpload)}
            directUpload={(file) => uploadPetPhoto(petId, file).then(afterUpload)}
            onLocalPreview={hasPhotos ? undefined : (url) => onDraft({ petPhotoUrl: url })}
            cropAspect={PET_CARD_ASPECT}
            cropTitle={`Frame ${petName}'s photo`}
            cropHint="This is exactly what other owners will see on the card."
          />
        )}

        {Array.from({ length: placeholderCount }).map((_, i) => (
          <div
            key={`slot-${i}`}
            aria-hidden
            className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-neutral-800/70 bg-neutral-900/20"
          >
            <ImagePlus className="h-5 w-5 text-neutral-700" />
          </div>
        ))}
      </div>

      {actionError && <p className="text-xs text-red-400">{actionError}</p>}

      <p className="text-xs leading-relaxed text-neutral-500">
        {hasPhotos
          ? `${photos.length} of ${MAX_PHOTOS} photos. The main one is what other owners see first — tap the star on any photo to change it.`
          : 'The first photo is required — it is the whole first impression. The other four slots are optional but worth filling.'}
        {' '}You can also manage these later from Profile → Photos.
      </p>

      <motion.button
        type="button"
        onClick={onContinue}
        disabled={!hasPhotos}
        whileHover={hasPhotos ? { scale: 1.01 } : undefined}
        whileTap={hasPhotos ? { scale: 0.985 } : undefined}
        className="group flex w-full touch-manipulation items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff6b35] to-pink-500 px-8 py-4 font-semibold text-white shadow-lg shadow-[#ff6b35]/25 transition-shadow disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none hoverable:hover:shadow-xl hoverable:hover:shadow-[#ff6b35]/35 sm:py-3.5"
      >
        {hasPhotos ? 'Continue' : `Add at least one photo of ${petName}`}
        {hasPhotos && <ArrowRight className="h-4 w-4 transition-transform hoverable:group-hover:translate-x-0.5" />}
      </motion.button>
    </div>
  )
}
