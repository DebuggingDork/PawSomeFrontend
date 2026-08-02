import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { DotLottieLoader } from './DotLottieLoader'
import { useLoaderStore } from '@/store/useLoaderStore'

/** Warm, low-stakes asides that rotate under the real status line. The headline
 * always tells the user what's actually happening; these just keep the wait from
 * feeling like a dead screen. Kept short so the line never wraps. */
const FLAVOUR_LINES = [
  'Fluffing the cushions',
  'Rounding up the good boys',
  'Topping up the treat jar',
  'Warming up a few tail wags',
  'Sniffing out your matches',
]

const FLAVOUR_INTERVAL_MS = 2400

/** Trailing dots are rendered as an animation, so strip whatever the caller
 * typed ('Signing you in...') to avoid ending up with six of them. */
function stripTrailingEllipsis(text: string) {
  return text.replace(/(\.{2,}|…)\s*$/, '').trimEnd()
}

/** Three dots that bounce in sequence — reads as "still going" without the
 * whole-line opacity throb of a plain pulse. */
function AnimatedEllipsis() {
  return (
    <span aria-hidden="true" className="ml-0.5 inline-flex">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="motion-safe:animate-dot-bounce inline-block"
          style={{ animationDelay: `${i * 140}ms` }}
        >
          .
        </span>
      ))}
    </span>
  )
}

/** Rotates the flavour copy. Split out as its own component so it mounts fresh
 * every time the loader opens — the sequence always starts from the first line
 * without an effect having to reach back in and reset it. */
function FlavourLine() {
  const shouldReduceMotion = useReducedMotion()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (shouldReduceMotion) return
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % FLAVOUR_LINES.length),
      FLAVOUR_INTERVAL_MS
    )
    return () => clearInterval(id)
  }, [shouldReduceMotion])

  return (
    // Fixed height + keyed remount: the line swaps in place instead of nudging
    // everything below it each time the copy changes.
    <p className="flex h-4 items-center text-[13px] leading-none text-neutral-400">
      <span key={index} className="motion-safe:animate-rise-in">
        {FLAVOUR_LINES[index]}
      </span>
    </p>
  )
}

/**
 * GlobalLoader - Place this at the root of your app to show loading states globally
 *
 * This component listens to the useLoaderStore and displays the loader
 * whenever isLoading is true.
 *
 * @example
 * // In App.tsx
 * import { GlobalLoader } from '@/components/ui/GlobalLoader'
 *
 * function App() {
 *   return (
 *     <>
 *       <GlobalLoader />
 *       {/* rest of your app *\/}
 *     </>
 *   )
 * }
 */
export const GlobalLoader = () => {
  const { isLoading, loadingText, animationSrc } = useLoaderStore()

  if (!isLoading) return null

  // Default animation URL - custom PawSome loader animation
  const defaultAnimationSrc =
    animationSrc || 'https://lottie.host/c13861b9-0350-4c9f-a37e-99d4b986369d/VkPhxnZqXt.lottie'

  const headline = loadingText ? stripTrailingEllipsis(loadingText) : ''

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label={loadingText || 'Loading'}
    >
      {/* Blurring the page behind it (rather than flatly covering it) keeps the
          user anchored in the screen they came from. */}
      <div className="absolute inset-0 bg-neutral-950/90 backdrop-blur-md" />

      {/* Brand-warm glow so the artwork isn't stranded in flat black. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute aspect-square w-[min(520px,80vw)] rounded-full bg-[radial-gradient(circle,rgba(255,107,53,0.16),transparent_68%)]"
      />

      <div className="relative flex flex-col items-center">
        <DotLottieLoader
          src={defaultAnimationSrc}
          size="custom"
          customSize={180}
          showOverlay={false}
          position="static"
          speed={1.2}
        />

        {/* The Lottie artwork is centred inside its own square canvas with a
            good chunk of empty space beneath it, which left the caption
            stranded miles below the cat. Pulling the block up closes that gap
            optically — measured against the artwork, not the canvas box. */}
        <div className="-mt-6 flex flex-col items-center gap-3 px-6 text-center">
          {headline && (
            <p className="text-[15px] font-medium tracking-tight text-white">
              {headline}
              <AnimatedEllipsis />
            </p>
          )}

          <FlavourLine />

          <div
            aria-hidden="true"
            className="relative mt-1 h-[2px] w-24 overflow-hidden rounded-full bg-white/10"
          >
            <div className="motion-safe:animate-rail-sweep absolute inset-y-0 left-0 w-[42%] rounded-full bg-gradient-to-r from-transparent via-brand to-transparent" />
          </div>
        </div>
      </div>
    </div>
  )
}
