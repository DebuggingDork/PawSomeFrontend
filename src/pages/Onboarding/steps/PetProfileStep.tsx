import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { createPet } from '@/lib/api/pets'
import { LocationPicker } from '@/components/ui/LocationPicker'
import { formatAgeLong } from '@/lib/formatAge'
import { useIsTouchDevice } from '@/hooks/useMediaQuery'
import type { Pet } from '@/lib/api/types'
import {
  Field,
  TextInput,
  TextArea,
  ChipGroup,
  SegmentedChoice,
  PrimaryAction,
  StepActions,
  StepError,
} from '../fields'

interface Props {
  initialLat: number | null
  initialLng: number | null
  initialAddress: string
  onDraft: (patch: {
    petName?: string
    species?: string
    breed?: string
    ageMonths?: number | null
    gender?: 'male' | 'female'
  }) => void
  onSaved: (pet: Pet) => void
}

const SPECIES = [
  { value: 'dog', label: 'Dog', glyph: '🐕' },
  { value: 'cat', label: 'Cat', glyph: '🐈' },
  { value: 'rabbit', label: 'Rabbit', glyph: '🐇' },
  { value: 'bird', label: 'Bird', glyph: '🦜' },
  { value: 'other', label: 'Other', glyph: '🐾' },
] as const

type Species = (typeof SPECIES)[number]['value']

/** Breed shortcuts, weighted toward what's actually common in Indian cities rather
 * than what tops a global kennel-club list. */
const BREED_SUGGESTIONS: Record<Species, readonly string[]> = {
  dog: ['Indie', 'Labrador Retriever', 'Golden Retriever', 'German Shepherd', 'Beagle', 'Pug', 'Shih Tzu'],
  cat: ['Indian Billi', 'Persian', 'Siamese', 'Bombay', 'Maine Coon'],
  rabbit: ['Mini Lop', 'Dutch', 'Angora', 'Lionhead'],
  bird: ['Budgerigar', 'Cockatiel', 'Lovebird', 'African Grey'],
  other: ['Hamster', 'Guinea pig', 'Turtle', 'Fish'],
}

const AGE_MAX_MONTHS = 240
const AGE_DEFAULT_MONTHS = 24

export function PetProfileStep({ initialLat, initialLng, initialAddress, onDraft, onSaved }: Props) {
  // See ProfileBasicsStep: focusing on mount is hostile on a phone.
  const isTouch = useIsTouchDevice()
  const [name, setName] = useState('')
  const [species, setSpecies] = useState<Species>('dog')
  const [breed, setBreed] = useState('')
  // Null until the slider is actually touched. A pre-filled age would sail through
  // validation and quietly make every new pet exactly two years old.
  const [ageMonths, setAgeMonths] = useState<number | null>(null)
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [bio, setBio] = useState('')
  const [lat, setLat] = useState<number | null>(initialLat)
  const [lng, setLng] = useState<number | null>(initialLng)
  const [address, setAddress] = useState(initialAddress)
  const [pincode, setPincode] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      createPet({
        name: name.trim(),
        species,
        breed: breed.trim(),
        age_months: ageMonths ?? AGE_DEFAULT_MONTHS,
        gender,
        bio: bio.trim() || undefined,
        lat: lat ?? 0,
        lng: lng ?? 0,
        address: address.trim() || undefined,
        pincode: pincode.trim() || undefined,
      }),
    onSuccess: onSaved,
  })

  // Named so the disabled button can say what it is waiting for. On a phone the
  // form is three screens tall, so "Create" being greyed out is a dead end
  // unless something points back up at the field that isn't filled in — the
  // location one in particular is easy to scroll straight past.
  const missing = [
    !name.trim() && 'a name',
    !breed.trim() && 'a breed',
    ageMonths === null && 'an age',
    (lat === null || lng === null) && 'a location',
  ].filter((x): x is string => typeof x === 'string')
  const canSubmit = missing.length === 0

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        mutation.mutate()
      }}
      className="space-y-6"
    >
      <Field label="Their name" htmlFor="ob-pet-name">
        <TextInput
          id="ob-pet-name"
          emphasis="lead"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            onDraft({ petName: e.target.value })
          }}
          placeholder="Mowgli"
          required
          autoFocus={!isTouch}
        />
      </Field>

      <Field label="What are they">
        <div className="flex flex-wrap gap-2">
          {SPECIES.map((option) => {
            const selected = species === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setSpecies(option.value)
                  setBreed('')
                  onDraft({ species: option.value, breed: '' })
                }}
                aria-pressed={selected}
                // `basis` rather than a min-width: five tiles then settle into a
                // clean 3 + 2 on a phone instead of a 3 + 2 where the last row's
                // tiles are half again as wide as the first row's.
                className={`flex flex-1 basis-[5rem] touch-manipulation flex-col items-center gap-1.5 rounded-2xl border px-3 py-3.5 transition-colors ${
                  selected
                    ? 'border-[#ff6b35] bg-[#ff6b35]/12'
                    : 'border-neutral-800 bg-neutral-900/60 hoverable:hover:border-neutral-700'
                }`}
              >
                <span aria-hidden className="text-2xl leading-none">
                  {option.glyph}
                </span>
                <span className={`text-xs font-medium ${selected ? 'text-white' : 'text-neutral-400'}`}>
                  {option.label}
                </span>
              </button>
            )
          })}
        </div>
      </Field>

      <Field label="Breed">
        <div className="space-y-3">
          <ChipGroup
            options={BREED_SUGGESTIONS[species]}
            value={breed}
            onSelect={(b) => {
              const next = breed.trim().toLowerCase() === b.toLowerCase() ? '' : b
              setBreed(next)
              onDraft({ breed: next })
            }}
            ariaLabel="Common breeds"
          />
          <TextInput
            value={breed}
            onChange={(e) => {
              setBreed(e.target.value)
              onDraft({ breed: e.target.value })
            }}
            placeholder="Or type the breed"
            required
            aria-label="Breed"
          />
        </div>
      </Field>

      <Field label="Age">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 px-4 py-4">
          <p
            className={`mb-3 font-display text-xl font-bold ${
              ageMonths === null ? 'text-neutral-500' : 'text-white'
            }`}
            aria-live="polite"
          >
            {ageMonths === null ? 'Drag to set their age' : formatAgeLong(ageMonths)}
          </p>
          <input
            type="range"
            min={1}
            max={AGE_MAX_MONTHS}
            step={1}
            value={ageMonths ?? AGE_DEFAULT_MONTHS}
            onChange={(e) => {
              const next = Number(e.target.value)
              setAgeMonths(next)
              onDraft({ ageMonths: next })
            }}
            aria-label="Age in months"
            aria-valuetext={ageMonths === null ? 'not set' : formatAgeLong(ageMonths)}
            // `range-touch` grows the thumb to a fingertip (see index.css).
            // `lenis-prevent-scroll` stops the smooth-scroll layer from claiming
            // the touch and scrolling the page instead of moving the handle.
            className="range-touch lenis-prevent-scroll accent-[#ff6b35]"
          />
          <div className="mt-1.5 flex justify-between text-xs text-neutral-500">
            <span>1 month</span>
            <span>20 years</span>
          </div>
        </div>
      </Field>

      <Field label="Gender">
        <SegmentedChoice
          options={[
            { value: 'male', label: 'Male', glyph: '♂' },
            { value: 'female', label: 'Female', glyph: '♀' },
          ]}
          value={gender}
          onChange={(g) => {
            setGender(g)
            onDraft({ gender: g })
          }}
          ariaLabel="Gender"
        />
      </Field>

      <Field label="A line about them" hint="optional">
        <TextArea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={2}
          placeholder="Terrified of the vacuum, fearless with autos."
          maxLength={280}
        />
      </Field>

      <Field label="Where they walk" hint="decides who sees them">
        <LocationPicker
          latitude={lat}
          longitude={lng}
          address={address}
          onChange={({ lat: nlat, lng: nlng, address: nAddress, pincode: nPincode }) => {
            setLat(nlat)
            setLng(nlng)
            if (nAddress !== undefined) setAddress(nAddress)
            if (nPincode !== undefined) setPincode(nPincode)
          }}
        />
      </Field>

      {mutation.isError && <StepError>Couldn't create that profile. Check the details and try again.</StepError>}

      <StepActions>
        <PrimaryAction type="submit" disabled={!canSubmit} pending={mutation.isPending} pendingLabel="Creating">
          Create {name.trim() || 'their'}{name.trim() ? "'s profile" : ' profile'}
        </PrimaryAction>
        {!canSubmit && (
          <p className="text-center text-xs text-neutral-500">
            Still needs {missing.slice(0, -1).join(', ')}
            {missing.length > 1 ? ' and ' : ''}
            {missing[missing.length - 1]}.
          </p>
        )}
      </StepActions>
    </form>
  )
}
