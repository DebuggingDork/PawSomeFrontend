import { PhotoUploader } from '@/components/ui/PhotoUploader'
import { AVATAR_ASPECT } from '@/components/ui/ImageCropper'
import { confirmProfilePhoto, presignProfilePhoto } from '@/lib/api/users'

interface Props {
  currentPhotoUrl: string | null
  onDraft: (patch: { ownerPhotoUrl?: string }) => void
  onSaved: () => void
}

export function ProfilePhotoStep({ currentPhotoUrl, onDraft, onSaved }: Props) {
  return (
    <div className="space-y-5">
      <PhotoUploader
        label="Choose a photo"
        presign={presignProfilePhoto}
        confirm={(key) => confirmProfilePhoto(key).then(() => onSaved())}
        currentPhotoUrl={currentPhotoUrl}
        onLocalPreview={(url) => onDraft({ ownerPhotoUrl: url })}
        photoAlt="Your profile photo"
        variant="card"
        className="mx-auto w-full max-w-[280px]"
        cropAspect={AVATAR_ASPECT}
        cropShape="circle"
        cropTitle="Frame your photo"
        cropHint="Drag to centre your face. Pinch or use the slider to zoom."
      />
      <p className="mx-auto max-w-[38ch] text-center text-sm leading-relaxed text-neutral-400">
        Your face sits beside your pet's name on every card. Profiles with one get replied to far more often.
      </p>
    </div>
  )
}
