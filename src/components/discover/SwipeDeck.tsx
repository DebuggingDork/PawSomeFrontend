import { useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useReducedMotion } from 'framer-motion'
import { Heart, X, Undo2, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { SwipeCardContent } from './SwipeCard'
import { LAYER } from './layers'
import { PetCardDialog } from '@/components/community/PetCardDialog'
import { useDiscoverStore } from '@/store/useDiscoverStore'
import type { BrowseCandidate } from '@/lib/api/types'

const SWIPE_THRESHOLD = 120
// A subtler peek than before — enough to read as a deck with more behind it
// without the outermost, barely-visible card adding clutter for no benefit.
const VISIBLE_CARDS = 4
// Below this, a released drag counts as a tap that opens the preview rather
// than an aborted swipe. Framer Motion's own drag gesture already has a
// similar internal tolerance, but relying on that implicitly meant "does tap
// still work" depended on a library internal rather than something this file
// controls and can reason about.
const TAP_DRAG_TOLERANCE = 6

/**
 * Standard ease-out for card motion. Explicitly typed as a 4-tuple rather than
 * left to inference: as a bare `number[]` it does not satisfy Framer Motion's
 * `Easing` union, and the resulting error only surfaces under `tsc -b`.
 */
const EASE_OUT: [number, number, number, number] = [0.4, 0, 0.2, 1]

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
  onPreview: () => void
}

function DraggableCard({ candidate, isTop, stackIndex, exitAction, isExiting, onSwiped, onPreview }: DraggableCardProps) {
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
  // Tracks whether the current pointer-down turned into a real drag, so the
  // release can tell a tap (open the preview) from a swipe or an aborted,
  // snapped-back drag (do nothing) — a plain onClick can't tell those apart
  // on its own since both end with a pointerup on the same element.
  const didDragRef = useRef(false)
  const reduceMotion = useReducedMotion()

  // Reduced motion drops the travel, not the feedback: a card flung 520px
  // across the viewport is exactly the kind of large positional movement that
  // triggers motion sickness, but silently removing the transition entirely
  // would leave someone unsure whether their swipe registered. Fading in place
  // still answers that.
  const exitAnimation = reduceMotion
    ? { opacity: 0, transition: { duration: 0.2 } }
    : {
        ...EXIT_VARIANTS[exitAction],
        transition: { duration: exitAction === 'super_like' ? 0.45 : 0.32, ease: EASE_OUT },
      }

  return (
    <motion.div
      className="absolute inset-0"
      style={{ zIndex: VISIBLE_CARDS - stackIndex }}
      animate={{ x: fan.x, y: fan.y, rotate: fan.rotate, scale: fan.scale, opacity: fan.opacity }}
      transition={
        reduceMotion ? { duration: 0.2, ease: EASE_OUT } : { type: 'spring', stiffness: 260, damping: 26 }
      }
      initial={false}
      exit={exitAnimation}
    >
      <motion.div
        className="absolute inset-0"
        style={{ x: dragX, rotate: dragRotate }}
        initial={false}
        drag={isTop ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.9}
        onDragStart={() => {
          didDragRef.current = false
        }}
        onDrag={(_, info) => {
          if (Math.abs(info.offset.x) > TAP_DRAG_TOLERANCE) didDragRef.current = true
        }}
        onDragEnd={(_, info) => {
          if (info.offset.x > SWIPE_THRESHOLD) onSwiped('like')
          else if (info.offset.x < -SWIPE_THRESHOLD) onSwiped('skip')
        }}
        onClick={() => {
          if (isTop && !didDragRef.current) onPreview()
        }}
      >
        <SwipeCardContent candidate={candidate} onPreview={isTop ? onPreview : undefined} />
        {/* Cards behind the top one are cropped by the fan, so their badges and
            name sit half-cut at odd angles and read as clutter. Dim and blur
            them so only the top card's text is legible. See LAYER for why this
            has to sit above the badges rather than below them. */}
        {!isTop && (
          <div
            className={`pointer-events-none absolute inset-0 ${LAYER.DIM} rounded-[1.75rem] bg-black/60 backdrop-blur-[1px]`}
          />
        )}
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
  const [previewCandidate, setPreviewCandidate] = useState<BrowseCandidate | null>(null)
  const reduceMotion = useReducedMotion()

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
    /* Tall 3:4 portrait deck with on-card browse chevrons and a glowing
       action row — matched to the Discover reference aesthetic. */
    <div className="flex h-full min-h-0 flex-col items-center">
      {/* The card is sized from the container's *height* (100cqh), because
          height is what's actually scarce here — the page is a viewport-height
          column and the action row below has to stay on screen. 4/5 rather
          than 3/4 buys ~7% more width for the same height, which is width the
          photo gets to keep. */}
      <div
        className="flex min-h-0 w-full flex-1 items-center justify-center"
        style={{ containerType: 'size' }}
      >
        <div
          className="relative max-h-full"
          style={{
            aspectRatio: '4 / 5',
            width: 'min(100%, 32rem, calc(100cqh * 4 / 5))',
            height: 'auto',
          }}
        >
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
                onPreview={() => setPreviewCandidate(candidate)}
              />
            ))}
          </AnimatePresence>

          {/* Edge chevrons for browsing the deck without committing a swipe.
              Anchored at 38% rather than the usual top-1/2: the text box sits
              along the bottom edge, so a true vertical centre lands the left
              chevron directly on the pet's name. 38% clears the text at every
              height this deck renders at while still reading as "on the
              photo". */}
          <button
            type="button"
            onClick={() => rotateWindow(-1)}
            disabled={!canCycle}
            aria-label="Show previous pet"
            className={`absolute left-2 top-[38%] ${LAYER.CHEVRON} flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white shadow-lg shadow-black/40 backdrop-blur-md transition duration-150 ease-out hover:bg-black/75 active:scale-95 disabled:pointer-events-none disabled:opacity-0 motion-safe:hover:scale-110`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => rotateWindow(1)}
            disabled={!canCycle}
            aria-label="Show next pet"
            className={`absolute right-2 top-[38%] ${LAYER.CHEVRON} flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white shadow-lg shadow-black/40 backdrop-blur-md transition duration-150 ease-out hover:bg-black/75 active:scale-95 disabled:pointer-events-none disabled:opacity-0 motion-safe:hover:scale-110`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Every action is a labelled column so `items-end` lines all four up on
          one baseline. Undo used to be a bare icon nudged down by a hardcoded
          `mb-5` to fake that alignment, which left it sitting at an arbitrary
          height next to three labelled buttons and reading as a stray control
          rather than part of the row. */}
      <div className="mt-4 flex flex-shrink-0 items-end justify-center gap-4 sm:gap-5">
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={onUndo}
            disabled={!canUndo || undoing}
            aria-label="Undo last swipe"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 text-neutral-400 transition duration-150 ease-out hover:border-amber-500/40 hover:text-amber-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Undo2 className="h-5 w-5" />
          </button>
          <span className="text-xs font-medium text-neutral-400">Undo</span>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={() => handleSwiped('skip')}
            disabled={!top}
            aria-label="Pass"
            className="flex h-16 w-16 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 text-red-400 shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition duration-150 ease-out hover:border-red-500/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 motion-safe:hover:scale-105"
          >
            <X className="h-7 w-7" strokeWidth={2.5} />
          </button>
          <span className="text-xs font-medium text-neutral-400">Pass</span>
        </div>

        {/* Super Woof — glowing, limited-use priority like. */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="relative">
            {superWoofAvailable && (
              /* The glow is the affordance that marks this as the special
                 action, so reduced motion keeps it and drops only the pulse —
                 removing it outright would flatten Super Woof into an ordinary
                 third button. */
              <motion.span
                aria-hidden
                className="pointer-events-none absolute -inset-1.5 rounded-full bg-gradient-to-br from-sky-400 to-cyan-300 blur-md"
                animate={
                  reduceMotion
                    ? { scale: 1, opacity: 0.45 }
                    : { scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }
                }
                transition={
                  reduceMotion ? { duration: 0 } : { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                }
              />
            )}
            <button
              onClick={() => handleSwiped('super_like')}
              disabled={superWoofDisabled}
              aria-label="Super Woof"
              title={superWoofAvailable ? 'Super Woof — jump to the top of their likes' : "You've used today's Super Woof"}
              className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-cyan-300 text-neutral-950 shadow-[0_0_28px_rgba(56,189,248,0.55)] ring-2 ring-sky-300/50 transition duration-150 ease-out active:scale-95 disabled:cursor-not-allowed disabled:from-neutral-700 disabled:to-neutral-800 disabled:text-neutral-400 disabled:opacity-60 disabled:shadow-none disabled:ring-0 motion-safe:hover:scale-110"
            >
              <Star className="h-6 w-6" fill="currentColor" />
            </button>
            {superWoofRemaining != null && superWoofRemaining > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-950 px-1 text-[11px] font-extrabold text-sky-300 ring-2 ring-sky-400">
                {superWoofRemaining}
              </span>
            )}
          </div>
          <span className="text-xs font-medium text-neutral-400">Super Woof</span>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={() => handleSwiped('like')}
            disabled={!top}
            aria-label="Like"
            className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#ff6b35] to-pink-500 text-white shadow-[0_0_32px_rgba(255,107,53,0.45)] transition duration-150 ease-out active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 motion-safe:hover:scale-105"
          >
            <Heart className="h-7 w-7" fill="currentColor" />
          </button>
          <span className="text-xs font-medium text-neutral-400">Like</span>
        </div>
      </div>

      {/* Fixed height so the row above never shifts when this text swaps. */}
      <p className="mt-2 h-4 text-center text-xs text-neutral-400">
        {superWoofRemaining === 0 ? 'Super Woof back tomorrow ⭐' : superWoofAvailable ? 'Tap the star to Super Woof' : ''}
      </p>

      {/* hideActions: Discover already has its own Pass/Super Woof/Like row
          driving this exact deck. PetInterestActions' own Interested/Save
          buttons would be a second, disconnected way to like the same pet
          that doesn't remove the card from the stack underneath. */}
      {previewCandidate && (
        <PetCardDialog
          petId={previewCandidate.pet.id}
          onClose={() => setPreviewCandidate(null)}
          hideActions
        />
      )}
    </div>
  )
}
