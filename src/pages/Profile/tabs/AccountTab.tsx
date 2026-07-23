import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Trash2, User as UserIcon } from 'lucide-react'
import {
  confirmProfilePhoto,
  deleteProfilePhoto,
  getMyProfile,
  getProfileCompletion,
  presignProfilePhoto,
  updateMyProfile,
} from '@/lib/api/users'
import { LocationPicker } from '@/components/ui/LocationPicker'
import { PhotoUploader } from '@/components/ui/PhotoUploader'
import { Skeleton } from '@/components/ui/Skeleton'

export function AccountTab() {
  const queryClient = useQueryClient()
  const profileQuery = useQuery({ queryKey: ['users', 'me'], queryFn: getMyProfile })
  const completionQuery = useQuery({ queryKey: ['users', 'completion'], queryFn: getProfileCompletion })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['users', 'me'] })
    queryClient.invalidateQueries({ queryKey: ['users', 'completion'] })
  }

  const profile = profileQuery.data
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [occupation, setOccupation] = useState(profile?.occupation ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [address, setAddress] = useState(profile?.address ?? '')
  const [lat, setLat] = useState<number | null>(profile?.latitude ?? null)
  const [lng, setLng] = useState<number | null>(profile?.longitude ?? null)
  const [dirty, setDirty] = useState(false)

  const updateMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => {
      invalidate()
      setDirty(false)
    },
  })
  const deletePhotoMutation = useMutation({ mutationFn: deleteProfilePhoto, onSuccess: invalidate })

  if (profileQuery.isLoading || !profile) {
    return <Skeleton className="h-64" />
  }

  const completion = completionQuery.data

  return (
    <div className="space-y-6">
      {completion && (
        <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-semibold text-white">Profile completion</span>
            <span className="text-neutral-400">{completion.completion_percentage}%</span>
          </div>
          <div className="mb-3 h-2 overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#ff6b35] to-pink-500 transition-all"
              style={{ width: `${completion.completion_percentage}%` }}
            />
          </div>
          {completion.suggestions.length > 0 && (
            <ul className="space-y-1 text-xs text-neutral-500">
              {completion.suggestions.map((s) => (
                <li key={s}>• {s}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div>
        <p className="mb-2 text-sm font-medium text-neutral-300">Profile photo</p>
        <div className="flex items-center gap-4">
          {profile.profile_photo_url ? (
            <img src={profile.profile_photo_url} alt="" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-800">
              <UserIcon className="h-7 w-7 text-neutral-600" />
            </div>
          )}
          <div className="flex-1">
            <PhotoUploader
              label={profile.profile_photo_url ? 'Replace photo' : 'Upload photo'}
              presign={presignProfilePhoto}
              confirm={(key) => confirmProfilePhoto(key).then(() => invalidate())}
            />
          </div>
          {profile.profile_photo_url && (
            <button
              onClick={() => deletePhotoMutation.mutate()}
              aria-label="Remove profile photo"
              className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          updateMutation.mutate({
            full_name: fullName.trim(),
            occupation: occupation.trim(),
            bio: bio.trim(),
            address: address.trim(),
            ...(lat !== null && lng !== null ? { latitude: lat, longitude: lng } : {}),
          })
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-300">Name</label>
            <input
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setDirty(true) }}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2.5 text-sm text-white focus:border-[#ff6b35] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-300">Occupation</label>
            <input
              value={occupation}
              onChange={(e) => { setOccupation(e.target.value); setDirty(true) }}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2.5 text-sm text-white focus:border-[#ff6b35] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-300">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => { setBio(e.target.value); setDirty(true) }}
            rows={3}
            className="w-full resize-none rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2.5 text-sm text-white focus:border-[#ff6b35] focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-300">Address</label>
          <input
            value={address}
            onChange={(e) => { setAddress(e.target.value); setDirty(true) }}
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2.5 text-sm text-white focus:border-[#ff6b35] focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-300">Your location</label>
          <LocationPicker
            latitude={lat}
            longitude={lng}
            onChange={(nlat, nlng) => { setLat(nlat); setLng(nlng); setDirty(true) }}
          />
        </div>

        <button
          type="submit"
          disabled={updateMutation.isPending || !dirty}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ff6b35] to-pink-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#ff6b35]/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {updateMutation.isSuccess && !dirty && <Check className="h-4 w-4" />}
          {updateMutation.isPending ? 'Saving…' : updateMutation.isSuccess && !dirty ? 'Saved' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}
