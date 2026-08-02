import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart, Sparkles, MessageCircle, CalendarClock, CalendarCheck } from 'lucide-react'
import { PetAvatar } from '@/components/chat/PetAvatar'
import type { NotificationPushEvent } from '@/lib/api/types'

const TOAST_DURATION_MS = 5000

/** Shared per-type styling — also used by NotificationBell's dropdown rows
 * so a "new match" (say) looks the same whether it's in a toast or the list. */
export const NOTIFICATION_TYPE_ICON = {
  new_like: Heart,
  new_match: Sparkles,
  new_message: MessageCircle,
  playdate_proposed: CalendarClock,
  playdate_response: CalendarCheck,
}

export const NOTIFICATION_TYPE_ACCENT = {
  new_like: 'text-brand',
  new_match: 'text-pink-400',
  new_message: 'text-sky-400',
  playdate_proposed: 'text-amber-400',
  playdate_response: 'text-emerald-400',
}

const TOAST_LABELS = {
  new_match: "It's a match",
  new_like: 'New like',
  new_message: 'New message',
  playdate_proposed: 'Playdate proposed',
  playdate_response: 'Playdate update',
} as const

export interface ToastItem {
  id: string
  event: NotificationPushEvent
}

interface NotificationToastStackProps {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
  onClick: (event: NotificationPushEvent) => void
}

function Toast({ toast, onDismiss, onClick }: { toast: ToastItem; onDismiss: (id: string) => void; onClick: (event: NotificationPushEvent) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), TOAST_DURATION_MS)
    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  const { data } = toast.event
  const Icon = NOTIFICATION_TYPE_ICON[data.notification_type]

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onClick={() => onClick(toast.event)}
      className="flex w-80 items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/95 p-4 text-left shadow-2xl shadow-black/50 transition-transform hoverable:hover:-translate-y-0.5"
    >
      <PetAvatar name={data.other_pet.name} photoUrl={data.other_pet.primary_photo_url} size="md" />
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center gap-1.5">
          <Icon className={`h-3.5 w-3.5 ${NOTIFICATION_TYPE_ACCENT[data.notification_type]}`} />
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
            {TOAST_LABELS[data.notification_type]}
          </span>
        </div>
        <p className="truncate text-sm text-neutral-200">{data.message}</p>
      </div>
    </motion.button>
  )
}

/** Fixed bottom-right stack of transient notification toasts, driven by the
 * live notifications WebSocket (see NotificationBell, which owns the
 * connection and feeds events in here). */
export function NotificationToastStack({ toasts, onDismiss, onClick }: NotificationToastStackProps) {
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex flex-col-reverse gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onDismiss={onDismiss} onClick={onClick} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
