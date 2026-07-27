import React from 'react'
import { motion, useReducedMotion, type Variant } from 'framer-motion'

type RevealDirection = 'up' | 'down' | 'left' | 'right'

interface ScrollRevealProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  y?: number
  direction?: RevealDirection
  className?: string
  scale?: boolean
}

const getInitial = (direction: RevealDirection, distance: number): Variant => {
  const map: Record<RevealDirection, Variant> = {
    up: { opacity: 0, y: distance, filter: 'blur(4px)' },
    down: { opacity: 0, y: -distance, filter: 'blur(4px)' },
    left: { opacity: 0, x: distance, filter: 'blur(4px)' },
    right: { opacity: 0, x: -distance, filter: 'blur(4px)' },
  }
  return map[direction]
}

const getVisible = (direction: RevealDirection): Variant => {
  const isVertical = direction === 'up' || direction === 'down'
  return isVertical
    ? { opacity: 1, y: 0, filter: 'blur(0px)' }
    : { opacity: 1, x: 0, filter: 'blur(0px)' }
}

/** Strong ease-out. The previous default, [0.25, 0.46, 0.45, 0.94], is
 *  ease-out-quad — nearly linear for most of its length, so an 0.8s reveal read
 *  as a slow fade with no attack. This one covers most of the distance
 *  immediately and settles, which is what makes a reveal feel deliberate rather
 *  than merely present. */
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  delay = 0,
  duration = 0.75,
  y = 56,
  direction = 'up',
  className = '',
  scale = false,
}) => {
  // Someone who has asked their OS for less motion still gets the reveal — just
  // as a fade, with nothing sliding across the screen. Dropping the animation
  // entirely would be worse: the content would pop in with no transition at all.
  const reduceMotion = useReducedMotion()

  const initial = reduceMotion
    ? { opacity: 0 }
    : {
        ...getInitial(direction, y),
        ...(scale ? { scale: 0.95 } : {}),
      }

  const visible = reduceMotion
    ? { opacity: 1 }
    : {
        ...getVisible(direction),
        ...(scale ? { scale: 1 } : {}),
      }

  return (
    <motion.div
      initial={initial}
      whileInView={visible}
      // Fires once the element is a fifth visible AND its top has cleared the
      // bottom 10% of the viewport. At the old `amount: 0.15` with no margin,
      // a reveal on a tall section started while it was still a sliver at the
      // very bottom of the screen and was finished by the time it reached
      // reading position — the animation ran, nobody saw it happen.
      viewport={{ once: true, amount: 0.2, margin: '0px 0px -10% 0px' }}
      transition={{
        duration: reduceMotion ? 0.3 : duration,
        delay: reduceMotion ? 0 : delay,
        ease: reduceMotion ? 'easeOut' : EASE_OUT_EXPO,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
