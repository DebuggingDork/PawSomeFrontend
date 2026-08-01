import { Link } from 'react-router'
import { ArrowUpRight } from 'lucide-react'
import { GenderBadge } from '@/components/ui/GenderBadge'
import { activeHealthTags } from '@/lib/petBadges'
import { formatAge } from '@/lib/formatAge'
import { speciesEmoji } from '@/lib/species'
import type { Pet } from '@/lib/api/types'

/**
 * A real pet, on the marketing page.
 *
 * Everything here comes off the /pets response — the photo, the breed, the age,
 * the owner's own words in `bio`, the health badges. Nothing is written into the
 * component. The section that used to sit here rendered `[1, 2, 3].map()` over
 * one stock photo and one invented caption, so the homepage advertised three
 * identical Golden Retrievers who did not exist.
 *
 * Age, gender and health tags go through the same helpers the Community grid and
 * the swipe deck use, so "2y 4mo" and the Vaccinated chip cannot drift into
 * meaning something different depending on which page you are looking at.
 */

interface PetSpotlightCardProps {
  pet: Pet
  /** `wide` runs the photo down the left and the copy beside it — used to break
   *  up an otherwise uniform grid. */
  layout?: 'tall' | 'wide'
  className?: string
}

export function PetSpotlightCard({ pet, layout = 'tall', className = '' }: PetSpotlightCardProps) {
  const tags = activeHealthTags(pet)
  const isWide = layout === 'wide'

  const photo = (
    <div
      className={`relative shrink-0 overflow-hidden bg-neutral-800 ${
        isWide ? 'aspect-[4/3] sm:aspect-auto sm:h-full sm:w-[46%]' : 'aspect-[4/5]'
      }`}
    >
      <img
        src={pet.primary_photo_url ?? ''}
        alt={`${pet.name}, a ${pet.breed}`}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
      />
      {/* Sits on the photo, so it needs its own ground to be legible against
          whatever the photo happens to be doing behind it. */}
      <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-neutral-950/75 py-1 pl-2.5 pr-1.5 text-xs font-medium text-white backdrop-blur-sm">
        <span aria-hidden="true">{speciesEmoji(pet.species)}</span>
        <GenderBadge gender={pet.gender} size="sm" decorative />
        <span className="sr-only">{pet.species}</span>
      </div>
    </div>
  )

  const copy = (
    // Centred on the wide card, top-aligned on the portraits. A pet whose owner
    // wrote one short line should read as a deliberately airy card, not as text
    // stranded at the top of a tall empty box.
    <div
      className={`flex min-w-0 flex-1 flex-col ${isWide ? 'justify-center p-6 sm:p-8' : 'p-5'}`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h4
          className={`font-display font-bold text-white ${isWide ? 'text-3xl' : 'text-xl'}`}
          style={{ letterSpacing: '-0.02em' }}
        >
          {pet.name}
        </h4>
        <ArrowUpRight
          className="h-4 w-4 shrink-0 translate-y-0.5 text-neutral-600 transition-colors duration-200 group-hover:text-[#ff8c5c]"
          aria-hidden="true"
        />
      </div>

      <p className={`mt-1 text-neutral-400 ${isWide ? 'text-sm' : 'text-[13px]'}`}>
        {pet.breed} · {formatAge(pet.age_months)}
      </p>

      {pet.bio && (
        <p
          className={`mt-3 line-clamp-3 leading-relaxed text-neutral-300 ${
            isWide ? 'text-base' : 'text-sm'
          }`}
        >
          {pet.bio}
        </p>
      )}

      {/* mt-auto pushes the tag row to the bottom on portraits so it lines up
          across a grid of cards. The wide card leaves it where it falls, since
          mt-auto there would fight the justify-center above. */}
      {tags.length > 0 && (
        <div className={`flex flex-wrap gap-1.5 pt-4 ${isWide ? '' : 'mt-auto'}`}>
          {tags.map(({ key, label, icon: Icon, className: tagClass }) => (
            <span
              key={key}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${tagClass}`}
            >
              <Icon className="h-2.5 w-2.5" aria-hidden="true" />
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <Link
      to={`/pets/${pet.id}`}
      className={`group flex overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/70 shadow-[0_0_0_rgba(0,0,0,0)] transition-[transform,box-shadow,border-color] duration-300 ease-out-quart motion-safe:hoverable:hover:-translate-y-1.5 hoverable:hover:border-[#ff6b35]/50 hoverable:hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.6)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6b35] motion-reduce:transition-none ${
        // A fixed height on the wide card, because its own content cannot give
        // it a sensible one: let the photo size the card and a portrait shot at
        // 46% width makes it 750px tall, with the copy marooned in the middle of
        // a column of black. Fixed height instead, and object-cover crops the
        // photo to a slab — which is also the only way a row of these keeps a
        // predictable rhythm when the photos are whatever people uploaded.
        isWide ? 'flex-col sm:h-[22rem] sm:flex-row' : 'flex-col'
      } ${className}`}
    >
      {photo}
      {copy}
    </Link>
  )
}
