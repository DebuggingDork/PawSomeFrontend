import { HeroSection } from './sections/HeroSection'
import { HowItWorksSection } from './sections/HowItWorksSection'
import { PetToggleSection } from './sections/PetToggleSection'
import { FeaturedPetsSection } from './sections/FeaturedPetsSection'
import { TrustSection } from './sections/TrustSection'
import { ClosingSection } from './sections/ClosingSection'
import { FooterSection } from './sections/FooterSection'

/**
 * Ordered as the questions a stranger actually asks, in the order they ask them:
 * what is this (hero), how does it work, who is already here, show me properly,
 * can I trust it, fine — how do I start.
 *
 * The previous order answered "can I trust it" second, before the page had shown
 * a single pet, so the reassurance had nothing to attach to yet.
 */
function LandingPage() {
  return (
    <div className="flex w-full min-w-0 max-w-full flex-col overflow-x-clip bg-neutral-950">
      <HeroSection />
      <HowItWorksSection />
      <PetToggleSection />
      <FeaturedPetsSection />
      <TrustSection />
      <ClosingSection />
      <FooterSection />
    </div>
  )
}

export default LandingPage
