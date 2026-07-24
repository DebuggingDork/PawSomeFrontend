import { useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Heart, X, Undo2, Star } from 'lucide-react'
import { SwipeCardContent } from './SwipeCard'
import type { BrowseCandidate } from '@/lib/api/types'

const SWIPE_THRESHOLD = 120
const VISIBLE_CARDS = 3

interface DraggableCardProps {
  candidate: BrowseCandidate
  isTop: boolean
  stackIndex: number
  onSwiped: (action: 'like' | 'skip') => void
}

function DraggableCard({ candidate, isTop, stackIndex, onSwiped }: DraggableCardProps) {
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
      exit={{ x: x.get() > 0 ? 400 : x.get() < 0 ? -400 : 0, opacity: 0, transition: { duration: 0.3 } }}
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
        </>
      )}
    </motion.div>
  )
}

interface SwipeDeckProps {
  candidates: BrowseCandidate[]
  onSwipe: (candidate: BrowseCandidate, action: 'like' | 'skip' | 'super_like') => void
  onUndo: () => void
  canUndo: boolean
  undoing: boolean
  superWoofRemaining?: number
}

export function SwipeDeck({ candidates, onSwipe, onUndo, canUndo, undoing, superWoofRemaining }: SwipeDeckProps) {
  const [exiting, setExiting] = useState(false)
  const visible = candidates.slice(0, VISIBLE_CARDS)
  const top = visible[0]

  const handleSwiped = (action: 'like' | 'skip' | 'super_like') => {
    if (!top || exiting) return
    setExiting(true)
    onSwipe(top, action)
  }

  const superWoofDisabled = !top || superWoofRemaining === 0

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
          className="flex h-16 w-16 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 text-red-400 shadow-lg transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <X className="h-7 w-7" />
        </button>
        <button
          onClick={() => handleSwiped('like')}
          disabled={!top}
          aria-label="Like"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#ff6b35] to-pink-500 text-white shadow-lg shadow-[#ff6b35]/30 transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Heart className="h-7 w-7" fill="currentColor" />
        </button>
        <div className="relative">
          <button
            onClick={() => handleSwiped('super_like')}
            disabled={superWoofDisabled}
            aria-label="Super Woof"
            title={superWoofRemaining === 0 ? "You've used today's Super Woof" : 'Super Woof — jump to the top of their likes'}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-sky-400/40 bg-neutral-900 text-sky-400 transition-colors hover:bg-sky-400/10 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Star className="h-5 w-5" fill="currentColor" />
          </button>
          {superWoofRemaining != null && superWoofRemaining > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-400 px-1 text-[10px] font-bold text-neutral-950">
              {superWoofRemaining}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
