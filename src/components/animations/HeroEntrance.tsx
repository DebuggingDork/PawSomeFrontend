import React from 'react'
import { motion } from 'framer-motion'

interface HeroEntranceProps {
  children: React.ReactNode
  delay?: number
}

export const HeroEntranceContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.15,
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
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1],
            delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}
