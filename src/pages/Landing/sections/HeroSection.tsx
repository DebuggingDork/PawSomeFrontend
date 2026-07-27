import { useRef } from 'react'
import { Link } from 'react-router'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { PawPrint, Play } from 'lucide-react'
import { HeroEntranceContainer, HeroEntranceItem } from '@/components/animations/HeroEntrance'
import { ParallaxImage } from '@/components/animations/ParallaxImage'
import { siteImages } from '@/lib/siteImages'
import { useAuthStore } from '@/store/useAuthStore'
import { nameRollCall, useLandingPets } from '../useLandingPets'

/**
 * The strip along the bottom of the hero.
 *
 * Says exactly who is here, by name, straight off the /pets response. There are
 * currently thirty-odd pets and the About page promises not to pad that, so a
 * smaller true number with Kaju's face next to it does more for a stranger than
 * an invented large one.
 */
function CommunityStrip() {
  const { pets, isLoading, isError } = useLandingPets()
  const faces = pets.all.slice(0, 6)

  // Nothing to say without data, and a marketing page should never show an
  // empty frame where a fact was supposed to go.
  if (isError || (!isLoading && faces.length === 0)) return null

  return (
    <div className="relative z-20 border-t border-white/10 bg-neutral-950/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-4 text-center sm:px-6 md:flex-row md:justify-center md:gap-0 md:text-left lg:px-8">
        <div className="flex items-center gap-3.5">
          <div className="flex shrink-0 -space-x-2.5">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-9 w-9 rounded-full border-2 border-neutral-950 bg-white/10 motion-safe:animate-pulse"
                  />
                ))
              : faces.map((pet) => (
                  <img
                    key={pet.id}
                    src={pet.primary_photo_url ?? ''}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-9 w-9 rounded-full border-2 border-neutral-950 object-cover"
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
          <>
            <span aria-hidden="true" className="mx-6 hidden h-6 w-px bg-white/15 md:block" />
            <p className="flex items-center gap-2 text-sm text-neutral-400">
              <PawPrint className="h-4 w-4 shrink-0 text-[#ff6b35]" aria-hidden="true" />
              {pets.breedCount} breeds so far. Early, and we would rather say so.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export const HeroSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const { isAuthenticated } = useAuthStore()

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
          {/* Both dogs are centred and fill the frame, so this photograph wants
              to be seen rather than used as a dark backdrop. The grade lifts it
              slightly and the scrims below are deliberately minimal — just
              enough to seat the navbar, the headline and the strip. */}
          <ParallaxImage
            src={siteImages.heroPets}
            alt=""
            className="h-full w-full"
            imgClassName="brightness-[1.06] saturate-[1.12] contrast-[1.03]"
            priority
          />

          {/* Top and bottom only. The previous hero darkened the entire left
              half to seat a left-aligned column; with the copy centred over the
              dogs' faces that would bury the subject, so the horizontal pass is
              gone. Warm near-black rather than the page's neutral 10,10,10 —
              neutral black over a warm photograph greys the light out of it. */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(to bottom, rgba(20,13,9,0.62) 0%, rgba(20,13,9,0.16) 18%, rgba(20,13,9,0) 34%, rgba(20,13,9,0.16) 62%, rgba(20,13,9,0.68) 86%, rgba(20,13,9,0.82) 100%)',
            }}
          />

          {/* A pool of shade sized to the headline block and nothing else, so
              the text keeps its contrast without the frame going flat. It falls
              off well before either dog's eyes, which are the reason to use
              this photograph at all. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(46% 34% at 50% 62%, rgba(16,10,6,0.66) 0%, rgba(16,10,6,0.42) 52%, rgba(16,10,6,0) 82%)',
            }}
          />
        </div>

        {/* Vertical rhythm driven off viewport HEIGHT, not width: on a short,
            wide laptop a width-based scale ran the buttons past the fold. */}
        <div className="relative z-10 flex flex-1 items-end pb-[clamp(1rem,4vh,3rem)] pt-20 md:pt-24">
          <div className="mx-auto w-full max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <HeroEntranceContainer>
              <HeroEntranceItem>
                <h1
                  className="mx-auto mb-[clamp(0.75rem,2vh,1.25rem)] max-w-3xl text-balance font-serif text-[clamp(2.5rem,min(6.5vw,8.5vh),4.75rem)] font-medium leading-[0.98] text-white"
                  style={{ letterSpacing: '-0.02em', textShadow: '0 2px 24px rgba(0,0,0,0.45)' }}
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
                      className="absolute -right-10 top-1 h-8 w-8 rotate-12 md:-right-14 md:h-10 md:w-10"
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
                <p
                  className="mx-auto mb-[clamp(1.25rem,3vh,2rem)] max-w-md text-pretty text-lg leading-snug text-neutral-100"
                  style={{ textShadow: '0 1px 14px rgba(0,0,0,0.5)' }}
                >
                  Connecting dogs and humans for better weekends together.{' '}
                  <span aria-hidden="true">🐾</span>
                </p>
              </HeroEntranceItem>

              <HeroEntranceItem delay={0.15}>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {/* The destination depends on whether there is an account
                      behind it: /discover is the swipe deck and its browse call
                      is authenticated, so signed out it 401s and shows a visitor
                      "No pets available right now" one screen after this page
                      told them twenty-nine pets are here. Community is public
                      and full, and is the honest version of the same promise. */}
                  <Link
                    to={isAuthenticated ? '/discover' : '/community'}
                    className="inline-flex items-center gap-2.5 rounded-full bg-[#ff6b35] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#ff6b35]/30 transition-[transform,background-color] duration-200 ease-out-quart hover:bg-[#ff5722] active:scale-[0.97] motion-reduce:transition-none"
                  >
                    <PawPrint className="h-4 w-4" aria-hidden="true" />
                    {isAuthenticated ? 'Find matches near you' : 'See who is nearby'}
                  </Link>
                  <a
                    href="#how-it-works"
                    className="inline-flex items-center gap-2.5 rounded-full border border-white/30 bg-black/25 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-[transform,background-color,border-color] duration-200 ease-out-quart hover:border-white/60 hover:bg-white/10 active:scale-[0.97] motion-reduce:transition-none"
                  >
                    <Play className="h-3.5 w-3.5" aria-hidden="true" />
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
