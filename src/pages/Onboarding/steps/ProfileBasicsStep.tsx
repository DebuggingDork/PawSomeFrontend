import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { updateMyProfile } from '@/lib/api/users'
import { LocationPicker } from '@/components/ui/LocationPicker'
import { Field, TextInput, ChipGroup, PrimaryAction, StepError } from '../fields'

interface Props {
  initialFullName: string
  initialOccupation: string
  initialLat: number | null
  initialLng: number | null
  initialAddress: string
  onDraft: (patch: { ownerName?: string; locality?: string }) => void
  onSaved: () => void
}

/** Covers most of what people actually type here, so the common case is one tap.
 * The list stays short on purpose: twenty options is a search problem, not a
 * shortcut. Anything missing is still free text. */
const COMMON_OCCUPATIONS = [
  'Student',
  'Software engineer',
  'Designer',
  'Teacher',
  'Doctor',
  'Veterinarian',
  'Business owner',
  'Homemaker',
] as const

export function ProfileBasicsStep({
  initialFullName,
  initialOccupation,
  initialLat,
  initialLng,
  initialAddress,
  onDraft,
  onSaved,
}: Props) {
  const [fullName, setFullName] = useState(initialFullName)
  const [occupation, setOccupation] = useState(initialOccupation)
  const [lat, setLat] = useState<number | null>(initialLat)
  const [lng, setLng] = useState<number | null>(initialLng)
  const [address, setAddress] = useState(initialAddress)
  const [pincode, setPincode] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      updateMyProfile({
        full_name: fullName.trim(),
        occupation: occupation.trim(),
        ...(lat !== null && lng !== null ? { latitude: lat, longitude: lng } : {}),
        ...(address ? { address } : {}),
        ...(pincode ? { pincode } : {}),
      }),
    onSuccess: onSaved,
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        mutation.mutate()
      }}
      className="space-y-6"
    >
      <Field label="Your name" htmlFor="ob-name">
        <TextInput
          id="ob-name"
          emphasis="lead"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value)
            onDraft({ ownerName: e.target.value })
          }}
          placeholder="Aarav Sharma"
          required
          autoFocus
          autoComplete="name"
        />
      </Field>

      <Field label="What you do" hint="shows on your pet's card">
        <div className="space-y-3">
          <ChipGroup
            options={COMMON_OCCUPATIONS}
            value={occupation}
            onSelect={(o) => setOccupation(occupation.trim().toLowerCase() === o.toLowerCase() ? '' : o)}
            ariaLabel="Common occupations"
          />
          <TextInput
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            placeholder="Or type something else"
            required
            aria-label="Occupation"
          />
        </div>
      </Field>

      <Field label="Where you're based" hint="sets how far away you look to others">
        <LocationPicker
          latitude={lat}
          longitude={lng}
          address={address}
          onChange={({ lat: nlat, lng: nlng, address: nAddress, pincode: nPincode }) => {
            setLat(nlat)
            setLng(nlng)
            if (nAddress !== undefined) {
              setAddress(nAddress)
              // The card shows "Near Kondapur", not the full postal line.
              onDraft({ locality: nAddress.split(',')[0]?.trim() ?? '' })
            }
            if (nPincode !== undefined) setPincode(nPincode)
          }}
        />
      </Field>

      {mutation.isError && <StepError>Couldn't save that. Check the fields and try again.</StepError>}

      <PrimaryAction
        type="submit"
        disabled={!fullName.trim() || !occupation.trim()}
        pending={mutation.isPending}
      >
        Continue
      </PrimaryAction>
    </form>
  )
}
