import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, BellOff, CheckCheck, Heart, Trash2, X } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import {
  acceptLike,
  clearNotifications,
  deleteNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationsRead,
  rejectLike,
} from '@/lib/api/matches'
import { PetAvatar } from '@/components/chat/PetAvatar'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { useNotificationsStore } from '@/store/useNotificationsStore'
import { NOTIFICATION_TYPE_ACCENT, NOTIFICATION_TYPE_ICON } from './NotificationToast'

function timeAgo(iso: string) {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

/** Presentational bell + dropdown. Rendered twice (desktop nav, mobile nav —
 * see resizable-navbar.tsx, both always mounted regardless of viewport), so
 * it must not own anything that shouldn't exist twice at once: the live
 * socket connection and the toast/celebration overlays live in
 * NotificationsRuntime (mounted once) instead, shared via useNotificationsStore. */
export function NotificationBell() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const open = useNotificationsStore((s) => s.open)
  const setOpen = useNotificationsStore((s) => s.setOpen)
  const [respondingId, setRespondingId] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)

  // This component is mounted twice (desktop + mobile nav) but shares one `open`
  // flag via the store, so each copy has to treat the *other* copy's subtree as
  // "inside" too. Without that, clicking anything in the visible dropdown looked
  // like an outside click to the hidden copy, which closed the shared state on
  // mousedown — the panel unmounted before the button's onClick could ever run,
  // so every control in the dropdown appeared dead and it just snapped shut.
  useOnClickOutside(panelRef, () => setOpen(false), '[data-notifications-root]')

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
  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
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
  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
  const clearAllMutation = useMutation({
    mutationFn: clearNotifications,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  if (!isAuthenticated) return null

  return (
    <div ref={panelRef} data-notifications-root className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
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
            className="thin-scrollbar lenis-prevent-scroll absolute right-0 top-12 z-50 max-h-[28rem] w-[min(23rem,calc(100vw-1.5rem))] overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-neutral-900/95 shadow-2xl shadow-black/50 backdrop-blur-xl"
          >
            {/* Sticky so the actions stay reachable part-way down a long list.
                Everything here is nowrap: at this width the two labels used to
                wrap onto second lines and shove the check icon up against the
                title. */}
            <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-neutral-800 bg-neutral-900/95 px-4 py-3 backdrop-blur-xl">
              <h3 className="flex shrink-0 items-center gap-2 font-display font-bold text-white">
                Notifications
                {unreadCount > 0 && (
                  <span className="rounded-full bg-brand/15 px-1.5 py-px text-[11px] font-semibold leading-tight text-brand">
                    {unreadCount}
                  </span>
                )}
              </h3>
              <div className="flex shrink-0 items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllReadMutation.mutate()}
                    disabled={markAllReadMutation.isPending}
                    title="Mark all as read"
                    className="flex items-center gap-1 whitespace-nowrap rounded-lg px-1.5 py-1 text-xs font-medium text-neutral-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
                  >
                    <CheckCheck className="h-3.5 w-3.5 shrink-0" />
                    Read all
                  </button>
                )}
                {notifications && notifications.length > 0 && (
                  <button
                    onClick={() => clearAllMutation.mutate()}
                    disabled={clearAllMutation.isPending}
                    title="Clear all notifications"
                    className="flex items-center gap-1 whitespace-nowrap rounded-lg px-1.5 py-1 text-xs font-medium text-neutral-400 transition-colors hover:bg-white/5 hover:text-red-400 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5 shrink-0" />
                    Clear
                  </button>
                )}
              </div>
            </div>

            {(!notifications || notifications.length === 0) && (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <BellOff className="h-6 w-6 text-neutral-700" />
                <p className="text-sm text-neutral-400">You're all caught up.</p>
              </div>
            )}

            <ul className="divide-y divide-neutral-800/80">
              <AnimatePresence initial={false}>
                {notifications?.map((n) => {
                  const TypeIcon = NOTIFICATION_TYPE_ICON[n.notification_type]
                  return (
                  <motion.li
                    key={n.id}
                    layout
                    exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15, ease: [0.23, 1, 0.32, 1] } }}
                    className={`group relative px-4 py-3 pr-9 ${n.is_read ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        <PetAvatar name={n.other_pet.name} photoUrl={n.other_pet.primary_photo_url} size="sm" />
                        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 ring-2 ring-neutral-900">
                          <TypeIcon className={`h-2.5 w-2.5 ${NOTIFICATION_TYPE_ACCENT[n.notification_type]}`} />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-neutral-200">{n.message}</p>
                        <p className="mt-0.5 text-xs text-neutral-400">{timeAgo(n.created_at)}</p>

                        {n.notification_type === 'new_like' && !n.is_read && (
                          <div className="mt-2 flex gap-2">
                            <button
                              onClick={() => {
                                setRespondingId(n.id)
                                acceptMutation.mutate(n.id)
                              }}
                              disabled={respondingId === n.id}
                              className="flex items-center gap-1 rounded-full bg-gradient-to-r from-brand to-pink-500 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
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

                        {n.notification_type !== 'new_like' && n.match_id && (
                          <button
                            onClick={() => {
                              if (!n.is_read) markReadMutation.mutate([n.id])
                              setOpen(false)
                              navigate(`/chat?match=${n.match_id}`)
                            }}
                            className="mt-2 text-xs font-semibold text-brand-light hover:text-brand"
                          >
                            Open chat →
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Revealed on hover where there is a pointer, permanently
                        visible where there isn't. Hiding it behind `group-hover`
                        unconditionally meant that on a phone — where nothing
                        hovers — there was no way to see this control at all, let
                        alone dismiss a notification. Also a 24px target became
                        36px on touch, which is the difference between hitting it
                        and opening the notification underneath it. */}
                    <button
                      onClick={() => deleteMutation.mutate(n.id)}
                      aria-label="Dismiss notification"
                      title="Dismiss"
                      className="absolute right-2 top-2 flex h-9 w-9 touch-manipulation items-center justify-center rounded-full text-neutral-400 transition-all hover:bg-white/10 hover:text-white focus-visible:opacity-100 hoverable:top-3 hoverable:h-6 hoverable:w-6 hoverable:opacity-0 hoverable:group-hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </motion.li>
                  )
                })}
              </AnimatePresence>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
