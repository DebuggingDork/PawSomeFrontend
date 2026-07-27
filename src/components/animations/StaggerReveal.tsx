import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface StaggerRevealProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
}

/** See ScrollReveal for why this curve rather than a built-in ease-out. */
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

export const StaggerRevealContainer: React.FC<StaggerRevealProps> = ({
  children,
  className = '',
  staggerDelay = 0.09,
}) => {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15, margin: '0px 0px -8% 0px' }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            // The cascade is decoration. Without it the items just fade in
            // together, which is exactly what reduced motion is asking for.
            staggerChildren: reduceMotion ? 0 : staggerDelay,
            delayChildren: reduceMotion ? 0 : 0.1,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export const StaggerRevealItem: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      variants={{
        hidden: reduceMotion
          ? { opacity: 0 }
          : { opacity: 0, y: 52, scale: 0.97, filter: 'blur(5px)' },
        visible: {
          opacity: 1,
          ...(reduceMotion ? {} : { y: 0, scale: 1, filter: 'blur(0px)' }),
          transition: {
            duration: reduceMotion ? 0.3 : 0.7,
            ease: reduceMotion ? 'easeOut' : EASE_OUT_EXPO,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
