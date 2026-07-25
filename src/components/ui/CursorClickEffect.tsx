import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

interface Stamp {
  id: number
  x: number
  y: number
}

let nextStampId = 0

/**
 * A small paw print stamps briefly wherever the user presses down, then fades.
 * This is deliberately the ONLY cursor-related motion on the site — the cursor
 * itself (see index.css) stays a static image because browsers don't reliably
 * animate CSS `cursor` images, so "static at rest, animated on click" has to be
 * built as a separate effect layered on top rather than the cursor itself.
 */
export function CursorClickEffect() {
  const [stamps, setStamps] = useState<Stamp[]>([])
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (shouldReduceMotion) return

    const onPointerDown = (e: PointerEvent) => {
      // Touch already has its own tap feedback (native highlight, scroll, etc.) —
      // stamping there would just add visual noise on top of it.
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return
      const id = nextStampId++
      setStamps((prev) => [...prev, { id, x: e.clientX, y: e.clientY }])
      window.setTimeout(() => {
        setStamps((prev) => prev.filter((s) => s.id !== id))
      }, 500)
    }

    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [shouldReduceMotion])

  if (shouldReduceMotion) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[110]" aria-hidden="true">
      <AnimatePresence>
        {stamps.map((s) => (
          <motion.svg
            key={s.id}
            width="26"
            height="26"
            viewBox="0 0 32 32"
            initial={{ opacity: 0.9, scale: 0.4, rotate: -10 }}
            animate={{ opacity: 0, scale: 1.2, rotate: 8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
            style={{ position: 'fixed', left: s.x - 13, top: s.y - 13 }}
          >
            <g fill="#ff6b35" stroke="#ffffff" strokeWidth="1.4" strokeLinejoin="round">
              <ellipse cx="16" cy="22" rx="7.4" ry="6.4" />
              <circle cx="6.4" cy="13.2" r="3.4" />
              <circle cx="13" cy="7.2" r="3.6" />
              <circle cx="19.6" cy="7.2" r="3.6" />
              <circle cx="26.2" cy="13.2" r="3.4" />
            </g>
          </motion.svg>
        ))}
      </AnimatePresence>
    </div>
  )
}
