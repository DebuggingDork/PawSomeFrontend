import React from 'react'
import { Link } from 'react-router'
import { ArrowRight, PawPrint } from 'lucide-react'
import { ScrollReveal } from '@/components/animations/ScrollReveal'
import { MaskReveal } from '@/components/animations/MaskReveal'
import { formatAge } from '@/lib/formatAge'
import { useLandingPets } from '../useLandingPets'
import { PetPhoto } from '@/components/landing/PetPhoto'
import type { Pet } from '@/lib/api/types'

/**
 * Replaces a "Pet Parent Resources" strip of three articles that were never
 * written, behind a "View All Articles" button wired to nothing.
 *
 * This is a real sequence — profile, then browse, then talk — so it is one of
 * the few places numbered markers earn their keep rather than being scaffolding.
 * It also gives the hero's "See how it works" link somewhere to land: #how-it-works
 * was referenced from the hero and did not exist anywhere on the page.
 *
 * The illustrations are the actual pets on PawSome, arranged differently per
 * step so the artwork carries the meaning of the step (one profile, a grid to
 * browse, a pair who matched) instead of being three photos in three identical
 * frames.
 */

const PHOTO_CLASS = 'h-full w-full object-cover'

function Frame({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 ${className}`}
    >
      {children}
    </div>
  )
}

function PhotoOrGlyph({ pet, className = '' }: { pet: Pet | undefined; className?: string }) {
  if (!pet?.primary_photo_url) {
    return (
      <div className={`flex items-center justify-center bg-neutral-900 ${className}`}>
        <PawPrint className="h-7 w-7 text-neutral-700" aria-hidden="true" />
      </div>
    )
  }
  // Same glyph again if the URL is present but the object behind it is gone.
  return <PetPhoto src={pet.primary_photo_url} alt="" className={`${PHOTO_CLASS} ${className}`} />
}

/** Step 1 — one pet, shown the way a finished profile looks. */
function ProfileArt({ pet }: { pet: Pet | undefined }) {
  return (
    <Frame className="aspect-[4/3]">
      <div className="flex h-full flex-col">
        <div className="relative min-h-0 flex-1">
          <PhotoOrGlyph pet={pet} className="absolute inset-0 h-full w-full" />
        </div>
        <div className="flex items-baseline gap-2 border-t border-neutral-800 px-4 py-3">
          <span className="font-display text-sm font-bold text-white">{pet?.name ?? 'Your pet'}</span>
          <span className="truncate text-xs text-neutral-400">
            {pet ? `${pet.breed} · ${formatAge(pet.age_months)}` : 'Breed · age'}
          </span>
        </div>
      </div>
    </Frame>
  )
}

/** Step 2 — a handful of pets at once, the way Community reads. */
function BrowseArt({ pets }: { pets: Pet[] }) {
  const tiles = pets.slice(0, 6)
  return (
    <Frame className="aspect-[4/3] p-2">
      <div className="grid h-full grid-cols-3 grid-rows-2 gap-2">
        {(tiles.length > 0 ? tiles : Array.from({ length: 6 })).map((pet, i) => (
          <div key={(pet as Pet)?.id ?? i} className="overflow-hidden rounded-lg bg-neutral-800">
            <PhotoOrGlyph pet={pet as Pet | undefined} className="h-full w-full" />
          </div>
        ))}
      </div>
    </Frame>
  )
}

/** Step 3 — two pets facing each other, which is what a match is. */
function MatchArt({ pets }: { pets: Pet[] }) {
  const [left, right] = pets
  return (
    <Frame className="aspect-[4/3] p-2">
      <div className="relative h-full">
        <div className="grid h-full grid-cols-2 gap-2">
          <div className="overflow-hidden rounded-lg bg-neutral-800">
            <PhotoOrGlyph pet={left} className="h-full w-full" />
          </div>
          <div className="overflow-hidden rounded-lg bg-neutral-800">
            <PhotoOrGlyph pet={right} className="h-full w-full" />
          </div>
        </div>
        <span className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#ff6b35] shadow-lg shadow-neutral-950/60">
          <PawPrint className="h-4 w-4 text-white" aria-hidden="true" />
        </span>
      </div>
    </Frame>
  )
}

export const HowItWorksSection: React.FC = () => {
  const { pets } = useLandingPets()

  const steps = [
    {
      number: '01',
      title: 'Build a profile for your pet',
      body: 'Photos, breed, age, whether they are vaccinated, neutered, trained. Owners get a profile too, so nobody is meeting an anonymous account at the park.',
      cta: { label: 'Create a profile', to: '/auth' },
      art: <ProfileArt pet={pets.all[0]} />,
      offset: '',
    },
    {
      number: '02',
      title: 'See who is actually nearby',
      body: 'Filter by species, breed and distance in Community, or let Discover suggest the pets your dog or cat will genuinely get along with. Distance comes first, always.',
      cta: { label: 'Browse the community', to: '/community' },
      art: <BrowseArt pets={pets.all.slice(1, 7)} />,
      offset: 'lg:mt-14',
    },
    {
      number: '03',
      title: 'Talk first, then meet up',
      body: 'Every match opens a real chat. Agree on a park and a time, in daylight, somewhere public. We wrote down what a sensible first meeting looks like.',
      cta: { label: 'Read the safety notes', to: '/faq#safety' },
      art: <MatchArt pets={pets.all.slice(2, 4)} />,
      offset: 'lg:mt-28',
    },
  ]

  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 border-t border-neutral-900 bg-neutral-950 py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <MaskReveal>
            <h2 className="text-balance font-display text-4xl font-bold tracking-[-0.02em] text-white md:text-5xl">
              Three steps, and one of them is just typing.
            </h2>
          </MaskReveal>
          <ScrollReveal delay={0.12}>
            <p className="mt-5 max-w-[60ch] text-pretty text-lg leading-relaxed text-neutral-300">
              The hard part of finding your pet a friend was never the meeting. It was
              everything before it: the asking around, the WhatsApp group with four
              hundred people in it, the awkward questions at the park.
            </p>
          </ScrollReveal>
        </div>

        <div className="mt-16 grid gap-x-8 gap-y-16 lg:grid-cols-3">
          {steps.map((step, index) => (
            <ScrollReveal key={step.number} delay={index * 0.1} className={step.offset}>
              <article>
                {step.art}
                <div className="mt-6 flex gap-4">
                  <span className="font-accent text-sm text-neutral-600" aria-hidden="true">
                    {step.number}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-xl font-semibold text-white">{step.title}</h3>
                    <p className="mt-2 text-pretty leading-relaxed text-neutral-300">{step.body}</p>
                    <Link
                      to={step.cta.to}
                      className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#ff6b35] transition-colors duration-200 hover:text-[#ff8c5c]"
                    >
                      {step.cta.label}
                      <ArrowRight
                        className="h-4 w-4 transition-transform duration-200 ease-out-quart motion-safe:hoverable:group-hover:translate-x-1 motion-reduce:transition-none"
                        aria-hidden="true"
                      />
                    </Link>
                  </div>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
