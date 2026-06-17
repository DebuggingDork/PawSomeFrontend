import React from 'react'
import { motion } from 'framer-motion'

interface HoverCardProps {
  children: React.ReactNode
  className?: string
}

export const HoverCard: React.FC<HoverCardProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      whileHover={{
        y: -8,
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)',
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  )
}
