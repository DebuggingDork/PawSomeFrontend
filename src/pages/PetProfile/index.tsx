import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft, Heart, LogIn, PawPrint, ShieldCheck, Scissors, GraduationCap } from 'lucide-react'
import { getPet } from '@/lib/api/pets'
import { swipe as swipeApi } from '@/lib/api/matches'
import { useAuthStore } from '@/store/useAuthStore'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { PetAvatar } from '@/components/chat/PetAvatar'
import { genderMark } from '@/lib/petBadges'

function PetProfilePage() {
  const { petId } = useParams<{ petId: string }>()
  const navigate = useNavigate()
  const { isAuthenticated, user, activePet } = useAuthStore()
  const [activePhoto, setActivePhoto] = useState<string | null>(null)

  const { data: pet, isLoading, isError } = useQuery({
    queryKey: ['pet', petId],
    queryFn: () => getPet(petId!),
    enabled: !!petId,
  })

  const likeMutation = useMutation({
    mutationFn: () => swipeApi({ pet_id: activePet!.id, target_pet_id: pet!.id, action: 'like' }),
  })

  const handleMatchClick = () => {
    if (!isAuthenticated) {
      navigate('/auth')
      return
    }
    if (!activePet) {
      navigate('/onboarding')
      return
    }
    likeMutation.mutate()
  }

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
            <span aria-hidden="true">{pet.species === 'dog' ? '🐕' : '🐈'}</span>{' '}
            <span aria-hidden="true" className={`text-base ${genderMark(pet.gender).className}`}>
              {genderMark(pet.gender).glyph}
            </span>
            <span className="sr-only">
              {pet.species === 'dog' ? 'Dog' : 'Cat'}, {genderMark(pet.gender).label}
            </span>
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

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">{pet.name}</h1>
          <p className="mt-1 text-neutral-400">
            {pet.breed} • {Math.floor(pet.age_months / 12)} years old
          </p>
        </div>

        {pet.user_id !== user?.id && (
          <button
            type="button"
            onClick={handleMatchClick}
            disabled={likeMutation.isPending || likeMutation.isSuccess}
            className="flex flex-shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-[#ff6b35] to-pink-500 px-5 py-2.5 font-semibold text-white shadow-lg shadow-[#ff6b35]/30 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Heart className={`h-4 w-4 ${likeMutation.isSuccess ? 'fill-current' : ''}`} />
            {likeMutation.isSuccess ? "You're interested!" : 'Interested'}
          </button>
        )}
      </div>

      {(pet.is_vaccinated || pet.is_neutered || pet.is_trained) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {pet.is_vaccinated && (
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-800 bg-emerald-950/40 px-3 py-1 text-xs font-medium text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Vaccinated
            </span>
          )}
          {pet.is_neutered && (
            <span className="flex items-center gap-1.5 rounded-full border border-sky-800 bg-sky-950/40 px-3 py-1 text-xs font-medium text-sky-400">
              <Scissors className="h-3.5 w-3.5" />
              Neutered/Spayed
            </span>
          )}
          {pet.is_trained && (
            <span className="flex items-center gap-1.5 rounded-full border border-violet-800 bg-violet-950/40 px-3 py-1 text-xs font-medium text-violet-400">
              <GraduationCap className="h-3.5 w-3.5" />
              Trained
            </span>
          )}
        </div>
      )}

      {pet.bio && <p className="mt-4 whitespace-pre-line text-neutral-300">{pet.bio}</p>}

      {pet.owner ? (
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
      ) : (
        <Link
          to="/auth"
          className="mt-6 flex items-center gap-3 rounded-xl border border-dashed border-neutral-700 p-4 text-neutral-400 transition-colors hover:border-[#ff6b35] hover:text-white"
        >
          <LogIn className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-medium">Sign in to see the owner and start matching</span>
        </Link>
      )}
    </div>
  )
}

export default PetProfilePage
