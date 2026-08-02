import React, { useRef } from 'react'
import { Link } from 'react-router'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { Heart } from 'lucide-react'
import { ParallaxImage } from '@/components/animations/ParallaxImage'
import { ScrollReveal } from '@/components/animations/ScrollReveal'
import { MaskReveal } from '@/components/animations/MaskReveal'
import { siteImages } from '@/lib/siteImages'

/**
 * The last thing on the page before the footer.
 *
 * Keeps the scroll-driven expand it had — the band grows in from the sides as it
 * comes up the viewport, then eases back as it leaves — but not the two buttons
 * that were sitting under it. Those read "Download on App Store" and "Get it on
 * Google Play", and PawSome has neither: it is a web app, both buttons were
 * inert, and a homepage whose final call to action is a link to a store that
 * does not exist is the worst place to lose someone. The real next steps are
 * making a profile or looking around first, so those are the two on offer.
 */
export const ClosingSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const scaleX = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1, 0.98])
  const scaleY = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.99])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.5, 1, 1, 0.8])
  const borderRadius = useTransform(scrollYProgress, [0, 0.5, 1], [40, 0, 20])

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-t border-neutral-900 bg-neutral-950 py-32 md:py-40"
    >
      <motion.div
        className="absolute inset-0 z-0"
        style={reduceMotion ? undefined : { scaleX, scaleY, opacity, borderRadius }}
      >
        <div className="relative h-full w-full">
          <ParallaxImage
            src={siteImages.duskRun}
            alt=""
            className="h-full w-full"
            imgClassName="brightness-[1.28] saturate-[1.25] contrast-[1.05]"
            offset={60}
          />
          {/* This band was the dimmest thing on the page, and the cause was a
              scrim pointing the wrong way. It laid a flat 75% black over the
              whole photo and then a radial that was TRANSPARENT in the centre
              and opaque at the edges — so the darkness was heaviest exactly
              where the two dogs are, and the headline in the middle got no help
              from it anyway. Both dogs were lost and the frame read as a grey
              rectangle.

              Inverted and lightened: the photo is graded up, the flat pass is
              roughly halved, and the radial now pools softly BEHIND the
              headline while leaving the outer frame comparatively open. The
              edges still resolve to the page ground so the animated corner
              radius has something to land on. */}
          <div className="absolute inset-0 bg-neutral-950/38" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(58% 62% at 50% 46%, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.34) 55%, rgba(10,10,10,0.12) 78%, rgba(10,10,10,0.55) 100%)',
            }}
          />
          {/* Warm bloom, same trick as the hero: adds light instead of removing
              it, which is what keeps a dusk photograph feeling like dusk rather
              than like an underexposed frame. */}
          <div
            className="absolute inset-0 mix-blend-screen"
            style={{
              backgroundImage:
                'radial-gradient(70% 80% at 50% 55%, rgba(255,138,61,0.09) 0%, rgba(255,107,53,0.035) 45%, rgba(0,0,0,0) 75%)',
            }}
          />
        </div>
      </motion.div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <ScrollReveal className="mx-auto max-w-2xl" scale duration={1}>
          <MaskReveal duration={1}>
            <h2
              className="text-balance font-serif text-[clamp(2.25rem,5vw,4rem)] font-medium leading-[1.05] text-white"
              style={{ letterSpacing: '-0.02em' }}
            >
              Somewhere nearby there is a dog with nothing on this weekend.
            </h2>
          </MaskReveal>
          <p className="mx-auto mt-6 max-w-[52ch] text-pretty text-lg leading-relaxed text-neutral-200">
            PawSome is early and local, which means it is only useful if your
            neighbours are on it too. Adding your pet is how that starts.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 font-bold text-white shadow-lg shadow-brand/25 transition-[transform,background-color] duration-200 ease-out-quart hover:bg-brand-dark active:scale-[0.97] motion-reduce:transition-none"
            >
              <Heart className="h-4 w-4" aria-hidden="true" />
              Add your pet
            </Link>
            <Link
              to="/community"
              className="inline-flex items-center justify-center rounded-full border border-white/25 px-8 py-4 font-bold text-white transition-[transform,background-color,border-color] duration-200 ease-out-quart hover:border-white/50 hover:bg-white/10 active:scale-[0.97] motion-reduce:transition-none"
            >
              Look around first
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
