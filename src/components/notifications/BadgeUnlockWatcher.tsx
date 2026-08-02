import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import { getMyAchievements } from '@/lib/api/achievements'
import { useAuthStore } from '@/store/useAuthStore'
import type { AchievementBadge } from '@/lib/api/types'

/**
 * Announces badges the moment they are earned, wherever the user happens to be.
 *
 * Mounted once in App alongside NotificationsRuntime, so a badge earned while
 * swiping is celebrated on the Discover page rather than waiting to be discovered
 * on the profile tab.
 *
 * Announcement is driven by diffing the earned set against what this device last
 * recorded, not by the server's `newly_earned`. That field only covers badges the
 * read itself derived, and about half of them are granted inline by the route
 * that triggers them (creating a pet, verifying an email, matching), so those
 * were already held by the time the badges endpoint looked and would never have
 * been announced at all.
 *
 * Deliberately not routed through the existing notification stack: those rows are
 * pet-to-pet (both pet ids are NOT NULL on the notifications table) and a badge
 * belongs to a person, who may not own a pet yet.
 */

const TOAST_DURATION_MS = 6500
const EASE_OUT = [0.16, 1, 0.3, 1] as const
/** Slow enough that a quiet session isn't making requests for nothing, quick
 * enough that a badge earned mid-session still feels like a reaction. Any action
 * that plausibly unlocks something also invalidates this query directly. */
const POLL_INTERVAL_MS = 90_000

/**
 * Which badges this device has already announced, per account.
 *
 * The server reports what a given read awarded, but roughly half the badges are
 * granted inline by the route that triggers them (creating a pet, verifying an
 * email, matching), so by the time the badges endpoint runs its derivation those
 * are already held and would never be announced. Diffing against what this device
 * last saw catches every grant path regardless of which one awarded it.
 *
 * Keyed by user id because localStorage outlives a sign-out on a shared machine.
 */
function seenKey(userId: string) {
  return `badges-seen:${userId}`
}

/** Null means this account has never been observed here, which is different from
 * "observed, and had no badges". */
function readSeen(userId: string): Set<string> | null {
  try {
    const raw = localStorage.getItem(seenKey(userId))
    if (raw === null) return null
    const parsed: unknown = JSON.parse(raw)
    return new Set(Array.isArray(parsed) ? parsed.map(String) : [])
  } catch {
    // Corrupt or unavailable storage (private mode, quota). Treating it as
    // "never seen" silently reseeds rather than spamming toasts.
    return null
  }
}

function writeSeen(userId: string, types: string[]) {
  try {
    localStorage.setItem(seenKey(userId), JSON.stringify([...new Set(types)]))
  } catch {
    // Not being able to remember is survivable; worst case a badge re-announces.
  }
}

function BadgeToast({ badge, onDismiss, onOpen }: { badge: AchievementBadge; onDismiss: () => void; onOpen: () => void }) {
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    const id = setTimeout(onDismiss, TOAST_DURATION_MS)
    return () => clearTimeout(id)
  }, [onDismiss])

  return (
    <motion.div
      layout
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 40, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 40, scale: 0.96 }}
      transition={{ duration: 0.45, ease: EASE_OUT }}
      className="pointer-events-auto w-[19rem] overflow-hidden rounded-2xl border border-brand/30 bg-neutral-950/95 shadow-2xl shadow-black/60"
    >
      <div className="flex items-start gap-3 p-4">
        <motion.span
          initial={shouldReduceMotion ? false : { scale: 0.3, rotate: -25 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', bounce: 0.5, duration: 0.7, delay: 0.1 }}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand/12 text-2xl"
        >
          {badge.icon}
        </motion.span>

        <button onClick={onOpen} className="min-w-0 flex-1 text-left">
          <p className="text-[11px] font-semibold tracking-wide text-brand">Badge unlocked</p>
          <p className="truncate font-display text-sm font-bold text-white">{badge.name}</p>
          <p className="mt-0.5 text-xs leading-snug text-neutral-400">{badge.description}</p>
        </button>

        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Time remaining, so the toast doesn't just vanish unexplained. */}
      {!shouldReduceMotion && (
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: TOAST_DURATION_MS / 1000, ease: 'linear' }}
          className="h-0.5 origin-left bg-gradient-to-r from-brand to-pink-500"
        />
      )}
    </motion.div>
  )
}

export function BadgeUnlockWatcher() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const userId = useAuthStore((s) => s.user?.id ?? null)
  const navigate = useNavigate()
  const [queue, setQueue] = useState<AchievementBadge[]>([])
  // Types already queued or shown, so a refetch that repeats a payload (React
  // Query serving the same cached object to a second observer, say) can't
  // announce the same badge twice within a session.
  const seenRef = useRef<Set<string>>(new Set())

  const { data } = useQuery({
    queryKey: ['achievements', 'me'],
    queryFn: getMyAchievements,
    enabled: isAuthenticated,
    staleTime: 30_000,
    refetchInterval: isAuthenticated ? POLL_INTERVAL_MS : false,
    refetchOnWindowFocus: true,
  })

  useEffect(() => {
    if (!userId || !data) return

    const earned = data.badges.filter((b) => b.earned)
    const known = readSeen(userId)

    // First sight of this account on this device: record everything silently.
    // Otherwise opening the app on a new laptop would fire a toast for every
    // badge earned since signup.
    if (known === null) {
      writeSeen(userId, earned.map((b) => b.type))
      earned.forEach((b) => seenRef.current.add(b.type))
      return
    }

    const unseen = earned.filter((b) => !known.has(b.type) && !seenRef.current.has(b.type))
    if (unseen.length === 0) return

    unseen.forEach((b) => seenRef.current.add(b.type))
    writeSeen(userId, [...known, ...unseen.map((b) => b.type)])
    setQueue((current) => [...current, ...unseen])
  }, [data, userId])

  // Nothing to reset on sign-out: App keys this component by account, so a
  // different user (or none) gets a fresh instance rather than inheriting a queue
  // of someone else's badges.
  if (!isAuthenticated || queue.length === 0) return null

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      <AnimatePresence initial={false}>
        {queue.map((badge) => (
          <BadgeToast
            key={badge.type}
            badge={badge}
            onDismiss={() => setQueue((current) => current.filter((b) => b.type !== badge.type))}
            onOpen={() => {
              setQueue((current) => current.filter((b) => b.type !== badge.type))
              navigate('/profile')
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
