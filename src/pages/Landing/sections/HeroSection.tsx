import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { HeroEntranceContainer, HeroEntranceItem } from '../../../components/animations/HeroEntrance'
import { ParallaxImage } from '../../../components/animations/ParallaxImage'
import { ArrowRight } from 'lucide-react'

export const HeroSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92])
  const borderRadius = useTransform(scrollYProgress, [0, 1], [0, 24])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.6])

  return (
    <section ref={sectionRef} className="relative w-full h-screen min-h-[700px] bg-[#faf8f5]">
      <motion.div
        style={{ scale, borderRadius, opacity }}
        className="sticky top-0 w-full h-screen min-h-[700px] flex items-center overflow-hidden origin-center will-change-transform"
      >
        {/* Background - NO overlay, bright image */}
        <div className="absolute inset-0 z-0">
          <ParallaxImage
            src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80"
            alt="Happy dogs running together"
            className="w-full h-full brightness-125 contrast-105"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-32">
          <HeroEntranceContainer>
            {/* Main headline - smaller size */}
            <HeroEntranceItem>
              <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-medium leading-[1] text-[#1a3a52] mb-8 max-w-3xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                <span className="block text-[#2d5f4d]/70 text-[clamp(1rem,2.5vw,1.8rem)] mb-3">
                  Your pet deserves
                </span>
                <span className="block">a trusted <span className="italic text-[#e85d2a]">companion</span></span>
              </h1>
            </HeroEntranceItem>

            {/* Sub copy */}
            <HeroEntranceItem delay={0.15}>
              <div className="max-w-xl mb-10">
                <p className="text-lg text-[#1a3a52] leading-relaxed font-medium">
                  Connect with verified, ethical breeders who prioritize health, temperament, and responsible breeding practices.
                </p>
              </div>
            </HeroEntranceItem>

            {/* CTAs */}
            <HeroEntranceItem delay={0.3}>
              <div className="flex flex-wrap gap-4">
                <a
                  href="#pet-toggle"
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-[#e85d2a] hover:bg-[#d94820] text-white font-bold text-base transition-colors cursor-pointer shadow-lg shadow-[#e85d2a]/20"
                  style={{ fontFamily: 'Space Grotesk, monospace' }}
                >
                  Find Your Match
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center px-8 py-4 border-2 border-[#2d5f4d] hover:bg-[#2d5f4d]/5 text-[#2d5f4d] hover:text-[#1a3a52] font-semibold text-base transition-colors cursor-pointer"
                  style={{ fontFamily: 'Space Grotesk, monospace' }}
                >
                  How it works
                </a>
              </div>
            </HeroEntranceItem>
          </HeroEntranceContainer>
        </div>
      </motion.div>
    </section>
  )
}
