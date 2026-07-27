import { Link } from 'react-router'
import { MapPin, PawPrint, Play } from 'lucide-react'
import { HeroEntranceContainer, HeroEntranceItem } from '@/components/animations/HeroEntrance'
import { siteImages } from '@/lib/siteImages'
import { useAuthStore } from '@/store/useAuthStore'
import { nameRollCall, useLandingPets } from '../useLandingPets'

/**
 * Floating community bar over the bottom of the full-bleed hero.
 * Real names + faces from /pets — never a padded marketing count.
 */
function CommunityStrip() {
  const { pets, isLoading, isError } = useLandingPets()
  const faces = pets.all.slice(0, 6)

  if (isError || (!isLoading && faces.length === 0)) return null

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-4 pb-5 sm:px-6 sm:pb-7 lg:px-8">
      <div className="pointer-events-auto mx-auto flex w-full max-w-4xl flex-col items-center gap-3 rounded-full border border-white/10 bg-neutral-950/55 px-5 py-3 text-center shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl md:flex-row md:justify-between md:gap-6 md:px-7 md:py-3.5 md:text-left">
        <div className="flex items-center gap-3.5">
          <div className="flex shrink-0 -space-x-2.5">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
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
                are on PawSome.
              </>
            )}
          </p>
        </div>

        {!isLoading && pets.breedCount > 0 && (
          <>
            <span aria-hidden="true" className="hidden h-6 w-px shrink-0 bg-white/20 md:block" />
            <p className="flex items-center gap-2 text-sm text-neutral-300">
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
    <section className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-neutral-950">
      {/* Full-bleed photograph — edge to edge, covering the first viewport.
          object-cover fills the frame; the translucent navbar sits on top of it
          (unchanged). A soft vignette keeps white type readable without turning
          the image into a flat dark wash. */}
      <div className="absolute inset-0 z-0">
        <img
          src={siteImages.heroPets}
          alt="Two dogs looking up at the camera on a paved garden path"
          width={1535}
          height={1025}
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.28)_62%,rgba(0,0,0,0.45)_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-neutral-950/55 to-transparent"
        />
      </div>

      {/* Centered copy stack — headline, support line, and CTAs as one composition
          in the middle of the viewport, matching the reference. */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-28 pt-24 sm:px-8 sm:pb-32">
        <HeroEntranceContainer>
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
            <HeroEntranceItem>
              <h1
                className="text-balance font-display font-bold leading-[1.05] tracking-[-0.03em] text-white"
                style={{
                  fontSize: 'clamp(2.25rem, 6.5vw, 4.5rem)',
                  textShadow: '0 2px 24px rgba(0,0,0,0.45)',
                }}
              >
                Find your{' '}
                <span className="relative inline-block whitespace-nowrap">
                  <span
                    className="bg-gradient-to-r from-[#ff6b35] via-[#ff8c42] to-[#ffc14d] bg-clip-text text-transparent"
                    style={{ WebkitTextFillColor: 'transparent' }}
                  >
                    perfect match
                  </span>
                  <svg
                    className="absolute rotate-12"
                    style={{
                      right: '-0.95em',
                      top: '0.05em',
                      height: '0.72em',
                      width: '0.72em',
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
                    />
                  </svg>
                </span>
              </h1>
            </HeroEntranceItem>

            <HeroEntranceItem delay={0.1}>
              <p
                className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-white/95 sm:mt-5 sm:text-lg"
                style={{ textShadow: '0 1px 14px rgba(0,0,0,0.5)' }}
              >
                Connecting dogs and humans for better weekends together.{' '}
                <PawPrint
                  className="ml-0.5 inline h-[0.95em] w-[0.95em] align-[-0.12em] text-[#ff6b35]"
                  aria-hidden="true"
                />
              </p>
            </HeroEntranceItem>

            <HeroEntranceItem delay={0.15}>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3 sm:mt-8 sm:gap-4">
                {/* Signed-out visitors go to public Community — /discover is
                    authenticated and would show an empty state right after the
                    hero promised pets are here. */}
                <Link
                  to={isAuthenticated ? '/discover' : '/community'}
                  className="inline-flex items-center gap-2.5 rounded-full bg-[#ff6b35] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#ff6b35]/35 transition-[transform,background-color] duration-200 ease-out hover:bg-[#ff5722] active:scale-[0.97] motion-reduce:transition-none sm:px-7 sm:text-[0.9375rem]"
                >
                  <MapPin className="h-[1.1em] w-[1.1em]" aria-hidden="true" />
                  {isAuthenticated ? 'Find matches near you' : 'See who is nearby'}
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2.5 rounded-full border border-white/70 bg-transparent px-6 py-3.5 text-sm font-semibold text-white transition-[transform,background-color,border-color] duration-200 ease-out hover:border-white hover:bg-white/10 active:scale-[0.97] motion-reduce:transition-none sm:px-7 sm:text-[0.9375rem]"
                >
                  <Play className="h-[1em] w-[1em] fill-white" aria-hidden="true" />
                  See how it works
                </a>
              </div>
            </HeroEntranceItem>
          </div>
        </HeroEntranceContainer>
      </div>

      <CommunityStrip />
    </section>
  )
}
