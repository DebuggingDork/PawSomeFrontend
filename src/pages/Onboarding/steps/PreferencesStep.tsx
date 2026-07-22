import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ArrowRight } from 'lucide-react'
import { updateMyProfile } from '@/lib/api/users'

interface Props {
  initialBio: string
  initialAddress: string
  onSaved: () => void
  onSkip: () => void
}

export function PreferencesStep({ initialBio, initialAddress, onSaved, onSkip }: Props) {
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
      className="space-y-4"
    >
      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-300">A little about you</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          placeholder="Dog parent of 5 years, weekend hiker…"
          className="w-full resize-none rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:border-[#ff6b35] focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-300">Address</label>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Neighborhood, city"
          className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:border-[#ff6b35] focus:outline-none"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={mutation.isPending || !bio.trim()}
          className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff6b35] to-pink-500 py-3 font-semibold text-white shadow-lg shadow-[#ff6b35]/30 transition-shadow hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
        >
          {mutation.isPending ? 'Saving…' : 'Continue'}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="rounded-xl border border-neutral-800 px-5 py-3 text-sm font-medium text-neutral-400 hover:text-white"
        >
          Skip
        </button>
      </div>
    </form>
  )
}
