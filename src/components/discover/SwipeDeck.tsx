import { useMemo, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Heart, X, Undo2, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { SwipeCardContent } from './SwipeCard'
import { useDiscoverStore } from '@/store/useDiscoverStore'
import type { BrowseCandidate } from '@/lib/api/types'

const SWIPE_THRESHOLD = 120
const VISIBLE_CARDS = 5

type SwipeAction = 'like' | 'skip' | 'super_like'

// Where a card flies to as it leaves — sideways for like/skip, straight up
// (with a shrink) for a Super Woof so it reads as something special.
const EXIT_VARIANTS: Record<SwipeAction, Record<string, number>> = {
  like: { x: 520, y: -40, rotate: 18, opacity: 0 },
  skip: { x: -520, y: -40, rotate: -18, opacity: 0 },
  super_like: { y: -780, scale: 0.82, opacity: 0 },
}

/** Fan geometry for cards behind the top one — alternates left/right and grows
 * the rotation/offset/fade the further back a card sits in the stack, so the
 * deck reads as a hand of fanned cards rather than a flat pile. */
function fanTransform(stackIndex: number) {
  if (stackIndex === 0) return { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }
  const pair = Math.ceil(stackIndex / 2)
  const side = stackIndex % 2 === 1 ? 1 : -1
  return {
    x: side * (56 + pair * 42),
    y: pair * 6,
    rotate: side * (6 + pair * 5),
    scale: 1 - pair * 0.08,
    opacity: 1 - pair * 0.24,
  }
}

interface DraggableCardProps {
  candidate: BrowseCandidate
  isTop: boolean
  stackIndex: number
  exitAction: SwipeAction
  isExiting: boolean
  onSwiped: (action: SwipeAction) => void
}

function DraggableCard({ candidate, isTop, stackIndex, exitAction, isExiting, onSwiped }: DraggableCardProps) {
  // Split in two layers so the fan position (outer, always driven by `animate`)
  // and the drag gesture (inner, only live for the top card) never fight over
  // the same x/rotate — mixing a raw drag-bound motion value with an `animate`
  // target on the same property, toggled by whether a card is currently on top,
  // left cards stuck mid-transition when they swapped roles.
  const dragX = useMotionValue(0)
  const dragRotate = useTransform(dragX, [-200, 200], [-12, 12])
  const likeOpacity = useTransform(dragX, [20, 120], [0, 1])
  const skipOpacity = useTransform(dragX, [-120, -20], [1, 0])
  const fan = isTop ? { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 } : fanTransform(stackIndex)

  return (
    <motion.div
      className="absolute inset-0"
      style={{ zIndex: VISIBLE_CARDS - stackIndex }}
      animate={{ x: fan.x, y: fan.y, rotate: fan.rotate, scale: fan.scale, opacity: fan.opacity }}
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      initial={false}
      exit={{ ...EXIT_VARIANTS[exitAction], transition: { duration: exitAction === 'super_like' ? 0.45 : 0.32, ease: [0.4, 0, 0.2, 1] } }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ x: dragX, rotate: dragRotate }}
        initial={false}
        drag={isTop ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.9}
        onDragEnd={(_, info) => {
          if (info.offset.x > SWIPE_THRESHOLD) onSwiped('like')
          else if (info.offset.x < -SWIPE_THRESHOLD) onSwiped('skip')
        }}
      >
        <SwipeCardContent candidate={candidate} />
        {/* Cards behind the top one are cropped by the fan, so their badges and
            name sit half-cut at odd angles and read as clutter. Dim and blur
            them so only the top card's text is legible. */}
        {!isTop && <div className="pointer-events-none absolute inset-0 rounded-3xl bg-black/45 backdrop-blur-[1px]" />}
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
            {isExiting && exitAction === 'super_like' && (
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
    </motion.div>
  )
}

interface SwipeDeckProps {
  candidates: BrowseCandidate[]
  /** Identity of this deck (active pet + filters). The fan order is remembered
   * against it, so paging through the deck survives leaving the page and coming
   * back, while changing filters correctly starts fresh. */
  deckKey: string
  onSwipe: (candidate: BrowseCandidate, action: SwipeAction) => void
  onUndo: () => void
  canUndo: boolean
  undoing: boolean
  superWoofRemaining?: number
}

export function SwipeDeck({
  candidates,
  deckKey,
  onSwipe,
  onUndo,
  canUndo,
  undoing,
  superWoofRemaining,
}: SwipeDeckProps) {
  const [exiting, setExiting] = useState(false)
  const [exitAction, setExitAction] = useState<SwipeAction>('like')

  // The fan order lives in the Discover store, not here, so it outlives this
  // component being unmounted by a navigation. Only reused when it describes the
  // deck currently on screen.
  const savedOrder = useDiscoverStore((s) => (s.deckKey === deckKey ? s.order : null))
  const setSavedOrder = useDiscoverStore((s) => s.setOrder)

  // Derived, not stored: reconciling the remembered order against the live
  // candidate list is a pure function of the two, so there's no state to adjust
  // during render and no effect that could paint a stale order first. Ids that
  // left the deck (swiped away) drop out; ids that arrived join the back.
  const order = useMemo(() => {
    const ids = candidates.map((c) => c.pet.id)
    if (!savedOrder) return ids
    const present = new Set(ids)
    const kept = savedOrder.filter((id) => present.has(id))
    const known = new Set(kept)
    return [...kept, ...ids.filter((id) => !known.has(id))]
  }, [candidates, savedOrder])

  const candidateById = new Map(candidates.map((c) => [c.pet.id, c]))
  const visible = order
    .slice(0, VISIBLE_CARDS)
    .map((id) => candidateById.get(id))
    .filter((c): c is BrowseCandidate => Boolean(c))
  const top = visible[0]

  const handleSwiped = (action: SwipeAction) => {
    if (!top || exiting) return
    setExitAction(action)
    setExiting(true)
    onSwipe(top, action)
  }

  // Cycle who's fanned out front-and-center without recording a swipe decision.
  // Only VISIBLE_CARDS are fanned on screen at once, but the ring is the *whole*
  // loaded deck: "next" retires the front card to the very back, which pulls the
  // next never-seen candidate into the fan from behind. Rotating just the
  // fanned window (the old behavior) meant clicking through only ever
  // re-ordered the same handful of cards already on screen — everyone else in
  // the loaded deck was unreachable without swiping.
  const rotateWindow = (direction: 1 | -1) => {
    if (exiting || order.length < 2) return
    const rotated = direction === 1 ? [...order.slice(1), order[0]] : [order[order.length - 1], ...order.slice(0, -1)]
    setSavedOrder(deckKey, rotated)
  }

  const superWoofAvailable = superWoofRemaining == null || superWoofRemaining > 0
  const superWoofDisabled = !top || !superWoofAvailable
  const canCycle = order.length > 1 && !exiting

  return (
    /* Fills whatever height the page gives it and keeps the action row in
       flow beneath, so the buttons are always on screen. The card area used to
       be a fixed 26-30rem, which on a laptop pushed skip/Super Woof/like below
       the fold — users had no way to know they existed without scrolling. */
    <div className="flex h-full min-h-0 flex-col items-center py-2.5">
      <div className="relative w-full max-w-sm flex-1 min-h-[16rem]">
        <AnimatePresence onExitComplete={() => setExiting(false)}>
          {visible.map((candidate, i) => (
            <DraggableCard
              key={candidate.pet.id}
              candidate={candidate}
              isTop={i === 0}
              stackIndex={i}
              exitAction={exitAction}
              isExiting={exiting && i === 0}
              onSwiped={handleSwiped}
            />
          ))}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => rotateWindow(-1)}
          disabled={!canCycle}
          aria-label="Show previous"
          className="absolute left-2 top-1/2 z-50 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-lg shadow-black/40 backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/80 active:scale-95 disabled:pointer-events-none disabled:opacity-0"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => rotateWindow(1)}
          disabled={!canCycle}
          aria-label="Show next"
          className="absolute right-2 top-1/2 z-50 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-lg shadow-black/40 backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/80 active:scale-95 disabled:pointer-events-none disabled:opacity-0"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-10 flex flex-shrink-0 items-end gap-5 sm:mt-12">
        <button
          onClick={onUndo}
          disabled={!canUndo || undoing}
          aria-label="Undo last swipe"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 text-neutral-400 transition-colors hover:text-amber-400 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Undo2 className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={() => handleSwiped('skip')}
            disabled={!top}
            aria-label="Pass"
            className="flex h-16 w-16 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 text-red-400 shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <X className="h-7 w-7" />
          </button>
          <span className="text-xs font-medium text-neutral-500">Pass</span>
        </div>

        {/* Super Woof — glowing, limited-use priority like. */}
        <div className="flex flex-col items-center gap-1.5">
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
          <span className="text-xs font-medium text-neutral-500">Super Woof</span>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={() => handleSwiped('like')}
            disabled={!top}
            aria-label="Like"
            className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#ff6b35] to-pink-500 text-white shadow-lg shadow-[#ff6b35]/30 transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Heart className="h-7 w-7" fill="currentColor" />
          </button>
          <span className="text-xs font-medium text-neutral-500">Like</span>
        </div>
      </div>

      <p className="mt-4 h-4 text-center text-xs text-neutral-500">
        {superWoofRemaining === 0 ? "Super Woof back tomorrow ⭐" : superWoofAvailable ? 'Tap the star to Super Woof' : ''}
      </p>
    </div>
  )
}
