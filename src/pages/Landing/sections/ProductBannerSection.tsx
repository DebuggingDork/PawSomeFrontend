import React from 'react'
import { ParallaxImage } from '../../../components/animations/ParallaxImage'
import { ScrollReveal } from '../../../components/animations/ScrollReveal'

export const ProductBannerSection: React.FC = () => {
  return (
    <section className="relative py-36 bg-neutral-950 overflow-hidden border-t border-neutral-900">
      <div className="absolute inset-0 z-0 opacity-30">
         <ParallaxImage
          src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80"
          alt="Dogs"
          className="w-full h-full"
          offset={60}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/60 via-neutral-950/80 to-neutral-950" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <ScrollReveal className="max-w-2xl mx-auto" scale duration={1}>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">Built for breeders, <br className="hidden sm:block" />by breeders.</h2>
          <p className="text-xl text-neutral-300 mb-10 leading-relaxed">Download the PawSome app today and join the most trusted community of ethical pet breeders.</p>
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
