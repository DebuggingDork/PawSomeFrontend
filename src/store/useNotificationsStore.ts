import { create } from 'zustand'
import type { NotificationPushEvent } from '@/lib/api/types'

export interface ToastItem {
  id: string
  event: NotificationPushEvent
}

export interface ConfettiPieceSpec {
  id: number
  left: number
  color: string
  size: number
  delay: number
  duration: number
  drift: number
  rotate: number
}

const CONFETTI_COLORS = ['#ff6b35', '#ec4899', '#38bdf8', '#fbbf24', '#34d399']
const CONFETTI_COUNT = 28

/** Math.random() can't run during React's render phase (not even inside
 * useMemo — render must stay pure), so the celebration's confetti burst is
 * rolled here instead: this only ever runs from an event handler (the
 * WebSocket push callback), never from a component body. */
function generateConfetti(): ConfettiPieceSpec[] {
  return Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 6 + Math.random() * 7,
    delay: Math.random() * 0.35,
    duration: 1.8 + Math.random() * 1.2,
    drift: (Math.random() - 0.5) * 160,
    rotate: (Math.random() - 0.5) * 540,
  }))
}

export interface MatchCelebrationData {
  matchId: string | null
  otherPet: { id: string; name: string; primary_photo_url: string | null }
  confetti: ConfettiPieceSpec[]
}

interface NotificationsUiState {
  /** Whether the (single, shared) notification dropdown is open — the desktop
   * and mobile bells both render off this same flag instead of each other's
   * own local state, since only one of them is ever visible at a time. */
  open: boolean
  toasts: ToastItem[]
  celebration: MatchCelebrationData | null
  setOpen: (open: boolean) => void
  addToast: (toast: ToastItem) => void
  dismissToast: (id: string) => void
  showCelebration: (data: Omit<MatchCelebrationData, 'confetti'>) => void
  dismissCelebration: () => void
}

export const useNotificationsStore = create<NotificationsUiState>((set) => ({
  open: false,
  toasts: [],
  celebration: null,

  setOpen: (open) => set({ open }),

  addToast: (toast) => set((s) => ({ toasts: [...s.toasts, toast] })),

  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  showCelebration: (data) => set({ celebration: { ...data, confetti: generateConfetti() } }),

  dismissCelebration: () => set({ celebration: null }),
}))
