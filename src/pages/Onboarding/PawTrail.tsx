import { motion, useReducedMotion } from 'framer-motion'
import { PawPrint } from 'lucide-react'
import type { OnboardingStep } from '@/lib/api/types'

export interface TrailItem {
  step: OnboardingStep
  label: string
  completed: boolean
}

interface Props {
  items: TrailItem[]
  activeIndex: number
  /** Revisiting a finished step. Only completed steps are offered. */
  onSelect: (step: OnboardingStep) => void
}

const EASE_OUT = [0.16, 1, 0.3, 1] as const

/**
 * Progress as a line of paw prints walking left to right, alternating tilt so it
 * reads as a trail rather than six evenly spaced dots.
 *
 * Completed prints are solid and clickable, so a name typo doesn't mean finishing
 * onboarding and then hunting for it in Profile.
 */
export function PawTrail({ items, activeIndex, onSelect }: Props) {
  const shouldReduceMotion = useReducedMotion()
  const doneCount = items.filter((i) => i.completed).length
  // The filled track stops at the furthest point actually reached, so it never
  // runs ahead of the paw the user is standing on.
  const progress = items.length > 1 ? Math.max(doneCount, activeIndex) / (items.length - 1) : 0

  return (
    <div className="relative">
      {/* Track. Inset by half a paw so it runs between their centres rather than
          out past the first and last one. */}
      <div aria-hidden className="absolute inset-x-5 top-1/2 h-px -translate-y-1/2 bg-neutral-800">
        <motion.div
          className="h-full origin-left bg-brand/70"
          initial={false}
          animate={{ scaleX: progress }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.6, ease: EASE_OUT }}
          style={{ width: '100%' }}
        />
      </div>

      <ol className="relative flex items-center justify-between select-none">
        {items.map((item, i) => {
          const isActive = i === activeIndex
          const isDone = item.completed
          const canVisit = isDone && !isActive
          const tilt = i % 2 === 0 ? -14 : 12

          return (
            <li key={item.step}>
              <button
                type="button"
                onClick={() => canVisit && onSelect(item.step)}
                disabled={!canVisit}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`${i + 1}. ${item.label}${isDone ? ' (done)' : ''}`}
                title={item.label}
                // 40px square: a finger's worth. Six of them plus gaps still fit
                // inside a 320px screen's content width, which is the narrowest
                // phone anyone is likely to arrive on.
                className={`group relative flex h-10 w-10 touch-manipulation items-center justify-center rounded-full border transition-colors ${
                  isDone
                    ? 'border-brand bg-brand text-white'
                    : isActive
                      ? 'border-brand bg-neutral-950 text-brand'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                } ${canVisit ? 'cursor-pointer hoverable:hover:brightness-110' : 'cursor-default'}`}
              >
                {/* A single soft ring on the current step. Not a pulse loop:
                    a permanently animating element in the corner of the eye is
                    the thing people turn animations off to escape. */}
                {isActive && !shouldReduceMotion && (
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-full ring-2 ring-brand/40"
                    initial={{ scale: 1, opacity: 0.9 }}
                    animate={{ scale: 1.45, opacity: 0 }}
                    transition={{ duration: 1.1, ease: EASE_OUT }}
                  />
                )}
                <PawPrint
                  className="h-4 w-4"
                  style={{ transform: `rotate(${tilt}deg)` }}
                  fill={isDone ? 'currentColor' : 'none'}
                />
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
