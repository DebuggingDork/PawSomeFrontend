import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { HeroEntranceContainer, HeroEntranceItem } from '../../../components/animations/HeroEntrance'
import { ParallaxImage } from '../../../components/animations/ParallaxImage'

export const HeroSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  // Scale from 1 → 0.92 as user scrolls past the hero
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92])
  // Round corners as it shrinks to give a "card receding" effect
  const borderRadius = useTransform(scrollYProgress, [0, 1], [0, 24])
  // Slight opacity fade to sell the depth
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.6])

  return (
    <section ref={sectionRef} className="relative w-full h-screen min-h-[600px] bg-neutral-950">
      <motion.div
        style={{ scale, borderRadius, opacity }}
        className="sticky top-0 w-full h-screen min-h-[600px] flex items-center overflow-hidden origin-center will-change-transform"
      >
        {/* Background Parallax */}
        <div className="absolute inset-0 z-0">
          <ParallaxImage
            src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80"
            alt="Happy dogs running"
            className="w-full h-full opacity-40"
          />
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex">
          <div className="max-w-2xl">
            <HeroEntranceContainer>
              <HeroEntranceItem>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
                  Find the Perfect <br />
                  <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">Match</span> for your Pet
                </h1>
              </HeroEntranceItem>
              
              <HeroEntranceItem delay={0.2}>
                <p className="text-lg md:text-xl text-neutral-300 mb-10 max-w-lg leading-relaxed">
                  Connect with verified, responsible breeders. Premium matching for dogs and cats, ensuring healthy and happy generations.
                </p>
              </HeroEntranceItem>

              <HeroEntranceItem delay={0.4}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="px-8 py-4 bg-pink-500 hover:bg-pink-600 text-white rounded-full font-semibold transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] cursor-pointer">
                    Find Match for Dog
                  </button>
                  <button className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 hover:border-neutral-500 rounded-full font-semibold transition-all cursor-pointer">
                    Find Match for Cat
                  </button>
                </div>
              </HeroEntranceItem>
            </HeroEntranceContainer>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
