import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ScrollReveal } from '../../../components/animations/ScrollReveal'
import { AnimatedToggle } from '../../../components/animations/AnimatedToggle'
import { HoverCard } from '../../../components/animations/HoverCard'

export const PetToggleSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dog' | 'cat' | null>('dog')

  const handleToggle = (tab: 'dog' | 'cat') => {
    setActiveTab(prev => (prev === tab ? null : tab))
  }

  return (
    <section id="pet-toggle" className="py-28 bg-neutral-900 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-14" scale>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-10">Meet Our Premium Matches</h2>
          
          <div className="inline-flex gap-2 p-1.5 bg-neutral-800/60 rounded-full backdrop-blur-sm ring-1 ring-neutral-700/50">
            <button
              onClick={() => handleToggle('dog')}
              className={`relative px-8 py-3.5 rounded-full font-bold transition-all cursor-pointer ${
                activeTab === 'dog' 
                  ? 'text-white' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {activeTab === 'dog' && (
                <motion.div
                  layoutId="toggle-pill"
                  className="absolute inset-0 bg-pink-500 rounded-full shadow-[0_0_20px_rgba(236,72,153,0.3)]"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className="relative z-10">For Dogs</span>
            </button>
            <button
              onClick={() => handleToggle('cat')}
              className={`relative px-8 py-3.5 rounded-full font-bold transition-all cursor-pointer ${
                activeTab === 'cat' 
                  ? 'text-white' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {activeTab === 'cat' && (
                <motion.div
                  layoutId="toggle-pill"
                  className="absolute inset-0 bg-violet-500 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className="relative z-10">For Cats</span>
            </button>
          </div>
        </ScrollReveal>

        <AnimatedToggle isOpen={activeTab === 'dog'}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <HoverCard key={`dog-${i}`} className="bg-neutral-950">
                <div className="aspect-square bg-neutral-800 overflow-hidden relative">
                  <img src={`https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=400&h=400&sig=${i}`} alt="Dog Match" className="object-cover w-full h-full" />
                </div>
                <div className="p-6">
                  <h4 className="text-lg font-bold text-white mb-1">Golden Retriever</h4>
                  <p className="text-sm text-pink-500 font-semibold mb-3">DNA Verified</p>
                  <p className="text-neutral-400 text-sm">Champion bloodline, excellent temperament.</p>
                </div>
              </HoverCard>
            ))}
          </div>
        </AnimatedToggle>

        <AnimatedToggle isOpen={activeTab === 'cat'}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <HoverCard key={`cat-${i}`} className="bg-neutral-950">
                <div className="aspect-square bg-neutral-800 overflow-hidden relative">
                  <img src={`https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400&h=400&sig=${i}`} alt="Cat Match" className="object-cover w-full h-full" />
                </div>
                <div className="p-6">
                  <h4 className="text-lg font-bold text-white mb-1">British Shorthair</h4>
                  <p className="text-sm text-violet-500 font-semibold mb-3">Health Screened</p>
                  <p className="text-neutral-400 text-sm">Award-winning lineage, beautiful coat.</p>
                </div>
              </HoverCard>
            ))}
          </div>
        </AnimatedToggle>
      </div>
    </section>
  )
}
