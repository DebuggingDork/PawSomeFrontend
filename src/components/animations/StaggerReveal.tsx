import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface StaggerRevealProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
}

export const StaggerRevealContainer: React.FC<StaggerRevealProps> = ({
  children,
  className = '',
  staggerDelay = 0.12,
}) => {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
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
          : { opacity: 0, y: 40, scale: 0.96, filter: 'blur(4px)' },
        visible: {
          opacity: 1,
          ...(reduceMotion ? {} : { y: 0, scale: 1, filter: 'blur(0px)' }),
          transition: {
            duration: reduceMotion ? 0.3 : 0.7,
            ease: [0.25, 0.46, 0.45, 0.94],
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
