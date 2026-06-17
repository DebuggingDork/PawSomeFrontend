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
    <section ref={sectionRef} className="relative w-full h-screen min-h-[700px] bg-neutral-950">
      <motion.div
        style={{ scale, borderRadius, opacity }}
        className="sticky top-0 w-full h-screen min-h-[700px] flex items-center overflow-hidden origin-center will-change-transform"
      >
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <ParallaxImage
            src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80"
            alt="Happy dogs running together"
            className="w-full h-full opacity-50"
          />
          <div className="absolute inset-0 bg-neutral-950/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-32">
          <HeroEntranceContainer>
            {/* Eyebrow */}
            <HeroEntranceItem>
              <div className="inline-flex items-center gap-2 mb-6">
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
                <p className="text-sm font-medium text-pink-400" style={{ fontFamily: 'Space Grotesk, monospace' }}>
                  Real breeders. Real standards.
                </p>
              </div>
            </HeroEntranceItem>

            {/* Main headline */}
            <HeroEntranceItem>
              <h1 className="text-[clamp(3rem,8vw,6.5rem)] font-bold leading-[0.95] text-white mb-8 max-w-4xl" style={{ fontFamily: 'Syne, sans-serif' }}>
                <span className="block text-neutral-400 text-[clamp(1.2rem,3.5vw,2.5rem)] mb-3">
                  Breeding shouldn't be
                </span>
                <span className="block">sketchy</span>
                <span className="block relative">
                  <span className="text-pink-500">or shady</span>
                  <svg 
                    className="absolute -bottom-1 left-0 w-[105%] h-3 text-pink-500/30"
                    viewBox="0 0 300 12"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M2,6 Q150,2 298,6"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>
            </HeroEntranceItem>

            {/* Sub copy */}
            <HeroEntranceItem delay={0.15}>
              <div className="max-w-xl mb-10 space-y-3">
                <p className="text-xl text-white leading-relaxed font-medium">
                  We only work with breeders who actually care about their animals.
                </p>
                <p className="text-base text-neutral-300 leading-relaxed">
                  Health tests? ✓ Genetic screening? ✓ Years of experience? ✓<br />
                  Random backyard operation? Hard pass.
                </p>
              </div>
            </HeroEntranceItem>

            {/* CTAs */}
            <HeroEntranceItem delay={0.3}>
              <div className="flex flex-wrap gap-4">
                <a
                  href="#pet-toggle"
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-pink-500 hover:bg-pink-600 text-white font-bold text-base transition-colors cursor-pointer"
                  style={{ fontFamily: 'Space Grotesk, monospace' }}
                >
                  Find Your Match
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center px-8 py-4 border-2 border-neutral-600 hover:border-neutral-400 text-neutral-200 hover:text-white font-semibold text-base transition-colors cursor-pointer"
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
