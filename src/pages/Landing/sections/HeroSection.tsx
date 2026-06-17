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
    <section ref={sectionRef} className="relative w-full min-h-screen bg-neutral-950 pt-16">
      <motion.div
        style={{ scale, borderRadius, opacity }}
        className="sticky top-0 w-full min-h-screen flex flex-col overflow-hidden origin-center will-change-transform"
      >
        {/* Background - bright image */}
        <div className="absolute inset-0 z-0">
          <ParallaxImage
            src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80"
            alt="Happy dogs running together"
            className="w-full h-full object-cover brightness-110 contrast-105"
          />
          {/* Premium black overlay on left with subtle fade */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" style={{ backgroundSize: '150% 100%' }} />
        </div>

        {/* Main content */}
        <div className="relative z-10 flex-1 flex items-center pt-16 pb-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12">
            <HeroEntranceContainer>
              {/* Main headline */}
              <HeroEntranceItem>
                <div className="relative">
                  <h1 className="text-[clamp(3.5rem,8vw,6.5rem)] font-medium leading-[0.95] text-white mb-6 max-w-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Find your<br />
                    <span className="relative inline-block">
                      <span className="italic text-[#ff6b35]">perfect match</span>
                      {/* Hand-drawn heart SVG - positioned to the right and top of "match" */}
                      <svg 
                        className="absolute -top-2 -right-14 w-11 h-11 rotate-12" 
                        viewBox="0 0 100 100" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          d="M50,85 C50,85 15,60 15,35 C15,25 20,15 30,15 C40,15 45,22 50,30 C55,22 60,15 70,15 C80,15 85,25 85,35 C85,60 50,85 50,85 Z" 
                          stroke="#ff6b35" 
                          strokeWidth="2.5" 
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{
                            filter: 'url(#rough)',
                          }}
                        />
                        <defs>
                          <filter id="rough">
                            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise" seed="2"/>
                            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G"/>
                          </filter>
                        </defs>
                      </svg>
                    </span>
                  </h1>
                </div>
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

        {/* Stats bar at bottom - in containers */}
        <div className="relative z-20 bg-black/70 backdrop-blur-md border-t border-white/10 py-5 pb-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                <Heart className="w-8 h-8 text-[#ff6b35] shrink-0" />
                <div>
                  <div className="text-white font-bold text-lg">10K+</div>
                  <div className="text-neutral-300 text-xs font-medium">Happy Pets</div>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                <MapPin className="w-8 h-8 text-[#ff6b35] shrink-0" />
                <div>
                  <div className="text-white font-bold text-lg">8K+</div>
                  <div className="text-neutral-300 text-xs font-medium">Pet Parents</div>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                <Shield className="w-8 h-8 text-[#ff6b35] shrink-0" />
                <div>
                  <div className="text-white font-bold text-lg">100%</div>
                  <div className="text-neutral-300 text-xs font-medium">Verified Profiles</div>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                <Heart className="w-8 h-8 text-[#ff6b35] fill-[#ff6b35] shrink-0" />
                <div>
                  <div className="text-white font-bold text-lg">Daily</div>
                  <div className="text-neutral-300 text-xs font-medium">New Matches</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
