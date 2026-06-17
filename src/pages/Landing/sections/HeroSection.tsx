import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { HeroEntranceContainer, HeroEntranceItem } from '../../../components/animations/HeroEntrance'
import { ParallaxImage } from '../../../components/animations/ParallaxImage'
import { MapPin, Shield, Heart, ArrowDown, Sparkles } from 'lucide-react'

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
        {/* Background - bright image */}
        <div className="absolute inset-0 z-0">
          <ParallaxImage
            src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80"
            alt="Happy dogs running together"
            className="w-full h-full brightness-110 contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20">
          <HeroEntranceContainer>
            {/* Main headline */}
            <HeroEntranceItem>
              <h1 className="text-[clamp(3rem,7vw,5.5rem)] font-medium leading-[1] text-white mb-6 max-w-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                Find your<br />
                <span className="italic text-[#ff6b35]">perfect match</span>
                <Heart className="inline-block w-12 h-12 ml-3 text-[#ff6b35] fill-[#ff6b35]" style={{ transform: 'translateY(-8px)' }} />
              </h1>
            </HeroEntranceItem>

            {/* Sub copy */}
            <HeroEntranceItem delay={0.1}>
              <p className="text-lg text-neutral-200 leading-relaxed mb-10 max-w-xl">
                PawSome helps pet parents find trusted companions nearby — just like you.
              </p>
            </HeroEntranceItem>

            {/* Feature list */}
            <HeroEntranceItem delay={0.2}>
              <div className="space-y-4 mb-12">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#ff6b35]/20 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-[#ff6b35]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Matches near you</h3>
                    <p className="text-neutral-400 text-sm">Connect with pets & parents in your area</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#ff6b35]/20 flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5 text-[#ff6b35]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Verified & safe</h3>
                    <p className="text-neutral-400 text-sm">Every profile is verified for your peace of mind</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#ff6b35]/20 flex items-center justify-center shrink-0">
                    <Heart className="w-5 h-5 text-[#ff6b35]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Friendly connections</h3>
                    <p className="text-neutral-400 text-sm">Build real bonds that last</p>
                  </div>
                </div>
              </div>
            </HeroEntranceItem>

            {/* CTAs */}
            <HeroEntranceItem delay={0.3}>
              <div className="flex flex-wrap gap-4 items-center">
                <a
                  href="#pet-toggle"
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-[#ff6b35] hover:bg-[#ff5722] text-white font-bold text-base transition-colors cursor-pointer rounded-full shadow-lg shadow-[#ff6b35]/30"
                  style={{ fontFamily: 'DM Sans, sans-serif' }}
                >
                  <Sparkles className="w-5 h-5" />
                  Find Matches Nearby
                </a>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 px-6 py-4 border-2 border-white/20 hover:bg-white/5 text-white font-semibold text-base transition-colors cursor-pointer rounded-full"
                  style={{ fontFamily: 'DM Sans, sans-serif' }}
                >
                  <ArrowDown className="w-5 h-5" />
                  Learn more
                </a>
              </div>
            </HeroEntranceItem>
          </HeroEntranceContainer>
        </div>

        {/* Stats bar at bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-neutral-950/80 backdrop-blur-md border-t border-neutral-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="flex items-center gap-3">
                <Heart className="w-8 h-8 text-[#ff6b35]" />
                <div>
                  <div className="text-white font-bold text-xl">10K+</div>
                  <div className="text-neutral-400 text-sm">Happy Pets</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-8 h-8 text-[#ff6b35]" />
                <div>
                  <div className="text-white font-bold text-xl">8K+</div>
                  <div className="text-neutral-400 text-sm">Pet Parents</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-[#ff6b35]" />
                <div>
                  <div className="text-white font-bold text-xl">100%</div>
                  <div className="text-neutral-400 text-sm">Verified Profiles</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Heart className="w-8 h-8 text-[#ff6b35] fill-[#ff6b35]" />
                <div>
                  <div className="text-white font-bold text-xl">Daily</div>
                  <div className="text-neutral-400 text-sm">New Matches</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
