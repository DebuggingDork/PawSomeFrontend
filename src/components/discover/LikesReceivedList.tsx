import { motion } from 'framer-motion'
import { Heart, Star, X } from 'lucide-react'
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
      {likes.map((like, i) => {
        const isResponding = respondingId === like.id
        return (
          <motion.li
            key={like.id}
            initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.4, delay: i * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={
              like.is_super
                ? 'relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-400 bg-[size:200%_auto] p-[1.5px] animate-gradient-pan'
                : ''
            }
          >
            <div
              className={`flex items-center gap-3 rounded-2xl p-3 ${
                like.is_super ? 'bg-neutral-950' : 'border border-neutral-800/80 bg-neutral-900/60'
              }`}
            >
              <div className="relative flex-shrink-0">
                <PetAvatar name={like.other_pet.name} photoUrl={like.other_pet.primary_photo_url} size="lg" />
                {like.is_super && (
                  <motion.span
                    className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-sky-400 ring-2 ring-neutral-950"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Star className="h-2.5 w-2.5 text-neutral-950" fill="currentColor" />
                  </motion.span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate font-semibold text-white">
                  {like.other_pet.name}
                  {like.is_super && (
                    <span className="rounded-full bg-sky-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-300">
                      Super Woof
                    </span>
                  )}
                </p>
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
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand to-pink-500 text-white shadow-md shadow-brand/30 transition-transform hoverable:hover:scale-105 active:scale-95 disabled:opacity-40"
              >
                <Heart className="h-4 w-4" fill="currentColor" />
              </button>
            </div>
          </motion.li>
        )
      })}
    </ul>
  )
}
