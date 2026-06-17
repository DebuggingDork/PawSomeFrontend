import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AnimatedToggleProps {
  isOpen: boolean
  children: React.ReactNode
  className?: string
}

export const AnimatedToggle: React.FC<AnimatedToggleProps> = ({
  isOpen,
  children,
  className = '',
}) => {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial="collapsed"
          animate="open"
          exit="collapsed"
          variants={{
            open: { opacity: 1, height: 'auto', marginTop: 16 },
            collapsed: { opacity: 0, height: 0, marginTop: 0 },
          }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`overflow-hidden ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
