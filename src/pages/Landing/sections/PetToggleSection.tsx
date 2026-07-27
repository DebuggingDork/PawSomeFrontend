import React, { useRef, useState } from 'react'
import { Link } from 'react-router'
import { motion, useInView } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { ScrollReveal } from '@/components/animations/ScrollReveal'
import { AnimatedToggle } from '@/components/animations/AnimatedToggle'
import { PetSpotlightCard } from '@/components/landing/PetSpotlightCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { useLandingPets } from '../useLandingPets'
import type { Pet } from '@/lib/api/types'

type Species = 'dog' | 'cat'

/**
 * The pets themselves.
 *
 * This section used to render `[1, 2, 3].map()` over a single stock photo, so
 * the same invented Golden Retriever appeared three times with the same caption,
 * and again as three British Shorthairs on the other tab. It now shows the real
 * ones, straight from /pets, and every card opens that pet's actual profile.
 *
 * The toggle keeps its sliding pill exactly as it was — a shared `layoutId`, so
 * the pill travels between the two buttons rather than cross-fading — and the
 * panel below keeps its height transition. What changed is only the colour: the
 * pill was pink for dogs and violet for cats, two hues that appear nowhere else
 * in the product, which made the homepage look like a different app from the one
 * behind it. It is brand orange in both states now, and the label does the
 * distinguishing.
 */

/**
 * One wide card on its own row, then three portraits.
 *
 * The wide card gets its own row deliberately. It first shared a row with a
 * portrait card, and CSS grid stretches every item in a row to the tallest — so
 * the wide card inherited a 670px portrait's height and rendered as a photo
 * beside a large panel of empty black.
 *
 * Which pet leads also matters, and it cannot just be the first. The newest pet
 * on PawSome has a four-word bio, and in the widest slot on the page that left
 * almost the whole card empty. The lead is whoever has the most to say, so the
 * space is earned rather than allocated.
 */
function PetGrid({ pets }: { pets: Pet[] }) {
  if (pets.length === 0) return null

  const lead = pets.reduce((best, pet) =>
    (pet.bio?.length ?? 0) > (best.bio?.length ?? 0) ? pet : best,
  )
  const rest = pets.filter((pet) => pet.id !== lead.id).slice(0, 3)

  return (
    <div className="flex flex-col gap-5">
      <PetSpotlightCard pet={lead} layout="wide" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((pet) => (
          <PetSpotlightCard key={pet.id} pet={pet} />
        ))}
      </div>
    </div>
  )
}

function PetGridSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-72 rounded-2xl" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    </div>
  )
}

export const PetToggleSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Species | null>('dog')
  // Gate the layoutId animation on the section being in view, or the pill flies
  // in from (0,0) on a refresh that lands mid-page.
  const toggleRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(toggleRef, { once: true, amount: 0.5 })

  const { pets, isLoading, isError } = useLandingPets()

  const handleToggle = (tab: Species) => {
    setActiveTab((prev) => (prev === tab ? null : tab))
  }

  const counts: Record<Species, number> = {
    dog: pets.dogs.length,
    cat: pets.cats.length,
  }

  const tabs: { id: Species; label: string }[] = [
    { id: 'dog', label: 'Dogs' },
    { id: 'cat', label: 'Cats' },
  ]

  return (
    <section
      id="pet-toggle"
      className="scroll-mt-24 border-t border-neutral-900 bg-neutral-900/40 py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-balance font-display text-4xl font-bold tracking-[-0.02em] text-white md:text-5xl">
              The ones already here.
            </h2>
            <p className="mt-5 max-w-[58ch] text-pretty text-lg leading-relaxed text-neutral-300">
              Real profiles, written by the people who own them. Open any of them to
              read the rest.
            </p>
          </div>

          <div
            ref={toggleRef}
            className="inline-flex shrink-0 gap-1 self-start rounded-full bg-neutral-800/60 p-1.5 ring-1 ring-neutral-700/50 md:self-auto"
            role="group"
            aria-label="Filter pets by species"
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleToggle(tab.id)}
                  aria-pressed={isActive}
                  className={`relative rounded-full px-6 py-3 text-sm font-bold transition-[color,transform] duration-200 ease-out-quart active:scale-[0.97] motion-reduce:transition-none ${
                    isActive ? 'text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {isActive &&
                    (isInView ? (
                      <motion.span
                        layoutId="toggle-pill"
                        className="absolute inset-0 rounded-full bg-[#ff6b35] shadow-[0_0_20px_rgba(255,107,53,0.28)]"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                      />
                    ) : (
                      <span className="absolute inset-0 rounded-full bg-[#ff6b35] shadow-[0_0_20px_rgba(255,107,53,0.28)]" />
                    ))}
                  <span className="relative z-10">
                    {tab.label}
                    {counts[tab.id] > 0 && (
                      <span className={isActive ? 'text-white/70' : 'text-neutral-500'}>
                        {' '}
                        {counts[tab.id]}
                      </span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>
        </ScrollReveal>

        <div className="mt-12">
          {isError ? (
            // The pets live behind the API; the pitch does not. If the list
            // cannot load, say so plainly and keep a door open.
            <p className="max-w-[52ch] border-t border-neutral-800 pt-8 leading-relaxed text-neutral-400">
              We could not load the community just now.{' '}
              <Link
                to="/community"
                className="text-[#ff6b35] underline-offset-4 transition-colors hover:text-[#ff8c5c] hover:underline"
              >
                Try the full list
              </Link>
              , which usually means the connection rather than the pets.
            </p>
          ) : (
            <>
              <AnimatedToggle isOpen={activeTab === 'dog'}>
                {isLoading ? <PetGridSkeleton /> : <PetGrid pets={pets.dogs.slice(0, 6)} />}
              </AnimatedToggle>

              <AnimatedToggle isOpen={activeTab === 'cat'}>
                {isLoading ? <PetGridSkeleton /> : <PetGrid pets={pets.cats.slice(0, 6)} />}
              </AnimatedToggle>
            </>
          )}
        </div>

        {!isError && pets.total > 0 && (
          <ScrollReveal delay={0.1}>
            <Link
              to="/community"
              className="group mt-12 inline-flex items-center gap-2 border-t border-neutral-800 pt-8 font-semibold text-white transition-colors duration-200 hover:text-[#ff6b35]"
            >
              See all {pets.total} pets
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 ease-out-quart group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                aria-hidden="true"
              />
            </Link>
          </ScrollReveal>
        )}
      </div>
    </section>
  )
}
