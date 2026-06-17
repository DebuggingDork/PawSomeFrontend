import React from 'react'
import { motion } from 'framer-motion'

interface HoverZoomImageProps {
  src: string
  alt: string
  className?: string
  aspectRatio?: string
}

export const HoverZoomImage: React.FC<HoverZoomImageProps> = ({
  src,
  alt,
  className = '',
  aspectRatio = 'aspect-[4/3]',
}) => {
  return (
    <motion.div
      whileHover="hover"
      className={`relative overflow-hidden rounded-2xl w-full ${aspectRatio} ${className}`}
    >
      <motion.img
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
        variants={{
          hover: { scale: 1.05 },
        }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </motion.div>
  )
}
