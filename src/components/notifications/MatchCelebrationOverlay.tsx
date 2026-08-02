import { useEffect } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Heart, MessageCircle, X } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { PetAvatar } from '@/components/chat/PetAvatar'
import type { ConfettiPieceSpec, MatchCelebrationData } from '@/store/useNotificationsStore'

function Confetti({ pieces }: { pieces: ConfettiPieceSpec[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: '-10vh', x: 0, opacity: 1, rotate: 0 }}
          animate={{ y: '110vh', x: p.drift, opacity: [1, 1, 0], rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: [0.4, 0, 0.6, 1] }}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: 0,
            width: p.size,
            height: p.size * 0.4,
            backgroundColor: p.color,
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  )
}

interface MatchCelebrationOverlayProps {
  data: MatchCelebrationData | null
  onDismiss: () => void
  onOpenChat: (matchId: string) => void
}

/** Full-screen "it's a match" takeover — mounted once at the app root (see
 * NotificationsRuntime) so it fires regardless of which page either matched
 * user is currently on, as long as they're signed in and connected. */
export function MatchCelebrationOverlay({ data, onDismiss, onOpenChat }: MatchCelebrationOverlayProps) {
  // The pet that actually matched, not whichever pet happens to be active.
  const pets = useAuthStore((s) => s.pets)
  const activePet = useAuthStore((s) => s.activePet)
  const yourPet = pets.find((p) => p.id === data?.yourPetId) ?? activePet
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (!data) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [data, onDismiss])

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="It's a match"
          className="fixed inset-0 z-[200] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            aria-label="Dismiss"
            onClick={onDismiss}
            className="absolute inset-0 bg-neutral-950/85 backdrop-blur-sm"
          />

          {!shouldReduceMotion && data && <Confetti pieces={data.confetti} />}

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.25 }}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/95 p-8 text-center shadow-2xl shadow-black/60"
          >
            <button
              onClick={onDismiss}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Ambient glow behind the avatars */}
            <div className="relative mx-auto mb-6 flex h-28 items-center justify-center">
              <motion.div
                aria-hidden
                className="absolute h-40 w-40 rounded-full bg-gradient-to-br from-brand to-pink-500 blur-3xl"
                animate={shouldReduceMotion ? { opacity: 0.35 } : { opacity: [0.25, 0.5, 0.25] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              />

              <div className="relative flex items-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, x: 10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ delay: 0.1, type: 'spring', duration: 0.45, bounce: 0.3 }}
                  className="relative z-10 -mr-3"
                >
                  <PetAvatar name={yourPet?.name ?? 'You'} photoUrl={yourPet?.primary_photo_url} size="xl" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', duration: 0.5, bounce: 0.55 }}
                  className="relative z-20 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-brand to-pink-500 shadow-lg shadow-pink-500/40 ring-4 ring-neutral-900"
                >
                  <Heart className="h-5 w-5 text-white" fill="currentColor" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.85, x: -10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ delay: 0.1, type: 'spring', duration: 0.45, bounce: 0.3 }}
                  className="relative z-10 -ml-3"
                >
                  <PetAvatar name={data?.otherPet.name ?? ''} photoUrl={data?.otherPet.primary_photo_url} size="xl" />
                </motion.div>
              </div>
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="font-display text-3xl font-extrabold text-white"
            >
              It&apos;s a match!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="mt-2 text-sm text-neutral-400"
            >
              You and <span className="font-semibold text-neutral-200">{data?.otherPet.name}</span> both said woof.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.3 }}
              className="mt-7 flex flex-col gap-2.5"
            >
              <button
                onClick={() => data?.matchId && onOpenChat(data.matchId)}
                disabled={!data?.matchId}
                className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand to-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-transform hoverable:hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <MessageCircle className="h-4 w-4" />
                Send a message
              </button>
              <button
                onClick={onDismiss}
                className="rounded-full border border-neutral-700 px-5 py-3 text-sm font-medium text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white"
              >
                Keep browsing
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
