import { useRef } from 'react'
import { Link } from 'react-router'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { MapPin, Shield, Heart, ArrowDown, Sparkles } from 'lucide-react'
import { HeroEntranceContainer, HeroEntranceItem } from '@/components/animations/HeroEntrance'
import { ParallaxImage } from '@/components/animations/ParallaxImage'
import { siteImages } from '@/lib/siteImages'
import { useAuthStore } from '@/store/useAuthStore'
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
          {/* The photograph is graded up before anything is laid over it. A hero
              that has to survive a scrim reads as murky if you only ever remove
              black from the covering layer — the pixels underneath are still the
              flat, slightly grey thing the camera recorded. Lifting brightness
              and saturation first means the scrim is darkening a living image
              rather than a dull one, which is the whole difference between
              "dark and moody" and "dim". */}
          <ParallaxImage
            src={siteImages.heroPets}
            alt=""
            className="h-full w-full"
            imgClassName="brightness-[1.16] saturate-[1.22] contrast-[1.04]"
            priority
          />

          {/* Explicit multi-stop gradients rather than Tailwind's from/via/to,
              because the shape of the curve is the whole point and three stops
              cannot express it.

              Warm near-black (26,16,10) rather than the page's neutral 10,10,10.
              Neutral black over a golden-hour photograph greys the light out of
              it; tinting the scrim toward the image's own hue lets the shadow
              deepen without draining the colour, and the warmth is what makes
              this read as evening light rather than as an unlit room.

              It holds ~86% over the headline column, then falls away quickly
              between 50% and 74% so the right third of the frame is untouched.
              That works because the image was chosen for it: both dogs and all
              the light are in that right third, and the left is already in
              shadow in the original, so the scrim deepens shadow that is
              genuinely there instead of painting black over a lit subject. */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(26,16,10,0.72) 0%, rgba(26,16,10,0.62) 32%, rgba(26,16,10,0.32) 54%, rgba(26,16,10,0.06) 76%, rgba(26,16,10,0) 100%)',
            }}
          />
          {/* Vertical pass, deliberately light: it only has to keep the navbar
              and the strip below off a bright patch. */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(to bottom, rgba(10,10,10,0.46) 0%, rgba(10,10,10,0) 26%, rgba(10,10,10,0) 76%, rgba(10,10,10,0.62) 100%)',
            }}
          />
          {/* A warm bloom sitting where the sun already is in the frame. Pure
              addition — it lights the scene rather than darkening it, which is
              what stops the right half from going flat once the scrim above has
              taken the contrast out of the left. */}
          <div
            className="absolute inset-0 mix-blend-screen"
            style={{
              backgroundImage:
                'radial-gradient(60% 70% at 72% 42%, rgba(255,138,61,0.13) 0%, rgba(255,107,53,0.05) 40%, rgba(0,0,0,0) 72%)',
            }}
          />
          {/* Below md the copy sits over the middle of the frame, where the
              horizontal pass has already faded out, so narrow screens get a flat
              wash instead. */}
          <div className="absolute inset-0 bg-neutral-950/55 md:hidden" />
        </div>

        {/* Vertical rhythm is driven off viewport HEIGHT, not width.
            On a 1900x930 laptop the hero was running past the fold and cutting
            the buttons in half: every gap here was a fixed width-based step, so
            a wide-but-short window got the spacing of a tall one. The clamps
            below collapse on short viewports and open up on tall ones, which is
            the axis that was actually running out. */}
        <div className="relative z-10 flex flex-1 items-center pb-4 pt-20 md:pt-24">
          <div className="relative mx-auto w-full max-w-7xl px-4 py-[clamp(0.5rem,2vh,2.5rem)] sm:px-6 lg:px-8">
            {/* A pool of shade that follows the copy instead of the viewport.
                Measured off a render: patches of backdrop behind this text hit
                0.87 relative luminance where the stick and the lab's muzzle cut
                across the column, which is light-on-light and effectively
                unreadable. The obvious fix — darken the left half harder — is
                what made the hero dim in the first place, and it darkens the
                half of the photo that has the least in it.

                So the global scrim above stays light and the guaranteed
                contrast is local: an elliptical pool sized to the text block,
                falling off to nothing well before the dog's face. It reads as
                depth of field rather than as a panel, and it means the right
                two thirds of the frame can stay as bright as the photo allows. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 -left-6 -z-10 w-[min(44rem,88%)]"
              style={{
                backgroundImage:
                  'radial-gradient(78% 62% at 32% 50%, rgba(18,11,7,0.72) 0%, rgba(18,11,7,0.5) 46%, rgba(18,11,7,0) 78%)',
              }}
            />
            <HeroEntranceContainer>
              <HeroEntranceItem>
                <h1
                  className="mb-[clamp(0.75rem,2vh,1.5rem)] max-w-2xl text-balance font-serif text-[clamp(2.5rem,min(7vw,9vh),5.5rem)] font-medium leading-[0.95] text-white"
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
                <p className="mb-[clamp(1rem,2.5vh,2.25rem)] max-w-[46ch] text-pretty text-lg leading-relaxed text-neutral-100">
                  Your dog does not need another lap of the same park. Find the pets
                  nearby who are actually free this weekend, and the people who own
                  them.
                </p>
              </HeroEntranceItem>

              <HeroEntranceItem delay={0.15}>
                <ul className="mb-[clamp(1.25rem,3vh,2.5rem)] max-w-lg">
                  {PROMISES.map(({ icon: Icon, title, body }) => (
                    <li
                      key={title}
                      className="flex gap-3.5 border-t border-white/10 py-[clamp(0.5rem,1.4vh,0.875rem)] first:border-t-0 first:pt-0"
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#ff6b35]" aria-hidden="true" />
                      <div className="min-w-0">
                        <h2 className="font-sans text-sm font-semibold text-white">{title}</h2>
                        <p className="mt-0.5 text-pretty text-[13px] leading-relaxed text-neutral-200">
                          {body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </HeroEntranceItem>

              <HeroEntranceItem delay={0.2}>
                <div className="flex flex-wrap items-center gap-3">
                  {/* The destination depends on whether there is an account
                      behind it, because /discover is the swipe deck and its
                      browse call is authenticated: signed out it 401s, falls
                      through to the empty state, and shows a visitor "No pets
                      available right now" one screen after this page told them
                      twenty-nine pets are here. That is the worst possible
                      first click. Signed-out visitors get Community instead,
                      which is public, full, and the honest version of the same
                      promise. */}
                  <Link
                    to={isAuthenticated ? '/discover' : '/community'}
                    className="inline-flex items-center gap-2.5 rounded-full bg-[#ff6b35] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#ff6b35]/25 transition-[transform,background-color] duration-200 ease-out-quart hover:bg-[#ff5722] active:scale-[0.97] motion-reduce:transition-none"
                  >
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    {isAuthenticated ? 'Find matches near you' : 'See who is nearby'}
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
