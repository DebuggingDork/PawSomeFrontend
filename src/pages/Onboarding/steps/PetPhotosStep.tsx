import { PhotoUploader } from '@/components/ui/PhotoUploader'
import { confirmPetPhoto, presignPetPhoto } from '@/lib/api/petPhotos'

interface Props {
  petId: string
  petName: string
  onSaved: () => void
}

export function PetPhotosStep({ petId, petName, onSaved }: Props) {
  return (
    <div>
      <p className="mb-4 text-sm text-neutral-400">
        Add at least one photo of {petName} — this activates their profile so they can start appearing in Discover.
      </p>
      <PhotoUploader
        label={`Upload a photo of ${petName}`}
        presign={(contentType) => presignPetPhoto(petId, contentType)}
        confirm={(key) => confirmPetPhoto(petId, key).then(() => onSaved())}
      />
    </div>
  )
}
