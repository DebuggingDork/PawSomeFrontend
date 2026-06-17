import { HeroSection } from './sections/HeroSection'
import { ProofPointsSection } from './sections/ProofPointsSection'
import { PetToggleSection } from './sections/PetToggleSection'
import { FeaturedProductsSection } from './sections/FeaturedProductsSection'
import { ArticlesSection } from './sections/ArticlesSection'
import { ProductBannerSection } from './sections/ProductBannerSection'
import { FooterSection } from './sections/FooterSection'

function LandingPage() {
  return (
    <div className="flex flex-col w-full bg-neutral-950 overflow-x-hidden">
      <HeroSection />
      <ProofPointsSection />
      <PetToggleSection />
      <FeaturedProductsSection />
      <ArticlesSection />
      <ProductBannerSection />
      <FooterSection />
    </div>
  )
}

export default LandingPage
