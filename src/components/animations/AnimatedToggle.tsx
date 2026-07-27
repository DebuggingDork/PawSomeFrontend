import React from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

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
  const reduceMotion = useReducedMotion()

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial="collapsed"
          animate="open"
          exit="collapsed"
          variants={{
            // Height is what stops the sections below snapping up the page, so
            // it still animates by default. Under reduced motion the panel
            // resizes at once and only the fade is left.
            open: { opacity: 1, height: 'auto', marginTop: 16 },
            collapsed: { opacity: 0, height: reduceMotion ? 'auto' : 0, marginTop: 0 },
          }}
          transition={{ duration: reduceMotion ? 0.2 : 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`overflow-hidden ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
