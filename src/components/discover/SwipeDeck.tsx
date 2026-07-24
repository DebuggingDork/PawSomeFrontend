import { useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Heart, X, Undo2, Star } from 'lucide-react'
import { SwipeCardContent } from './SwipeCard'
import type { BrowseCandidate } from '@/lib/api/types'

const SWIPE_THRESHOLD = 120
const VISIBLE_CARDS = 3

type SwipeAction = 'like' | 'skip' | 'super_like'

// Where a card flies to as it leaves — sideways for like/skip, straight up
// (with a shrink) for a Super Woof so it reads as something special.
const EXIT_VARIANTS: Record<SwipeAction, Record<string, number>> = {
  like: { x: 520, y: -40, rotate: 18, opacity: 0 },
  skip: { x: -520, y: -40, rotate: -18, opacity: 0 },
  super_like: { y: -780, scale: 0.82, opacity: 0 },
}

interface DraggableCardProps {
  candidate: BrowseCandidate
  isTop: boolean
  stackIndex: number
  exitAction: SwipeAction
  onSwiped: (action: SwipeAction) => void
}

function DraggableCard({ candidate, isTop, stackIndex, exitAction, onSwiped }: DraggableCardProps) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-12, 12])
  const likeOpacity = useTransform(x, [20, 120], [0, 1])
  const skipOpacity = useTransform(x, [-120, -20], [1, 0])

  return (
    <motion.div
      className="absolute inset-0"
      style={isTop ? { x, rotate } : undefined}
      animate={!isTop ? { scale: 1 - stackIndex * 0.04, y: stackIndex * 12 } : undefined}
      initial={false}
      exit={{ ...EXIT_VARIANTS[exitAction], transition: { duration: exitAction === 'super_like' ? 0.45 : 0.32, ease: [0.4, 0, 0.2, 1] } }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={(_, info) => {
        if (info.offset.x > SWIPE_THRESHOLD) onSwiped('like')
        else if (info.offset.x < -SWIPE_THRESHOLD) onSwiped('skip')
      }}
    >
      <SwipeCardContent candidate={candidate} />
      {isTop && (
        <>
          <motion.div
            style={{ opacity: likeOpacity }}
            className="pointer-events-none absolute left-6 top-6 rotate-[-12deg] rounded-lg border-4 border-emerald-400 px-3 py-1 text-lg font-bold text-emerald-400"
          >
            LIKE
          </motion.div>
          <motion.div
            style={{ opacity: skipOpacity }}
            className="pointer-events-none absolute right-6 top-6 rotate-[12deg] rounded-lg border-4 border-red-400 px-3 py-1 text-lg font-bold text-red-400"
          >
            SKIP
          </motion.div>

          {/* Super Woof starburst — only while this card is flying up. */}
          {exitAction === 'super_like' && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.2, opacity: 0, rotate: -18 }}
                animate={{ scale: 1, opacity: 1, rotate: -8 }}
                transition={{ type: 'spring', bounce: 0.5, duration: 0.5 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="relative">
                  <span className="absolute inset-0 -z-10 rounded-full bg-sky-400/40 blur-2xl" />
                  <Star className="h-24 w-24 text-sky-300 drop-shadow-[0_0_18px_rgba(56,189,248,0.9)]" fill="currentColor" />
                </div>
                <span className="rounded-full bg-sky-400/90 px-4 py-1 text-lg font-extrabold uppercase tracking-widest text-neutral-950 shadow-lg shadow-sky-400/40">
                  Super Woof
                </span>
              </motion.div>
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}

interface SwipeDeckProps {
  candidates: BrowseCandidate[]
  onSwipe: (candidate: BrowseCandidate, action: SwipeAction) => void
  onUndo: () => void
  canUndo: boolean
  undoing: boolean
  superWoofRemaining?: number
}

export function SwipeDeck({ candidates, onSwipe, onUndo, canUndo, undoing, superWoofRemaining }: SwipeDeckProps) {
  const [exiting, setExiting] = useState(false)
  const [exitAction, setExitAction] = useState<SwipeAction>('like')
  const visible = candidates.slice(0, VISIBLE_CARDS)
  const top = visible[0]

  const handleSwiped = (action: SwipeAction) => {
    if (!top || exiting) return
    setExitAction(action)
    setExiting(true)
    onSwipe(top, action)
  }

  const superWoofAvailable = superWoofRemaining == null || superWoofRemaining > 0
  const superWoofDisabled = !top || !superWoofAvailable

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[26rem] w-full max-w-sm sm:h-[30rem]">
        <AnimatePresence onExitComplete={() => setExiting(false)}>
          {visible.map((candidate, i) => (
            <DraggableCard
              key={candidate.pet.id}
              candidate={candidate}
              isTop={i === 0}
              stackIndex={i}
              exitAction={exitAction}
              onSwiped={handleSwiped}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={onUndo}
          disabled={!canUndo || undoing}
          aria-label="Undo last swipe"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 text-neutral-400 transition-colors hover:text-amber-400 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Undo2 className="h-5 w-5" />
        </button>
        <button
          onClick={() => handleSwiped('skip')}
          disabled={!top}
          aria-label="Skip"
          className="flex h-16 w-16 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 text-red-400 shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <X className="h-7 w-7" />
        </button>
        <button
          onClick={() => handleSwiped('like')}
          disabled={!top}
          aria-label="Like"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#ff6b35] to-pink-500 text-white shadow-lg shadow-[#ff6b35]/30 transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Heart className="h-7 w-7" fill="currentColor" />
        </button>

        {/* Super Woof — glowing, limited-use priority like. */}
        <div className="relative">
          {superWoofAvailable && (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute -inset-1.5 rounded-full bg-gradient-to-br from-sky-400 to-cyan-300 blur-md"
              animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
          <button
            onClick={() => handleSwiped('super_like')}
            disabled={superWoofDisabled}
            aria-label="Super Woof"
            title={superWoofAvailable ? 'Super Woof — jump to the top of their likes' : "You've used today's Super Woof"}
            className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-cyan-300 text-neutral-950 shadow-lg shadow-sky-400/40 ring-2 ring-sky-300/50 transition-transform hover:scale-110 active:scale-95 disabled:cursor-not-allowed disabled:from-neutral-700 disabled:to-neutral-800 disabled:text-neutral-500 disabled:opacity-60 disabled:shadow-none disabled:ring-0"
          >
            <Star className="h-6 w-6" fill="currentColor" />
          </button>
          {superWoofRemaining != null && superWoofRemaining > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-950 px-1 text-[11px] font-extrabold text-sky-300 ring-2 ring-sky-400">
              {superWoofRemaining}
            </span>
          )}
        </div>
      </div>

      <p className="mt-3 h-4 text-center text-xs text-neutral-500">
        {superWoofRemaining === 0 ? "Super Woof back tomorrow ⭐" : superWoofAvailable ? 'Tap the star to Super Woof' : ''}
      </p>
    </div>
  )
}
