import { Link, useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, PawPrint, User as UserIcon } from 'lucide-react'
import { getUserProfile } from '@/lib/api/users'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { PetAvatar } from '@/components/chat/PetAvatar'

function OwnerProfilePage() {
  const { userId } = useParams<{ userId: string }>()

  const { data: owner, isLoading, isError } = useQuery({
    queryKey: ['owner', userId],
    queryFn: () => getUserProfile(userId!),
    enabled: !!userId,
  })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-6 pb-16 pt-24 md:pt-28">
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    )
  }

  if (isError || !owner) {
    return (
      <div className="mx-auto max-w-3xl px-6 pb-16 pt-24 md:pt-28">
        <EmptyState icon={UserIcon} title="Owner not found" description="This profile may have been removed." />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-6 pb-16 pt-24 md:pt-28">
      <Link to="/community" className="mb-6 inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Back to Community
      </Link>

      <div className="mb-8 flex items-center gap-4 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
        <PetAvatar name={owner.full_name ?? 'Unknown'} photoUrl={owner.profile_photo_url} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-bold text-white">{owner.full_name ?? 'Anonymous'}</h1>
          {owner.occupation && <p className="text-neutral-400">{owner.occupation}</p>}
        </div>
      </div>

      {owner.bio && <p className="mb-8 whitespace-pre-line text-neutral-300">{owner.bio}</p>}

      <h2 className="mb-4 font-display text-lg font-semibold text-white">
        {owner.full_name ? `${owner.full_name}'s pets` : 'Pets'}
      </h2>

      {owner.pets.length === 0 ? (
        <EmptyState icon={PawPrint} title="No pets yet" description="This owner hasn't added a pet profile yet." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {owner.pets.map((pet) => (
            <Link
              key={pet.id}
              to={`/pets/${pet.id}`}
              className="group overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50 transition-all hover:border-[#ff6b35]"
            >
              <div className="relative aspect-square overflow-hidden bg-neutral-800">
                {pet.primary_photo_url ? (
                  <img
                    src={pet.primary_photo_url}
                    alt={pet.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <PawPrint className="h-10 w-10 text-neutral-700" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="truncate font-semibold text-white">{pet.name}</p>
                <p className="truncate text-xs text-neutral-500">{pet.breed}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default OwnerProfilePage
