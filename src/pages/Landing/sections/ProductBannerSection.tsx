import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ParallaxImage } from '../../../components/animations/ParallaxImage'
import { ScrollReveal } from '../../../components/animations/ScrollReveal'

export const ProductBannerSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  // Horizontal scale from 0.85 to 1 (expands from sides)
  const scaleX = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1, 0.98])
  const scaleY = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.99])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.5, 1, 1, 0.8])
  const borderRadius = useTransform(scrollYProgress, [0, 0.5, 1], [40, 0, 20])

  return (
    <section ref={sectionRef} className="relative py-36 bg-neutral-950 overflow-hidden border-t border-neutral-900">
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ 
          scaleX, 
          scaleY, 
          opacity,
          borderRadius,
        }}
      >
        <div className="relative w-full h-full">
          <ParallaxImage
            src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80"
            alt="Dogs"
            className="w-full h-full"
            offset={60}
          />
          {/* Radial gradient - lighter in center, darker at edges */}
          <div className="absolute inset-0 bg-gradient-radial from-neutral-950/70 via-neutral-950/80 to-neutral-950/95" />
        </div>
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <ScrollReveal className="max-w-2xl mx-auto" scale duration={1}>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">Built for pet parents, <br className="hidden sm:block" />by pet parents.</h2>
          <p className="text-xl text-neutral-300 mb-10 leading-relaxed">Download the PawSome app today and join a trusted community finding great companions for their pets.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-8 py-4 bg-white text-neutral-950 hover:bg-neutral-100 rounded-full font-bold transition-all shadow-[0_0_30px_rgba(255,255,255,0.08)] hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] cursor-pointer">
              Download on App Store
            </button>
            <button className="px-8 py-4 bg-transparent border border-white/30 text-white hover:bg-white/10 hover:border-white/60 rounded-full font-bold transition-all cursor-pointer">
              Get it on Google Play
            </button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
