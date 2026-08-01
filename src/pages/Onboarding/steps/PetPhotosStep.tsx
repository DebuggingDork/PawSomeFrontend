import { PhotoUploader } from '@/components/ui/PhotoUploader'
import { PET_CARD_ASPECT } from '@/components/ui/ImageCropper'
import { confirmPetPhoto, presignPetPhoto, uploadPetPhoto } from '@/lib/api/petPhotos'

interface Props {
  petId: string
  petName: string
  currentPhotoUrl: string | null
  onDraft: (patch: { petPhotoUrl?: string }) => void
  onSaved: () => void
}

export function PetPhotosStep({ petId, petName, currentPhotoUrl, onDraft, onSaved }: Props) {
  return (
    <div className="space-y-5">
      <PhotoUploader
        label={`Choose a photo of ${petName}`}
        presign={(contentType) => presignPetPhoto(petId, contentType)}
        confirm={(key) => confirmPetPhoto(petId, key).then(() => onSaved())}
        directUpload={(file) => uploadPetPhoto(petId, file).then(() => onSaved())}
        currentPhotoUrl={currentPhotoUrl}
        onLocalPreview={(url) => onDraft({ petPhotoUrl: url })}
        photoAlt={petName}
        variant="card"
        className="mx-auto w-full max-w-[280px]"
        cropAspect={PET_CARD_ASPECT}
        cropTitle={`Frame ${petName}'s photo`}
        cropHint="This is exactly what other owners will see on the card."
      />
      <p className="mx-auto max-w-[38ch] text-center text-sm leading-relaxed text-neutral-400">
        This one photo is the whole first impression. Pick the one where {petName} looks completely ridiculous.
      </p>
    </div>
  )
}
