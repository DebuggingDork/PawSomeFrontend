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
        className="sticky top-0 w-full h-screen min-h-[700px] flex flex-col overflow-hidden origin-center will-change-transform"
      >
        {/* Background - bright image */}
        <div className="absolute inset-0 z-0">
          <ParallaxImage
            src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80"
            alt="Happy dogs running together"
            className="w-full h-full brightness-110 contrast-105"
          />
          {/* Stronger gradient overlay on left side */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
        </div>

        {/* Main content */}
        <div className="relative z-10 flex-1 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <HeroEntranceContainer>
              {/* Main headline */}
              <HeroEntranceItem>
                <h1 className="text-[clamp(3.5rem,8vw,6.5rem)] font-medium leading-[0.95] text-white mb-6 max-w-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Find your<br />
                  <span className="italic text-[#ff6b35]">perfect match</span>{' '}
                  <Heart className="inline-block w-12 h-12 text-[#ff6b35] fill-[#ff6b35]" style={{ transform: 'translateY(-10px)' }} />
                </h1>
              </HeroEntranceItem>

              {/* Sub copy */}
              <HeroEntranceItem delay={0.1}>
                <p className="text-base text-neutral-200 leading-relaxed mb-8 max-w-md">
                  PawSome helps pet parents find trusted companions nearby — just like you.
                </p>
              </HeroEntranceItem>

              {/* Feature list */}
              <HeroEntranceItem delay={0.15}>
                <div className="space-y-3 mb-10">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-[#ff6b35] shrink-0" />
                    <div>
                      <h3 className="text-white font-semibold text-sm">Matches near you</h3>
                      <p className="text-neutral-400 text-xs">Connect with pets & parents in your area</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-[#ff6b35] shrink-0" />
                    <div>
                      <h3 className="text-white font-semibold text-sm">Verified & safe</h3>
                      <p className="text-neutral-400 text-xs">Every profile is verified for your peace of mind</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-[#ff6b35] shrink-0" />
                    <div>
                      <h3 className="text-white font-semibold text-sm">Friendly connections</h3>
                      <p className="text-neutral-400 text-xs">Build real bonds that last</p>
                    </div>
                  </div>
                </div>
              </HeroEntranceItem>

              {/* CTAs - ABOVE stats bar */}
              <HeroEntranceItem delay={0.2}>
                <div className="flex flex-wrap gap-4 items-center">
                  <a
                    href="#pet-toggle"
                    className="group inline-flex items-center gap-3 px-7 py-3.5 bg-[#ff6b35] hover:bg-[#ff5722] text-white font-bold text-sm transition-colors cursor-pointer rounded-full shadow-lg shadow-[#ff6b35]/30"
                  >
                    <Sparkles className="w-5 h-5" />
                    Find Matches Nearby
                  </a>
                  <a
                    href="#how-it-works"
                    className="inline-flex items-center gap-2 px-6 py-3.5 border-2 border-white/30 hover:bg-white/5 text-white font-semibold text-sm transition-colors cursor-pointer rounded-full"
                  >
                    <ArrowDown className="w-4 h-4" />
                    Learn more
                  </a>
                </div>
              </HeroEntranceItem>
            </HeroEntranceContainer>
          </div>
        </div>

        {/* Stats bar at bottom - separate from content */}
        <div className="relative z-20 bg-black/60 backdrop-blur-sm border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <Heart className="w-7 h-7 text-[#ff6b35]" />
                <div>
                  <div className="text-white font-bold text-lg">10K+</div>
                  <div className="text-neutral-400 text-xs">Happy Pets</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-7 h-7 text-[#ff6b35]" />
                <div>
                  <div className="text-white font-bold text-lg">8K+</div>
                  <div className="text-neutral-400 text-xs">Pet Parents</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-7 h-7 text-[#ff6b35]" />
                <div>
                  <div className="text-white font-bold text-lg">100%</div>
                  <div className="text-neutral-400 text-xs">Verified Profiles</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Heart className="w-7 h-7 text-[#ff6b35] fill-[#ff6b35]" />
                <div>
                  <div className="text-white font-bold text-lg">Daily</div>
                  <div className="text-neutral-400 text-xs">New Matches</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
