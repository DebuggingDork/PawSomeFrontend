import { Heart, X } from 'lucide-react'
import { PetAvatar } from '@/components/chat/PetAvatar'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import type { NotificationWithDetails } from '@/lib/api/types'

interface LikesReceivedListProps {
  likes: NotificationWithDetails[]
  isLoading: boolean
  onAccept: (notificationId: string) => void
  onReject: (notificationId: string) => void
  respondingId: string | null
}

export function LikesReceivedList({ likes, isLoading, onAccept, onReject, respondingId }: LikesReceivedListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    )
  }

  if (likes.length === 0) {
    return <EmptyState icon={Heart} title="No likes yet" description="Pets that like you will show up here." />
  }

  return (
    <ul className="space-y-3">
      {likes.map((like) => {
        const isResponding = respondingId === like.id
        return (
          <li
            key={like.id}
            className="flex items-center gap-3 rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-3"
          >
            <PetAvatar name={like.other_pet.name} photoUrl={like.other_pet.primary_photo_url} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-white">{like.other_pet.name}</p>
              <p className="truncate text-xs text-neutral-500">liked {like.your_pet.name}</p>
            </div>
            <button
              onClick={() => onReject(like.id)}
              disabled={isResponding}
              aria-label="Pass"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-800 text-neutral-400 transition-colors hover:text-red-400 disabled:opacity-40"
            >
              <X className="h-4 w-4" />
            </button>
            <button
              onClick={() => onAccept(like.id)}
              disabled={isResponding}
              aria-label="Match back"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#ff6b35] to-pink-500 text-white shadow-md shadow-[#ff6b35]/30 disabled:opacity-40"
            >
              <Heart className="h-4 w-4" fill="currentColor" />
            </button>
          </li>
        )
      })}
    </ul>
  )
}
