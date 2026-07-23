import React from 'react'
import { Shield, Heart, Activity } from 'lucide-react'
import { ScrollReveal } from '../../../components/animations/ScrollReveal'
import { StaggerRevealContainer, StaggerRevealItem } from '../../../components/animations/StaggerReveal'
import { HoverCard } from '../../../components/animations/HoverCard'

const PROOF_POINTS = [
  {
    icon: <Shield className="w-8 h-8 text-pink-500" />,
    title: 'Verified Profiles',
    description: 'Every pet parent is verified, so you always know who you and your pet are really meeting.',
  },
  {
    icon: <Heart className="w-8 h-8 text-violet-500" />,
    title: 'Built on Trust',
    description: 'Clear community guidelines keep every conversation and playdate respectful and pet-first.',
  },
  {
    icon: <Activity className="w-8 h-8 text-blue-500" />,
    title: 'Safety Tools',
    description: 'Block, report, and manage your matches anytime — your comfort always comes first.',
  },
]

export const ProofPointsSection: React.FC = () => {
  return (
    <section className="py-28 bg-neutral-950 relative border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-20" scale>
          <h2 className="text-sm font-bold tracking-widest uppercase text-pink-500 mb-3">
            Why Choose PawSome
          </h2>
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Trust, built in.
          </h3>
          <p className="text-lg text-neutral-400 leading-relaxed">
            We believe every pet deserves great friends and every parent deserves peace of mind. Our verification and safety tools make sure every match feels good.
          </p>
        </ScrollReveal>

        <StaggerRevealContainer className="grid grid-cols-1 md:grid-cols-3 gap-8" staggerDelay={0.15}>
          {PROOF_POINTS.map((point, index) => (
            <StaggerRevealItem key={index} className="h-full">
              <HoverCard className="p-10 h-full flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neutral-800/80 to-neutral-800/30 flex items-center justify-center mb-6 ring-1 ring-neutral-700/50">
                  {point.icon}
                </div>
                <h4 className="text-xl font-bold text-white mb-4">{point.title}</h4>
                <p className="text-neutral-400 leading-relaxed">
                  {point.description}
                </p>
              </HoverCard>
            </StaggerRevealItem>
          ))}
        </StaggerRevealContainer>

      </div>
    </section>
  )
}
