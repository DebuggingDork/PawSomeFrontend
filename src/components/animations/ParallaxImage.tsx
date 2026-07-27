import React, { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'

interface ParallaxImageProps {
  src: string
  alt: string
  className?: string
  /** Applied to the <img> itself, for grading the photo (brightness, saturate)
   *  before any scrim goes over it. Kept separate from `className`, which sizes
   *  and clips the frame. */
  imgClassName?: string
  offset?: number
  /** Set on the hero photo. It is the largest thing on the page and the first
   *  thing painted, so it must not queue behind lazily-loaded imagery below. */
  priority?: boolean
}

export const ParallaxImage: React.FC<ParallaxImageProps> = ({
  src,
  alt,
  className = '',
  imgClassName = '',
  offset = 100,
  priority = false,
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // Move the image vertically as we scroll past it. Parallax is pure decoration
  // — under reduced motion the photo simply holds still.
  const y = useTransform(scrollYProgress, [0, 1], [-offset, offset])

  return (
    <div ref={ref} className={`overflow-hidden relative ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className={`absolute inset-0 w-full h-full object-cover scale-[1.15] ${imgClassName}`}
        style={reduceMotion ? undefined : { y }}
      />
    </div>
  )
}
