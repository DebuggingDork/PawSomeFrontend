import { PhotoUploader } from '@/components/ui/PhotoUploader'
import { confirmProfilePhoto, presignProfilePhoto } from '@/lib/api/users'
import { SkipAction } from '../fields'

interface Props {
  currentPhotoUrl: string | null
  onDraft: (patch: { ownerPhotoUrl?: string }) => void
  onSaved: () => void
  onSkip: () => void
}

export function ProfilePhotoStep({ currentPhotoUrl, onDraft, onSaved, onSkip }: Props) {
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
        className="mx-auto max-w-[260px]"
      />
      <p className="mx-auto max-w-[38ch] text-center text-sm leading-relaxed text-neutral-400">
        Your face sits beside your pet's name on every card. Profiles with one get replied to far more often.
      </p>
      <SkipAction onClick={onSkip}>Skip for now</SkipAction>
    </div>
  )
}
