import { PhotoUploader } from '@/components/ui/PhotoUploader'
import { confirmProfilePhoto, presignProfilePhoto } from '@/lib/api/users'

interface Props {
  onSaved: () => void
  onSkip: () => void
}

export function ProfilePhotoStep({ onSaved, onSkip }: Props) {
  return (
    <div>
      <p className="mb-4 text-sm text-neutral-400">
        A real photo builds trust with other pet owners before you match.
      </p>
      <PhotoUploader
        label="Upload your photo"
        presign={presignProfilePhoto}
        confirm={(key) => confirmProfilePhoto(key).then(() => onSaved())}
        onSkip={onSkip}
        variant="card"
        className="mx-auto max-w-[220px]"
      />
    </div>
  )
}
