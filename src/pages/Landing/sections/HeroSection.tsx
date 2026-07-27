import { useRef } from 'react'
import { Link } from 'react-router'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { MapPin, Shield, Heart, ArrowDown, Sparkles } from 'lucide-react'
import { HeroEntranceContainer, HeroEntranceItem } from '@/components/animations/HeroEntrance'
import { ParallaxImage } from '@/components/animations/ParallaxImage'
import { siteImages } from '@/lib/siteImages'
import { nameRollCall, useLandingPets } from '../useLandingPets'

const PROMISES = [
  {
    icon: MapPin,
    title: 'Sorted by distance first',
    body: 'A perfect match three cities away does not get your dog to the park any sooner.',
  },
  {
    icon: Shield,
    title: 'Verified by email',
    body: 'A low bar, and we say so on the FAQ. It still keeps the throwaway accounts out.',
  },
  {
    icon: Heart,
    title: 'Breed, age and temperament',
    body: 'Compatibility starts with the animals, not with an engagement metric.',
  },
]

/**
 * The strip along the bottom of the hero.
 *
 * This replaces four tiles reading 10K+ Happy Pets / 8K+ Pet Parents / 100%
 * Verified / Daily New Matches. None of those numbers were real — there are
 * currently thirty-odd pets — and the About page explicitly promises not to pad
 * them. So the strip now says exactly who is here, by name, straight off the
 * /pets response. A smaller true number with Kaju's face next to it does more
 * for a stranger than an invented large one.
 */
function CommunityStrip() {
  const { pets, isLoading, isError } = useLandingPets()
  const faces = pets.all.slice(0, 6)

  // Nothing to say without data, and a marketing page should never show an
  // empty frame where a fact was supposed to go.
  if (isError || (!isLoading && faces.length === 0)) return null

  return (
    <div className="relative z-20 border-t border-white/10 bg-neutral-950/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex items-center gap-4">
          <div className="flex shrink-0 -space-x-3">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-full border-2 border-neutral-950 bg-white/10 motion-safe:animate-pulse"
                  />
                ))
              : faces.map((pet) => (
                  <img
                    key={pet.id}
                    src={pet.primary_photo_url ?? ''}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-10 w-10 rounded-full border-2 border-neutral-950 object-cover"
                  />
                ))}
          </div>

          <p className="text-sm leading-snug text-neutral-200">
            {isLoading ? (
              <span className="inline-block h-4 w-56 rounded bg-white/10 align-middle motion-safe:animate-pulse" />
            ) : (
              <>
                <span className="font-semibold text-white">
                  {nameRollCall(pets.all, 3, pets.total)}
                </span>{' '}
                are on PawSome
              </>
            )}
          </p>
        </div>

        {!isLoading && pets.breedCount > 0 && (
          <p className="text-sm text-neutral-400 md:text-right">
            {pets.breedCount} breeds so far. Early, and we would rather say so.
          </p>
        )}
      </div>
    </div>
  )
}

export const HeroSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92])
  const borderRadius = useTransform(scrollYProgress, [0, 1], [0, 24])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.6])

  return (
    <section ref={sectionRef} className="relative w-full min-h-screen bg-neutral-950">
      <motion.div
        style={reduceMotion ? undefined : { scale, borderRadius, opacity }}
        className="sticky top-0 flex min-h-screen w-full origin-center flex-col overflow-hidden will-change-transform"
      >
        <div className="absolute inset-0 z-0">
          <ParallaxImage
            src={siteImages.heroPets}
            alt=""
            className="h-full w-full"
            priority
          />
          {/* Written as explicit multi-stop gradients rather than Tailwind's
              from/via/to, because the whole problem here is the shape of the
              curve and three stops cannot express it.

              The old hero ran a near-opaque black from the left edge to halfway
              and then straight to transparent. Text was legible, but the photo
              underneath it was flattened to a dark rectangle for most of its
              width — which is what the page looked like: a black panel with a
              dog peering out of the corner.

              This holds ~92% over the headline column, then falls away quickly
              between 50% and 72% so the right third of the photograph is left
              completely alone. It works because the image was picked for it:
              both dogs and all the warm light are in that right third, and the
              left side is already in shadow in the original frame, so the scrim
              is deepening shadow that is genuinely there rather than painting
              black over a lit subject. */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(10,10,10,0.94) 0%, rgba(10,10,10,0.90) 30%, rgba(10,10,10,0.55) 52%, rgba(10,10,10,0.12) 72%, rgba(10,10,10,0) 100%)',
            }}
          />
          {/* Vertical pass, deliberately light: it only has to keep the navbar
              and the strip below from sitting on a bright patch. */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(to bottom, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0) 30%, rgba(10,10,10,0) 74%, rgba(10,10,10,0.7) 100%)',
            }}
          />
          {/* Below md the copy sits over the middle of the frame, where the
              horizontal pass has already faded out, so narrow screens get a flat
              wash instead. */}
          <div className="absolute inset-0 bg-neutral-950/55 md:hidden" />
        </div>

        <div className="relative z-10 flex flex-1 items-center pb-6 pt-24 md:pt-28">
          <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <HeroEntranceContainer>
              <HeroEntranceItem>
                <h1
                  className="mb-6 max-w-2xl text-balance font-serif text-[clamp(2.75rem,7vw,5.5rem)] font-medium leading-[0.95] text-white"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  Find your
                  <br />
                  <span className="relative inline-block">
                    <span className="italic text-[#ff6b35]">perfect match</span>
                    {/* Drawn by hand rather than pulled from an icon set, and
                        roughened with a turbulence filter so the stroke wobbles
                        the way a real pen does. It is the one deliberately
                        imperfect mark on the page. */}
                    <svg
                      className="absolute -right-11 -top-1 h-9 w-9 rotate-12 md:-right-14 md:h-11 md:w-11"
                      viewBox="0 0 100 100"
                      fill="none"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M50,85 C50,85 15,60 15,35 C15,25 20,15 30,15 C40,15 45,22 50,30 C55,22 60,15 70,15 C80,15 85,25 85,35 C85,60 50,85 50,85 Z"
                        stroke="#ff6b35"
                        strokeWidth="2.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ filter: 'url(#rough)' }}
                      />
                      <defs>
                        <filter id="rough">
                          <feTurbulence
                            type="fractalNoise"
                            baseFrequency="0.9"
                            numOctaves="4"
                            result="noise"
                            seed="2"
                          />
                          <feDisplacementMap
                            in="SourceGraphic"
                            in2="noise"
                            scale="2"
                            xChannelSelector="R"
                            yChannelSelector="G"
                          />
                        </filter>
                      </defs>
                    </svg>
                  </span>
                </h1>
              </HeroEntranceItem>

              <HeroEntranceItem delay={0.1}>
                <p className="mb-9 max-w-[46ch] text-pretty text-lg leading-relaxed text-neutral-200">
                  Your dog does not need another lap of the same park. Find the pets
                  nearby who are actually free this weekend, and the people who own
                  them.
                </p>
              </HeroEntranceItem>

              <HeroEntranceItem delay={0.15}>
                <ul className="mb-10 max-w-lg">
                  {PROMISES.map(({ icon: Icon, title, body }) => (
                    <li
                      key={title}
                      className="flex gap-3.5 border-t border-white/10 py-3.5 first:border-t-0 first:pt-0"
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#ff6b35]" aria-hidden="true" />
                      <div className="min-w-0">
                        <h2 className="font-sans text-sm font-semibold text-white">{title}</h2>
                        <p className="mt-0.5 text-pretty text-[13px] leading-relaxed text-neutral-300">
                          {body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </HeroEntranceItem>

              <HeroEntranceItem delay={0.2}>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    to="/discover"
                    className="inline-flex items-center gap-2.5 rounded-full bg-[#ff6b35] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#ff6b35]/25 transition-[transform,background-color] duration-200 ease-out-quart hover:bg-[#ff5722] active:scale-[0.97] motion-reduce:transition-none"
                  >
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    Find matches near you
                  </Link>
                  <a
                    href="#how-it-works"
                    className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3.5 text-sm font-semibold text-white transition-[transform,background-color,border-color] duration-200 ease-out-quart hover:border-white/50 hover:bg-white/10 active:scale-[0.97] motion-reduce:transition-none"
                  >
                    <ArrowDown className="h-4 w-4" aria-hidden="true" />
                    See how it works
                  </a>
                </div>
              </HeroEntranceItem>
            </HeroEntranceContainer>
          </div>
        </div>

        <CommunityStrip />
      </motion.div>
    </section>
  )
}
