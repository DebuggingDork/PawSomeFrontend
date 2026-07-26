import { PhotoUploader } from '@/components/ui/PhotoUploader'
import { confirmPetPhoto, presignPetPhoto } from '@/lib/api/petPhotos'
import { SkipAction } from '../fields'

interface Props {
  petId: string
  petName: string
  currentPhotoUrl: string | null
  onDraft: (patch: { petPhotoUrl?: string }) => void
  onSaved: () => void
  onSkip: () => void
}

export function PetPhotosStep({ petId, petName, currentPhotoUrl, onDraft, onSaved, onSkip }: Props) {
  return (
    <div className="space-y-5">
      <PhotoUploader
        label={`Choose a photo of ${petName}`}
        presign={(contentType) => presignPetPhoto(petId, contentType)}
        confirm={(key) => confirmPetPhoto(petId, key).then(() => onSaved())}
        currentPhotoUrl={currentPhotoUrl}
        onLocalPreview={(url) => onDraft({ petPhotoUrl: url })}
        photoAlt={petName}
        variant="card"
        className="mx-auto max-w-[260px]"
      />
      <p className="mx-auto max-w-[38ch] text-center text-sm leading-relaxed text-neutral-400">
        This one photo is the whole first impression. Pick the one where {petName} looks completely ridiculous.
      </p>
      <SkipAction onClick={onSkip}>Skip for now</SkipAction>
    </div>
  )
}
