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
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: scrolled 
          ? 'rgba(255, 255, 255, 0.08)' 
          : 'linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.05) 100%)',
        backdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'blur(12px) saturate(130%)',
        WebkitBackdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'blur(12px) saturate(130%)',
        borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.18)' : '1px solid transparent',
        boxShadow: scrolled ? '0 8px 32px 0 rgba(0, 0, 0, 0.25)' : 'none',
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {children}
    </motion.header>
  )
}
