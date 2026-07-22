import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, Heart, X } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { acceptLike, getNotifications, markNotificationsRead, rejectLike } from '@/lib/api/matches'
import { PetAvatar } from '@/components/chat/PetAvatar'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'

function timeAgo(iso: string) {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function NotificationBell() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [respondingId, setRespondingId] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)

  useOnClickOutside(panelRef, () => setOpen(false))

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications(false, 100),
    enabled: isAuthenticated,
    refetchOnWindowFocus: true,
  })

  const unreadCount = (notifications ?? []).filter((n) => !n.is_read).length

  const markReadMutation = useMutation({
    mutationFn: markNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
  const acceptMutation = useMutation({
    mutationFn: acceptLike,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['matches'] })
      setOpen(false)
      navigate(`/chat?match=${result.match_id}`)
    },
    onSettled: () => setRespondingId(null),
  })
  const rejectMutation = useMutation({
    mutationFn: rejectLike,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    onSettled: () => setRespondingId(null),
  })

  if (!isAuthenticated) return null

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff6b35] px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 z-50 max-h-[28rem] w-80 overflow-y-auto rounded-2xl border border-white/10 bg-neutral-900/95 shadow-2xl shadow-black/50 backdrop-blur-xl"
          >
            <div className="border-b border-neutral-800 px-4 py-3">
              <h3 className="font-display font-bold text-white">Notifications</h3>
            </div>

            {(!notifications || notifications.length === 0) && (
              <p className="px-4 py-8 text-center text-sm text-neutral-500">You're all caught up.</p>
            )}

            <ul className="divide-y divide-neutral-800/80">
              {notifications?.map((n) => (
                <li key={n.id} className={`px-4 py-3 ${n.is_read ? 'opacity-60' : ''}`}>
                  <div className="flex items-start gap-3">
                    <PetAvatar name={n.other_pet.name} photoUrl={n.other_pet.primary_photo_url} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-neutral-200">{n.message}</p>
                      <p className="mt-0.5 text-xs text-neutral-500">{timeAgo(n.created_at)}</p>

                      {n.notification_type === 'new_like' && !n.is_read && (
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => {
                              setRespondingId(n.id)
                              acceptMutation.mutate(n.id)
                            }}
                            disabled={respondingId === n.id}
                            className="flex items-center gap-1 rounded-full bg-gradient-to-r from-[#ff6b35] to-pink-500 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                          >
                            <Heart className="h-3 w-3" fill="currentColor" /> Match back
                          </button>
                          <button
                            onClick={() => {
                              setRespondingId(n.id)
                              rejectMutation.mutate(n.id)
                            }}
                            disabled={respondingId === n.id}
                            className="flex items-center gap-1 rounded-full border border-neutral-700 px-3 py-1 text-xs font-medium text-neutral-400 disabled:opacity-50"
                          >
                            <X className="h-3 w-3" /> Pass
                          </button>
                        </div>
                      )}

                      {n.notification_type === 'new_match' && (
                        <button
                          onClick={() => {
                            if (!n.is_read) markReadMutation.mutate([n.id])
                            setOpen(false)
                            navigate(`/chat?match=${n.match_id}`)
                          }}
                          className="mt-2 text-xs font-semibold text-[#ff8c5c] hover:text-[#ff6b35]"
                        >
                          Open chat →
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
