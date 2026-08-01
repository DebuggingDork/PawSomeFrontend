import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Briefcase, MapPin, Sparkles, Trash2, User as UserIcon } from 'lucide-react'
import {
  confirmProfilePhoto,
  deleteProfilePhoto,
  getMyProfile,
  getProfileCompletion,
  presignProfilePhoto,
  updateMyProfile,
  uploadProfilePhoto,
} from '@/lib/api/users'
import { LocationPicker } from '@/components/ui/LocationPicker'
import { PhotoUploader } from '@/components/ui/PhotoUploader'
import { AVATAR_ASPECT } from '@/components/ui/ImageCropper'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import type { UserProfile } from '@/lib/api/types'

const BIO_MAX_LENGTH = 2000

const PROFILE_TIPS = [
  {
    icon: UserIcon,
    title: 'Add a clear profile photo',
    description: 'Helps other pet parents recognize and trust you.',
  },
  {
    icon: Sparkles,
    title: 'Write a warm bio',
    description: 'Share a bit about yourself and your pet’s personality.',
  },
  {
    icon: MapPin,
    title: 'Add your location',
    description: 'Helps nearby pet parents find you.',
  },
]

const inputClass =
  'w-full rounded-xl border border-neutral-800 bg-neutral-950/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-neutral-500 transition-colors focus:border-[#ff6b35] focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/30'
const iconPrefixClass = 'pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500'

export function AccountTab() {
  const queryClient = useQueryClient()
  const profileQuery = useQuery({ queryKey: ['users', 'me'], queryFn: getMyProfile })
  const completionQuery = useQuery({ queryKey: ['users', 'completion'], queryFn: getProfileCompletion })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['users', 'me'] })
    queryClient.invalidateQueries({ queryKey: ['users', 'completion'] })
    // Name, bio, location and photo each carry a badge of their own.
    queryClient.invalidateQueries({ queryKey: ['achievements', 'me'] })
  }

  if (profileQuery.isLoading || !profileQuery.data) {
    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  const profile = profileQuery.data
  const completion = completionQuery.data

  return (
    <div className="space-y-6">
      {completion && (
        <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff6b35] to-pink-500 shadow-lg shadow-[#ff6b35]/20">
                <Sparkles className="h-5 w-5 text-white" />
              </span>
              <div>
                <p className="font-semibold text-white">Profile completion</p>
                <p className="text-sm text-neutral-400">Complete your profile to get more matches</p>
              </div>
            </div>
            <span className="font-display text-lg font-bold text-[#ff6b35]">
              {completion.completion_percentage}% Complete
            </span>
          </div>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#ff6b35] to-pink-500 transition-all duration-500"
              style={{ width: `${completion.completion_percentage}%` }}
            />
          </div>
          {completion.suggestions.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-neutral-400">
              {completion.suggestions.map((s) => (
                <li key={s}>• {s}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Keyed so the form re-seeds from scratch if the signed-in account changes. */}
      <AccountForm key={profile.id} profile={profile} invalidate={invalidate} />
    </div>
  )
}

/**
 * The editable half of the Account tab.
 *
 * Split into its own component deliberately. It seeds every field from
 * `profile` in useState initialisers, which only run on mount — and this used
 * to live inside AccountTab, where it mounted while the profile query was still
 * loading. Every field therefore initialised to '' and kept that empty value
 * forever, because useState ignores a changed initial argument on later
 * renders. The result was a fully-populated account rendering a blank name,
 * occupation, bio, address and pincode. AccountTab now holds this back behind
 * its loading check, so these initialisers always see real data.
 */
function AccountForm({
  profile,
  invalidate,
}: {
  profile: UserProfile
  invalidate: () => void
}) {
  const [fullName, setFullName] = useState(profile.full_name ?? '')
  const [occupation, setOccupation] = useState(profile.occupation ?? '')
  const [bio, setBio] = useState(profile.bio ?? '')
  const [address, setAddress] = useState(profile.address ?? '')
  const [pincode, setPincode] = useState(profile.pincode ?? '')
  const [lat, setLat] = useState<number | null>(profile.latitude ?? null)
  const [lng, setLng] = useState<number | null>(profile.longitude ?? null)
  const [dirty, setDirty] = useState(false)
  // Bumped on removal to remount the uploader. It holds an object URL for any
  // file picked in this session, which would otherwise keep displaying a photo
  // the user had just deleted.
  const [photoUploaderKey, setPhotoUploaderKey] = useState(0)

  const updateMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => {
      invalidate()
      setDirty(false)
    },
  })
  const deletePhotoMutation = useMutation({
    mutationFn: deleteProfilePhoto,
    onSuccess: () => {
      invalidate()
      setPhotoUploaderKey((k) => k + 1)
    },
  })

  return (
      <form
        onSubmit={(e) => {
          e.preventDefault()
          updateMutation.mutate({
            full_name: fullName.trim(),
            occupation: occupation.trim(),
            bio: bio.trim(),
            address: address.trim(),
            pincode: pincode.trim(),
            ...(lat !== null && lng !== null ? { latitude: lat, longitude: lng } : {}),
          })
        }}
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          {/* Left column */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-4 sm:p-6">
              <p className="mb-4 text-sm font-semibold text-white">Profile photo</p>
              <PhotoUploader
                key={photoUploaderKey}
                label="Upload a profile photo"
                presign={presignProfilePhoto}
                confirm={(key) => confirmProfilePhoto(key).then(() => invalidate())}
                directUpload={(file) => uploadProfilePhoto(file).then(() => invalidate())}
                variant="card"
                className="mx-auto max-w-[180px]"
                currentPhotoUrl={profile.profile_photo_url}
                photoAlt="Your profile photo"
                cropAspect={AVATAR_ASPECT}
                cropShape="circle"
                cropTitle="Frame your photo"
                cropHint="Drag to centre your face. Zoom in if you're far away."
              />
              {profile.profile_photo_url && (
                <button
                  type="button"
                  onClick={() => deletePhotoMutation.mutate()}
                  disabled={deletePhotoMutation.isPending}
                  className="mx-auto mt-3 flex items-center gap-1.5 text-xs font-medium text-neutral-500 transition-colors hover:text-red-400 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {deletePhotoMutation.isPending ? 'Removing…' : 'Remove photo'}
                </button>
              )}
              <p className="mt-3 text-center text-xs text-neutral-500">JPEG, PNG or WebP. Max 5MB.</p>
            </div>

            <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-4 sm:p-6">
              <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                <Sparkles className="h-4 w-4 text-[#ff6b35]" />
                Tips for a great profile
              </p>
              <ul className="space-y-4">
                {PROFILE_TIPS.map((tip) => (
                  <li key={tip.title} className="flex items-start gap-3">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#ff6b35]/10 text-[#ff6b35]">
                      <tip.icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white">{tip.title}</p>
                      <p className="text-xs text-neutral-400">{tip.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-4 sm:p-6">
              <SectionHeader icon={UserIcon} title="Personal information" className="mb-5" />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-300">Name</label>
                  <div className="relative">
                    <UserIcon className={iconPrefixClass} />
                    <input
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value)
                        setDirty(true)
                      }}
                      placeholder="Your name"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-300">Occupation</label>
                  <div className="relative">
                    <Briefcase className={iconPrefixClass} />
                    <input
                      value={occupation}
                      onChange={(e) => {
                        setOccupation(e.target.value)
                        setDirty(true)
                      }}
                      placeholder="What do you do?"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-medium text-neutral-300">Bio</label>
                <div className="relative">
                  <textarea
                    value={bio}
                    onChange={(e) => {
                      setBio(e.target.value.slice(0, BIO_MAX_LENGTH))
                      setDirty(true)
                    }}
                    maxLength={BIO_MAX_LENGTH}
                    rows={4}
                    placeholder="Tell others about yourself and your pet…"
                    className="w-full resize-none rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2.5 pb-6 text-sm text-white placeholder:text-neutral-500 transition-colors focus:border-[#ff6b35] focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/30"
                  />
                  <span className="pointer-events-none absolute bottom-2.5 right-3.5 text-xs text-neutral-600">
                    {bio.length}/{BIO_MAX_LENGTH}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-4 sm:p-6">
              <SectionHeader icon={MapPin} title="Location" subtitle="Visible to matches" className="mb-5" />

              <LocationPicker
                latitude={lat}
                longitude={lng}
                address={address}
                onChange={({ lat: nlat, lng: nlng, address: nAddress, pincode: nPincode }) => {
                  setLat(nlat)
                  setLng(nlng)
                  if (nAddress !== undefined) setAddress(nAddress)
                  if (nPincode !== undefined) setPincode(nPincode)
                  setDirty(true)
                }}
              />

              <div className="mt-3">
                <label className="mb-1.5 block text-sm font-medium text-neutral-300">Pincode</label>
                <input
                  value={pincode}
                  onChange={(e) => {
                    setPincode(e.target.value)
                    setDirty(true)
                  }}
                  placeholder="Auto-filled from location"
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 transition-colors focus:border-[#ff6b35] focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/30"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={updateMutation.isPending || !dirty}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff6b35] to-pink-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#ff6b35]/30 transition-all hover:shadow-xl hover:shadow-[#ff6b35]/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          {updateMutation.isPending ? 'Saving…' : updateMutation.isSuccess && !dirty ? 'Saved' : 'Save changes'}
        </button>
      </form>
  )
}
