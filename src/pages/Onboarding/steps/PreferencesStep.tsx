import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { updateMyProfile } from '@/lib/api/users'
import { Field, TextArea, TextInput, PrimaryAction, SkipAction, StepError } from '../fields'

interface Props {
  initialBio: string
  initialAddress: string
  petName: string
  onSaved: () => void
  onSkip: () => void
}

/** Openers, not canned answers. Tapping one drops the first few words into the box
 * with the cursor after them, which gets past the blank-textarea stall without
 * writing anyone's bio for them. */
const BIO_OPENERS = [
  'We usually walk in the evenings around ',
  'First-time pet parent, still learning ',
  "Looking for playmates who don't mind ",
  'Weekend hiker, always up for ',
] as const

const MAX_BIO = 300

export function PreferencesStep({ initialBio, initialAddress, petName, onSaved, onSkip }: Props) {
  const [bio, setBio] = useState(initialBio)
  const [address, setAddress] = useState(initialAddress)

  const mutation = useMutation({
    mutationFn: () => updateMyProfile({ bio: bio.trim(), address: address.trim() }),
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
      <Field label="A little about you" htmlFor="ob-bio">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {BIO_OPENERS.map((opener) => (
              <button
                key={opener}
                type="button"
                onClick={() => setBio((current) => (current.trim() ? current : opener))}
                className="rounded-full border border-neutral-800 bg-neutral-900/60 px-3.5 py-1.5 text-left text-sm text-neutral-300 transition-colors hover:border-neutral-700 hover:text-white"
              >
                {opener.trim()}…
              </button>
            ))}
          </div>
          <TextArea
            id="ob-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, MAX_BIO))}
            rows={4}
            placeholder={`Whatever you'd want to know about someone before meeting them and ${petName || 'their pet'} at a park.`}
          />
          <p className="text-right text-xs text-neutral-500">
            {bio.length} / {MAX_BIO}
          </p>
        </div>
      </Field>

      <Field label="Neighbourhood" hint="shown as an area, never an exact address">
        <TextInput
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Kondapur, Hyderabad"
        />
      </Field>

      {mutation.isError && <StepError>Couldn't save that. Try again.</StepError>}

      <div className="space-y-1">
        <PrimaryAction type="submit" disabled={!bio.trim()} pending={mutation.isPending}>
          Finish setup
        </PrimaryAction>
        <SkipAction onClick={onSkip}>Skip, I'll write this later</SkipAction>
      </div>
    </form>
  )
}
