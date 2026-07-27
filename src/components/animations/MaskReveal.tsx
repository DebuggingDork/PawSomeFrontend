import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface MaskRevealProps {
  children: React.ReactNode
  delay?: number
  /** Seconds. Longer than a UI transition on purpose — this is an editorial
   *  reveal that the reader is meant to watch, not a control responding to a
   *  click, and the 300ms ceiling does not apply to it. */
  duration?: number
  className?: string
  /** Renders the wrapper as a span for use inside a heading or paragraph. */
  as?: 'div' | 'span'
}

/**
 * Type that rises into place from behind its own edge.
 *
 * The content sits in a clipped box and starts fully below it, so instead of
 * fading in from nowhere it appears to be revealed by the mask — the same
 * effect print titles get from a slit. It is the one motion on this page you
 * are supposed to notice, which is why it is reserved for section headings
 * rather than applied to everything: the fades and slides elsewhere are there
 * to stop content appearing abruptly, and if everything announced itself the
 * announcements would stop meaning anything.
 *
 * `overflow: hidden` on text clips descenders (g, y, p) against the box edge,
 * so the inner element carries bottom padding and the outer pulls it back with
 * an equal negative margin. Without that pair the tail of every 'g' is sliced
 * off, which reads as a font bug rather than as a mask.
 */
export const MaskReveal: React.FC<MaskRevealProps> = ({
  children,
  delay = 0,
  duration = 0.9,
  className = '',
  as = 'div',
}) => {
  const reduceMotion = useReducedMotion()
  const Outer = as === 'span' ? motion.span : motion.div
  const Inner = as === 'span' ? motion.span : motion.div
  const display = as === 'span' ? 'inline-block' : 'block'

  // Movement is the entire effect here, so there is nothing to soften into —
  // reduced motion gets a plain fade and no clipping box at all.
  if (reduceMotion) {
    return (
      <Outer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.3 }}
        className={className}
      >
        {children}
      </Outer>
    )
  }

  return (
    <Outer
      className={`${display} overflow-hidden pb-[0.18em] -mb-[0.18em] ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
    >
      <Inner
        className={display}
        variants={{
          hidden: { y: '115%' },
          visible: {
            y: '0%',
            transition: { duration, delay, ease: [0.16, 1, 0.3, 1] },
          },
        }}
      >
        {children}
      </Inner>
    </Outer>
  )
}
