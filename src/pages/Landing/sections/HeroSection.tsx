import { Link } from 'react-router'
import { MapPinIcon, PlayerIcon, SparklesIcon } from '@/components/icons'
import { HeroEntranceContainer, HeroEntranceItem } from '@/components/animations/HeroEntrance'
import { siteImages } from '@/lib/siteImages'
import { useAuthStore } from '@/store/useAuthStore'
import { useLandingPets } from '../useLandingPets'

function HeartMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M50,85 C50,85 15,60 15,35 C15,25 20,15 30,15 C40,15 45,22 50,30 C55,22 60,15 70,15 C80,15 85,25 85,35 C85,60 50,85 50,85 Z"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Full-bleed hero with mirrored side margins (left-8 / right-8):
 * "Find your" upper-left, "perfect match" + CTAs lower-right,
 * tagline lower-left.
 *
 * Below md the diagonal collapses into a centered stack so nothing
 * collides on a narrow phone.
 */
export const HeroSection = () => {
  const { isAuthenticated } = useAuthStore()
  const { pets, isLoading } = useLandingPets()

  return (
    <section className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-neutral-950">
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
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0.18)_68%,rgba(0,0,0,0.38)_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-neutral-950/45 to-transparent"
        />
      </div>

      <div className="relative z-10 flex min-h-[100dvh] flex-1 flex-col px-5 pb-8 pt-24 sm:px-8 md:px-0 md:pb-0 md:pt-0">
        <HeroEntranceContainer>
          {/* Mobile: centered stack. md+: absolute diagonal over the photo.
              The md+ positioning sits on the entrance items themselves — see the
              note in HeroEntrance for why it must not live on a child of one. */}
          <div className="flex flex-1 flex-col items-center justify-center text-center md:contents">
            <h1 className="font-display font-bold leading-[1.05] tracking-[-0.03em] md:contents">
              <HeroEntranceItem
                as="span"
                className="block text-white md:absolute md:left-8 md:top-[24%] md:text-left lg:left-8 lg:top-[24%]"
                style={{
                  fontSize: 'clamp(2.5rem, 6vw, 4.75rem)',
                  textShadow: '0 2px 28px rgba(0,0,0,0.45)',
                }}
              >
                Find your
              </HeroEntranceItem>
              <HeroEntranceItem
                as="span"
                className="mt-1 flex whitespace-nowrap text-brand md:absolute md:right-8 md:top-[64%] md:mt-0 md:justify-end md:text-right lg:right-8 lg:top-[64%]"
                style={{
                  fontSize: 'clamp(2.5rem, 6vw, 4.75rem)',
                  textShadow: '0 2px 28px rgba(0,0,0,0.35)',
                }}
              >
                perfect match
              </HeroEntranceItem>
            </h1>

            <HeroEntranceItem
              as="p"
              className="mt-4 max-w-md text-pretty text-base text-white/95 sm:text-lg md:absolute md:bottom-8 md:left-8 md:mt-0 md:max-w-sm md:text-left md:text-lg lg:bottom-8 lg:left-8 lg:max-w-md lg:text-xl"
              style={{ textShadow: '0 1px 16px rgba(0,0,0,0.55)' }}
            >
              Connecting dogs and humans for better weekends
            </HeroEntranceItem>

            <HeroEntranceItem className="mt-7 flex w-full max-w-xl flex-col items-center gap-3 md:absolute md:bottom-8 md:right-8 md:mt-0 md:max-w-[min(92vw,40rem)] md:items-end lg:bottom-8 lg:right-8">
              {!isLoading && pets.breedCount > 0 && (
                <p
                  className="flex items-center gap-2 text-sm text-white/90 md:text-right"
                  style={{ textShadow: '0 1px 12px rgba(0,0,0,0.5)' }}
                >
                  {pets.breedCount} breeds so far. Early, and we would rather say so.
                  <SparklesIcon className="h-3.5 w-3.5 shrink-0 text-white" aria-hidden="true" />
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center gap-3 md:justify-end">
                <Link
                  to={isAuthenticated ? '/discover' : '/community'}
                  className="inline-flex items-center gap-2.5 rounded-full bg-brand px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand/35 transition-[transform,background-color] duration-200 ease-out hover:bg-brand-dark active:scale-[0.97] motion-reduce:transition-none sm:px-7 sm:text-[0.9375rem]"
                >
                  <MapPinIcon className="h-[1.1em] w-[1.1em]" aria-hidden="true" />
                  Find matches near you
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2.5 rounded-full border border-white/80 bg-transparent px-6 py-3.5 text-sm font-semibold text-white transition-[transform,background-color,border-color] duration-200 ease-out hover:border-white hover:bg-white/10 active:scale-[0.97] motion-reduce:transition-none sm:px-7 sm:text-[0.9375rem]"
                >
                  <PlayerIcon size={14} aria-hidden="true" />
                  See how it works
                </a>
                <HeartMark className="hidden h-7 w-7 rotate-12 text-brand md:block lg:h-8 lg:w-8" />
              </div>
            </HeroEntranceItem>
          </div>
        </HeroEntranceContainer>
      </div>
    </section>
  )
}
