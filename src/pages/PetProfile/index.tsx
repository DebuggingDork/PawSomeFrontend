import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, PawPrint } from 'lucide-react'
import { getPet } from '@/lib/api/pets'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { PetAvatar } from '@/components/chat/PetAvatar'

function PetProfilePage() {
  const { petId } = useParams<{ petId: string }>()
  const [activePhoto, setActivePhoto] = useState<string | null>(null)

  const { data: pet, isLoading, isError } = useQuery({
    queryKey: ['pet', petId],
    queryFn: () => getPet(petId!),
    enabled: !!petId,
  })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-6 pb-16 pt-24 md:pt-28">
        <Skeleton className="mb-6 aspect-square w-full rounded-2xl md:aspect-[16/9]" />
        <Skeleton className="h-8 w-1/2 rounded-lg" />
      </div>
    )
  }

  if (isError || !pet) {
    return (
      <div className="mx-auto max-w-3xl px-6 pb-16 pt-24 md:pt-28">
        <EmptyState icon={PawPrint} title="Pet not found" description="This pet's profile may have been removed." />
      </div>
    )
  }

  const photos = pet.photos ?? []
  const heroPhoto = activePhoto ?? pet.primary_photo_url ?? null

  return (
    <div className="mx-auto max-w-3xl px-6 pb-16 pt-24 md:pt-28">
      <Link to="/community" className="mb-6 inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Back to Community
      </Link>

      <div className="mb-6 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/50">
        <div className="relative aspect-square w-full bg-neutral-800 md:aspect-[16/9]">
          {heroPhoto ? (
            <img src={heroPhoto} alt={pet.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <PawPrint className="h-20 w-20 text-neutral-700" />
            </div>
          )}
          <div className="absolute top-4 right-4 rounded-full bg-black/60 px-3 py-1.5 text-sm font-medium text-white backdrop-blur">
            {pet.species === 'dog' ? '🐕' : '🐈'} {pet.gender === 'male' ? '♂' : '♀'}
          </div>
        </div>

        {photos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto p-3">
            {photos.map((photo) => (
              <button
                key={photo.id}
                onClick={() => setActivePhoto(photo.url)}
                className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                  heroPhoto === photo.url ? 'border-[#ff6b35]' : 'border-transparent hover:border-neutral-600'
                }`}
              >
                <img src={photo.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <h1 className="font-display text-3xl font-bold text-white">{pet.name}</h1>
      <p className="mt-1 text-neutral-400">
        {pet.breed} • {Math.floor(pet.age_months / 12)} years old
      </p>

      {pet.bio && <p className="mt-4 whitespace-pre-line text-neutral-300">{pet.bio}</p>}

      {pet.owner && (
        <Link
          to={`/owners/${pet.owner.id}`}
          className="mt-6 flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 transition-colors hover:border-[#ff6b35]"
        >
          <PetAvatar name={pet.owner.full_name ?? 'Unknown'} photoUrl={pet.owner.profile_photo_url} size="md" />
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-xs uppercase tracking-wide text-neutral-500">Owner</p>
            <p className="truncate font-semibold text-white">{pet.owner.full_name ?? 'Anonymous'}</p>
            {pet.owner.occupation && <p className="truncate text-sm text-neutral-500">{pet.owner.occupation}</p>}
          </div>
        </Link>
      )}
    </div>
  )
}

export default PetProfilePage
