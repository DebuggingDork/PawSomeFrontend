import React from 'react'
import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { ScrollPinnedSlider } from '@/components/animations/ScrollPinnedSlider'
import { GenderBadge } from '@/components/ui/GenderBadge'
import { activeHealthTags } from '@/lib/petBadges'
import { formatAge } from '@/lib/formatAge'
import { speciesEmoji } from '@/lib/species'
import { useLandingPets } from '../useLandingPets'
import { PetPhoto } from '@/components/landing/PetPhoto'
import type { Pet } from '@/lib/api/types'

/**
 * The pinned horizontal strip — scroll down, the panels travel sideways.
 *
 * The motion is untouched: same GSAP pin, same 1-second scrub, same panel
 * dimensions, so the pin distance and the feel of it are exactly what they were.
 * Only the contents changed. The panels used to advertise "Apollo, the friendly
 * Doberman" and "Luna, the elegant Maine Coon", neither of whom exists — there
 * is a Rusty and there is a Toffee, and now it is the two of them on screen,
 * with the bios their owners actually wrote.
 */

/** Panels are wide, so a long panel count is a long pin. Five reads as a proper
 *  strip without turning the section into a scroll trap. */
const PANEL_COUNT = 5

const PANEL_SIZE = 'w-[85vw] md:w-[60vw] max-w-4xl shrink-0 h-[60dvh] min-h-[400px]'

function PetPanel({ pet }: { pet: Pet }) {
  const tags = activeHealthTags(pet)

  return (
    <Link
      to={`/pets/${pet.id}`}
      className={`group relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand ${PANEL_SIZE}`}
    >
      <PetPhoto
        src={pet.primary_photo_url}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* The old panels laid a flat `opacity-20` over the whole photo, which made
          every one of them murky end to end and still left the text sitting on
          whatever was behind it. These are directional instead: the copy lives
          in the bottom-left, so that corner gets the weight and the rest of the
          frame is left bright enough that you can actually see the animal, which
          is the entire reason the panel exists. */}
      <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/55 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/85 via-neutral-950/20 to-transparent" />

      <div className="relative flex h-full max-w-xl flex-col justify-end p-8 md:p-12">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">
            {speciesEmoji(pet.species)}
          </span>
          <GenderBadge gender={pet.gender} size="sm" decorative />
          <span className="text-sm font-medium text-neutral-300">
            {pet.breed} · {formatAge(pet.age_months)}
          </span>
        </div>

        <h3
          className="font-serif text-5xl font-medium text-white md:text-6xl"
          style={{ letterSpacing: '-0.02em' }}
        >
          {pet.name}
        </h3>

        {pet.bio && (
          <p className="mt-4 max-w-[46ch] text-pretty text-lg leading-relaxed text-neutral-200">
            {pet.bio}
          </p>
        )}

        {tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {tags.map(({ key, label, icon: Icon, className }) => (
              <span
                key={key}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${className}`}
              >
                <Icon className="h-3 w-3" aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>
        )}

        <span className="mt-8 inline-flex items-center gap-2 font-semibold text-white">
          See {pet.name}'s profile
          <ArrowRight
            className="h-5 w-5 transition-transform duration-200 ease-out-quart motion-safe:hoverable:group-hover:translate-x-1 motion-reduce:transition-none"
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  )
}

/** Same footprint as a real panel, so the pin distance does not jump when the
 *  pets arrive. */
function PanelSkeleton() {
  return (
    <div
      className={`overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900 ${PANEL_SIZE}`}
    >
      <div className="flex h-full flex-col justify-end gap-4 p-8 md:p-12">
        <div className="h-4 w-40 rounded bg-white/5 motion-safe:animate-pulse" />
        <div className="h-12 w-64 rounded bg-white/5 motion-safe:animate-pulse" />
        <div className="h-4 w-full max-w-md rounded bg-white/5 motion-safe:animate-pulse" />
        <div className="h-4 w-3/4 max-w-sm rounded bg-white/5 motion-safe:animate-pulse" />
      </div>
    </div>
  )
}

export const FeaturedPetsSection: React.FC = () => {
  const { pets, isLoading, isError } = useLandingPets()

  // Interleave dogs and cats rather than taking the API's newest-first order,
  // which currently opens on four dogs in a row. Alternating makes the strip
  // read as a community instead of a kennel.
  const featured: Pet[] = []
  for (let i = 0; featured.length < PANEL_COUNT; i++) {
    const dog = pets.dogs[i]
    const cat = pets.cats[i]
    if (!dog && !cat) break
    if (dog && featured.length < PANEL_COUNT) featured.push(dog)
    if (cat && featured.length < PANEL_COUNT) featured.push(cat)
  }

  // Nothing to pin an empty strip to. The section removes itself rather than
  // reserving a screen-height hole in the page.
  if (isError || (!isLoading && featured.length === 0)) return null

  return (
    <section className="w-full min-w-0 overflow-hidden border-t border-neutral-900 bg-neutral-950">
      <ScrollPinnedSlider contentKey={isLoading ? 'loading' : featured.length}>
        {isLoading
          ? Array.from({ length: PANEL_COUNT }).map((_, i) => <PanelSkeleton key={i} />)
          : featured.map((pet) => <PetPanel key={pet.id} pet={pet} />)}

        {/* Closing panel. Solid brand orange rather than the pink-to-violet
            gradient that used to sit here — one committed colour, and one that
            the rest of the product actually uses. */}
        <div className="flex w-[85vw] min-h-[400px] max-w-xl shrink-0 flex-col justify-center rounded-3xl bg-brand p-8 md:h-[60dvh] md:w-[40vw] md:p-12">
          <h3
            className="text-balance font-serif text-4xl font-medium leading-tight text-white md:text-5xl"
            style={{ letterSpacing: '-0.02em' }}
          >
            Your pet could be next in this row.
          </h3>
          <p className="mt-5 max-w-[34ch] text-pretty leading-relaxed text-white/90">
            Profiles take about two minutes. Photos help more than anything else you
            can write.
          </p>
          <Link
            to="/auth"
            className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-neutral-950 px-7 py-3.5 font-bold text-white transition-[transform,background-color] duration-200 ease-out-quart hover:bg-neutral-900 active:scale-[0.97] motion-reduce:transition-none"
          >
            Add your pet
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </ScrollPinnedSlider>
    </section>
  )
}
