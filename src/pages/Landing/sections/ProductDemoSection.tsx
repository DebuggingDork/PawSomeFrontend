import React from 'react'
import { VideoPlayer } from '@/components/ui/video-thumbnail-player'
import { ScrollReveal } from '@/components/animations/ScrollReveal'
import { MaskReveal } from '@/components/animations/MaskReveal'
import { siteImages } from '@/lib/siteImages'
import { siteVideos } from '@/lib/siteVideos'

/**
 * Product demo — a two-minute screen recording of the actual app (profile,
 * discover, match, chat), not a marketing reel. This is what the hero's
 * "See how it works" link now scrolls to, in place of the numbered
 * How It Works section below it. That section stays exactly as it is and
 * still has its own place on the page; this just gives "see how it works"
 * something to actually show rather than three illustrated steps.
 */
export const ProductDemoSection: React.FC = () => {
  return (
    <section
      id="demo"
      className="scroll-mt-24 border-t border-neutral-900 bg-neutral-950 py-24 md:py-32"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <MaskReveal>
            <h2 className="text-balance font-display text-4xl font-bold tracking-[-0.02em] text-white md:text-5xl">
              See it before you sign up.
            </h2>
          </MaskReveal>
          <ScrollReveal delay={0.12}>
            <p className="mt-5 text-pretty text-lg leading-relaxed text-neutral-300">
              A real walkthrough of PawSome — building a profile, browsing nearby pets,
              matching and chatting — not a highlight reel.
            </p>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={0.2} className="mt-12">
          <VideoPlayer
            thumbnailUrl={siteImages.videoDemoThumbnail}
            videoUrl={siteVideos.productDemo}
            title="PawSome, walked through"
            description="Profile setup, discovery, matching and chat — end to end."
            aspectRatio="16/9"
            className="mx-auto border border-neutral-800"
          />
        </ScrollReveal>
      </div>
    </section>
  )
}
