import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

type ItemElement = 'div' | 'span' | 'p'

const ELEMENTS = {
  div: motion.div,
  span: motion.span,
  p: motion.p,
} as const

interface HeroEntranceItemProps {
  children: React.ReactNode
  delay?: number
  /**
   * Element to render. Use "span" for items that sit inside the <h1> so the
   * heading keeps holding phrasing content only.
   */
  as?: ItemElement
  /**
   * Layout classes belong on the animated element itself, never on a wrapper
   * around it.
   *
   * The entrance animates `y`, and a transformed element becomes the containing
   * block for every `position: absolute` descendant. When the hero's positioned
   * text lived *inside* these items, it spent the whole animation anchored to
   * the item's own box — bunched up under the navbar — and only snapped to the
   * right corner of the section once the animation finished and framer-motion
   * dropped the transform. Most visible on a reload, which is exactly when
   * someone is watching the page arrive.
   */
  className?: string
  style?: React.CSSProperties
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
            staggerChildren: reduceMotion ? 0 : 0.12,
          },
        },
      }}
      className="w-full"
    >
      {children}
    </motion.div>
  )
}

export const HeroEntranceItem: React.FC<HeroEntranceItemProps> = ({
  children,
  delay = 0,
  as = 'div',
  className,
  style,
}) => {
  const reduceMotion = useReducedMotion()
  const Element = ELEMENTS[as]

  return (
    <Element
      className={className}
      style={style}
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
    </Element>
  )
}
