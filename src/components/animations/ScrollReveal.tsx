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

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  delay = 0,
  duration = 0.8,
  y = 40,
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
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: reduceMotion ? 0.3 : duration,
        delay: reduceMotion ? 0 : delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
