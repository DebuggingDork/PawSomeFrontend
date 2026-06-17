import React, { useState } from 'react'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'

interface StickyNavProps {
  children: React.ReactNode
}

export const StickyNav: React.FC<StickyNavProps> = ({ children }) => {
  const { scrollY } = useScroll()
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() ?? 0
    if (latest > previous && latest > 150) {
      setHidden(true)
    } else {
      setHidden(false)
    }
    
    if (latest > 50) {
      setScrolled(true)
    } else {
      setScrolled(false)
    }
  })

  return (
    <motion.header
      variants={{
        visible: { y: 0 },
        hidden: { y: '-100%' },
      }}
      animate={hidden ? 'hidden' : 'visible'}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-neutral-950/95 backdrop-blur-xl border-b border-neutral-800/50 shadow-2xl' : 'bg-transparent'
      }`}
    >
      {children}
    </motion.header>
  )
}
