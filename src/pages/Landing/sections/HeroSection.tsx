import { Link } from 'react-router'
import { PawPrint, Play } from 'lucide-react'
import { HeroEntranceContainer, HeroEntranceItem } from '@/components/animations/HeroEntrance'
import { siteImages } from '@/lib/siteImages'
import { useAuthStore } from '@/store/useAuthStore'
import { nameRollCall, useLandingPets } from '../useLandingPets'

/** The hero photograph's true pixel dimensions. Everything below is laid out
 *  against this ratio so the frame is always exactly the shape of the image and
 *  the copy lands on the same part of the photograph at every viewport size. */
const IMAGE_W = 1535
const IMAGE_H = 1025
const IMAGE_RATIO = IMAGE_W / IMAGE_H

/**
 * The strip along the bottom of the hero.
 *
 * Sits below the photograph rather than on top of it — the image is the point
 * of this page and nothing is allowed to cover it. Says exactly who is here, by
 * name, straight off the /pets response: there are thirty-odd pets and the
 * About page promises not to pad that, so a smaller true number with Kaju's
 * face next to it does more for a stranger than an invented large one.
 */
function CommunityStrip() {
  const { pets, isLoading, isError } = useLandingPets()
  const faces = pets.all.slice(0, 6)

  // Nothing to say without data, and a marketing page should never show an
  // empty frame where a fact was supposed to go.
  if (isError || (!isLoading && faces.length === 0)) return null

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-6 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-neutral-900/70 px-5 py-3.5 text-center backdrop-blur-md md:flex-row md:justify-center md:gap-0 md:text-left">
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
  const { isAuthenticated } = useAuthStore()

  return (
    <section className="relative flex w-full flex-col bg-neutral-950">
      {/* The frame is the image's own aspect ratio, sized to whichever of width
          or height runs out first. Height wins on a normal desktop window, so
          the photograph is letterboxed at the sides — kept deliberately, since
          showing the whole picture matters more than filling every pixel.

          Laying the copy out inside this box rather than against the viewport
          is what keeps it off the dogs' faces: a percentage here is a
          percentage of the photograph, at every screen size. */}
      <div
        className="mx-auto w-full flex-1 px-0 pt-[4.5rem]"
        style={{ maxWidth: `calc((100dvh - 11rem) * ${IMAGE_RATIO})` }}
      >
        <div className="relative mx-auto w-full [container-type:inline-size]">
          {/* The image box carries the aspect ratio; the copy is a sibling so
              that on a phone it can drop out of the overlay and sit underneath.
              A 430px-wide screen renders this photograph 287px tall, and there
              is no honest way to put a headline, a line of body copy and two
              buttons on 287px of picture without landing them across both
              dogs' faces. Below md the copy stacks below the image instead. */}
          <div className="w-full" style={{ aspectRatio: `${IMAGE_W} / ${IMAGE_H}` }}>
            {/* The photograph, untouched.
              object-contain, never cover: cover crops whatever does not fit the
              box, and the previous hero also ran it through a parallax wrapper
              that scaled it 115% inside an overflow-hidden frame — between them
              the ears and the top of the fence were being cut off and the whole
              thing was zoomed. No filter, no scrim, no gradient sits on the
              image itself; both dogs' faces, ears, noses and the background
              behind them render exactly as shot. */}
          <img
            src={siteImages.heroPets}
            alt="Two dogs looking up at the camera on a paved garden path"
            width={IMAGE_W}
            height={IMAGE_H}
            fetchPriority="high"
            decoding="async"
              className="h-full w-full object-contain object-center"
            />
          </div>

          <HeroEntranceContainer>
            {/* Headline sits in the empty pavement above the dogs. The block is
                capped well short of the brown dog's head; at most it grazes the
                tip of the papillon's ear fur, which is the one overlap that
                stays clear of every eye, nose and mouth. */}
            <div className="mt-7 px-4 text-center md:absolute md:inset-x-0 md:top-[3%] md:mt-0 md:px-[5%]">
              <HeroEntranceItem>
                <h1
                  className="relative mx-auto max-w-[90%] text-balance font-serif font-medium leading-[0.98] text-white"
                  style={{
                    fontSize: 'clamp(1.5rem, 5cqw, 4.75rem)',
                    letterSpacing: '-0.02em',
                    textShadow: '0 2px 18px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.45)',
                  }}
                >
                  {/* The one permitted exception: a soft pool of shade behind
                      the words only. The pavement here is a light beige, so
                      white type has no contrast against it at all. It is scoped
                      to the text block, fades to nothing well inside the frame,
                      and never reaches either animal. */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-1/2 -z-10 hidden h-[190%] w-[135%] -translate-x-1/2 -translate-y-1/2 md:block"
                    style={{
                      backgroundImage:
                        'radial-gradient(closest-side, rgba(12,8,5,0.52) 0%, rgba(12,8,5,0.34) 55%, rgba(12,8,5,0) 100%)',
                    }}
                  />
                  Find your
                  <br />
                  <span className="relative inline-block">
                    <span className="italic text-[#ff6b35]">perfect match</span>
                    {/* Drawn by hand rather than pulled from an icon set, and
                        roughened with a turbulence filter so the stroke wobbles
                        the way a real pen does. It is the one deliberately
                        imperfect mark on the page. */}
                    <svg
                      className="absolute rotate-12"
                      style={{
                        right: '-1.15em',
                        top: '0.08em',
                        height: '0.78em',
                        width: '0.78em',
                      }}
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
            </div>

            {/* Supporting line and the two calls to action, along the bottom of
                the frame below the dogs. Kept low and centred so the animals
                keep the middle of the picture to themselves. */}
            <div className="mt-5 px-4 text-center md:absolute md:inset-x-0 md:bottom-[3%] md:mt-0 md:px-[5%]">
              <div className="relative mx-auto max-w-full md:max-w-[72%]">
                {/* Stronger than the one behind the headline, because the
                    headline happens to fall across the dark fence while this
                    sits on bare, pale paving — the lightest part of the frame.
                    Still soft-edged and scoped to the copy; it reaches neither
                    animal. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-1/2 -z-10 hidden h-[185%] w-[132%] -translate-x-1/2 -translate-y-1/2 md:block"
                  style={{
                    backgroundImage:
                      'radial-gradient(closest-side, rgba(12,8,5,0.62) 0%, rgba(12,8,5,0.44) 52%, rgba(12,8,5,0) 100%)',
                  }}
                />

                <HeroEntranceItem delay={0.1}>
                  <p
                    className="mx-auto text-pretty leading-snug text-neutral-50"
                    style={{
                      fontSize: 'clamp(0.75rem, 1.35cqw, 1.125rem)',
                      marginBottom: 'clamp(0.5rem, 1.6cqw, 1.25rem)',
                      textShadow: '0 1px 12px rgba(0,0,0,0.6)',
                    }}
                  >
                    Connecting dogs and humans for better weekends together.{' '}
                    <span aria-hidden="true">🐾</span>
                  </p>
                </HeroEntranceItem>

                <HeroEntranceItem delay={0.15}>
                  <div
                    className="flex flex-wrap items-center justify-center"
                    style={{ gap: 'clamp(0.5rem, 0.9cqw, 0.75rem)' }}
                  >
                    {/* The destination depends on whether there is an account
                        behind it: /discover is the swipe deck and its browse
                        call is authenticated, so signed out it 401s and shows a
                        visitor "No pets available right now" one screen after
                        this page told them twenty-nine pets are here. Community
                        is public, full, and the honest version of the promise. */}
                    <Link
                      to={isAuthenticated ? '/discover' : '/community'}
                      className="inline-flex items-center rounded-full bg-[#ff6b35] font-bold text-white shadow-lg shadow-[#ff6b35]/30 transition-[transform,background-color] duration-200 ease-out-quart hover:bg-[#ff5722] active:scale-[0.97] motion-reduce:transition-none"
                      style={{
                        fontSize: 'clamp(0.7rem, 1.05cqw, 0.875rem)',
                        gap: 'clamp(0.35rem, 0.65cqw, 0.625rem)',
                        padding: 'clamp(0.55rem, 1.05cqw, 0.875rem) clamp(1rem, 2.1cqw, 1.75rem)',
                      }}
                    >
                      <PawPrint className="h-[1.15em] w-[1.15em]" aria-hidden="true" />
                      {isAuthenticated ? 'Find matches near you' : 'See who is nearby'}
                    </Link>
                    <a
                      href="#how-it-works"
                      className="inline-flex items-center rounded-full border border-white/35 bg-black/30 font-semibold text-white backdrop-blur-sm transition-[transform,background-color,border-color] duration-200 ease-out-quart hover:border-white/60 hover:bg-white/10 active:scale-[0.97] motion-reduce:transition-none"
                      style={{
                        fontSize: 'clamp(0.7rem, 1.05cqw, 0.875rem)',
                        gap: 'clamp(0.35rem, 0.65cqw, 0.625rem)',
                        padding: 'clamp(0.55rem, 1.05cqw, 0.875rem) clamp(0.9rem, 1.85cqw, 1.5rem)',
                      }}
                    >
                      <Play className="h-[1em] w-[1em]" aria-hidden="true" />
                      See how it works
                    </a>
                  </div>
                </HeroEntranceItem>
              </div>
            </div>
          </HeroEntranceContainer>
        </div>
      </div>

      <CommunityStrip />
    </section>
  )
}
