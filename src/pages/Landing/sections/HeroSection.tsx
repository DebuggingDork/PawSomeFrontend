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
        {/* Background - bright, well-lit image */}
        <div className="absolute inset-0 z-0">
          <ParallaxImage
            src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&q=80"
            alt="Happy healthy dogs in bright natural lighting"
            className="w-full h-full"
          />
          {/* Light overlay to maintain text readability */}
          <div className="absolute inset-0 bg-[#faf8f5]/75" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-32">
          <HeroEntranceContainer>
            {/* Eyebrow */}
            <HeroEntranceItem>
              <div className="inline-flex items-center gap-2 mb-6">
                <div className="w-2 h-2 bg-[#2f9b6b] rounded-full animate-pulse" />
                <p className="text-sm font-medium text-[#2f9b6b]" style={{ fontFamily: 'Space Grotesk, monospace' }}>
                  Real breeders. Real standards.
                </p>
              </div>
            </HeroEntranceItem>

            {/* Main headline */}
            <HeroEntranceItem>
              <h1 className="text-[clamp(3rem,8vw,6.5rem)] font-medium leading-[0.95] text-[#1a3a52] mb-8 max-w-4xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                <span className="block text-[#2d5f4d]/60 text-[clamp(1.2rem,3.5vw,2.5rem)] mb-3">
                  Breeding shouldn't
                </span>
                <span className="block">be <span className="italic text-[#e85d2a]">sketchy</span></span>
                <span className="block relative">
                  <span className="block">or <span className="italic text-[#e85d2a]">shady</span></span>
                  <svg 
                    className="absolute -bottom-1 left-[2.8rem] w-[70%] h-3 text-[#e85d2a]"
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
                <p className="text-xl text-[#1a3a52] leading-relaxed font-medium">
                  We only work with breeders who actually care about their animals.
                </p>
                <p className="text-base text-[#2d5f4d] leading-relaxed">
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
