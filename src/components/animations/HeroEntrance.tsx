import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface HeroEntranceProps {
  children: React.ReactNode
  delay?: number
}

export const HeroEntranceContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: reduceMotion ? 0 : 0.15,
          },
        },
      }}
      className="w-full"
    >
      {children}
    </motion.div>
  )
}

export const HeroEntranceItem: React.FC<HeroEntranceProps> = ({ children, delay = 0 }) => {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      variants={{
        hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          ...(reduceMotion ? {} : { y: 0 }),
          transition: {
            duration: reduceMotion ? 0.3 : 0.8,
            ease: [0.16, 1, 0.3, 1],
            delay: reduceMotion ? 0 : delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}
