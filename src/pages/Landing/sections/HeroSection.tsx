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
            className="w-full h-full opacity-30"
          />
          <div className="absolute inset-0 bg-neutral-950/85" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <HeroEntranceContainer>
            {/* Eyebrow - removed uppercase, made it playful */}
            <HeroEntranceItem>
              <div className="inline-flex items-center gap-2 mb-8">
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
                <p className="text-base font-medium text-pink-400" style={{ fontFamily: 'Space Grotesk, monospace' }}>
                  Real breeders. Real standards.
                </p>
              </div>
            </HeroEntranceItem>

            {/* Main headline - unique, bold, asymmetric */}
            <HeroEntranceItem>
              <h1 className="text-[clamp(3.5rem,9vw,7.5rem)] font-bold leading-[0.9] text-white mb-6 max-w-5xl" style={{ fontFamily: 'Syne, sans-serif' }}>
                <span className="block text-neutral-500 text-[clamp(1.5rem,4vw,3rem)]">
                  Breeding shouldn't be
                </span>
                <span className="block mt-2">sketchy</span>
                <span className="block relative mt-1">
                  <span className="text-pink-500">or shady</span>
                  <svg 
                    className="absolute -bottom-2 left-0 w-[105%] h-4 text-pink-500/30"
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

            {/* Sub copy - authentic, human voice */}
            <HeroEntranceItem delay={0.15}>
              <div className="max-w-xl mb-12 space-y-4">
                <p className="text-xl text-neutral-300 leading-relaxed font-medium">
                  We only work with breeders who actually care about their animals.
                </p>
                <p className="text-lg text-neutral-400 leading-relaxed">
                  Health tests? ✓ Genetic screening? ✓ Years of experience? ✓
                  Random backyard operation? Hard pass.
                </p>
              </div>
            </HeroEntranceItem>

            {/* CTAs - bold, no-nonsense */}
            <HeroEntranceItem delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <a
                  href="#pet-toggle"
                  className="group relative px-8 py-4 bg-pink-500 hover:bg-pink-600 text-white font-bold text-base transition-all cursor-pointer overflow-hidden"
                  style={{ fontFamily: 'Space Grotesk, monospace' }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Find Your Match
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </a>
                <a
                  href="#how-it-works"
                  className="group px-8 py-4 border-2 border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-white font-semibold text-base transition-all cursor-pointer"
                  style={{ fontFamily: 'Space Grotesk, monospace' }}
                >
                  <span className="group-hover:translate-x-0.5 inline-block transition-transform">
                    How it works
                  </span>
                </a>
              </div>
            </HeroEntranceItem>

            {/* Trust badge - unique visual element */}
            <HeroEntranceItem delay={0.45}>
              <div className="mt-16 inline-flex items-center gap-3 px-5 py-3 bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-neutral-700 border-2 border-neutral-950" />
                  <div className="w-8 h-8 rounded-full bg-neutral-600 border-2 border-neutral-950" />
                  <div className="w-8 h-8 rounded-full bg-neutral-700 border-2 border-neutral-950" />
                </div>
                <p className="text-sm text-neutral-400">
                  <span className="text-white font-semibold">2,400+</span> successful matches
                </p>
              </div>
            </HeroEntranceItem>
          </HeroEntranceContainer>
        </div>

        {/* Bottom fade - subtle solid instead of gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-neutral-950/60 z-10" />
      </motion.div>
    </section>
  )
}
