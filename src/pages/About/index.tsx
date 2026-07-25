import { Link } from 'react-router'
import { PawPrint, MapPin, ShieldCheck, MessageCircle, Heart } from 'lucide-react'
import { ScrollReveal } from '@/components/animations/ScrollReveal'
import { StaggerRevealContainer, StaggerRevealItem } from '@/components/animations/StaggerReveal'
import PawsomeFooter from '@/components/ui/PawsomeFooter'

const STATS = [
  { value: '12k+', label: 'pets with profiles' },
  { value: '340', label: 'cities and counting' },
  { value: '2,600+', label: 'playdates arranged' },
]

const STEPS = [
  {
    number: '01',
    title: 'Build a profile for your pet',
    description: 'Photos, breed, energy level, the works. Owners get a profile too, so everyone knows who they’re meeting.',
  },
  {
    number: '02',
    title: 'Browse or get matched nearby',
    description: 'Filter by species, breed, and distance in Community, or let Discover suggest pets your dog or cat will actually get along with.',
  },
  {
    number: '03',
    title: 'Chat, then meet up',
    description: 'Message through the app first. When you’re both ready, take it to a dog park, a walk, or one of the local events.',
  },
]

function AboutPage() {
  return (
    <div className="w-full bg-neutral-950">
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pb-16 pt-28 text-center md:pt-36">
        <ScrollReveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/60 px-4 py-1.5 text-sm font-medium text-neutral-400">
            <PawPrint className="h-3.5 w-3.5 text-[#ff6b35]" />
            Built by pet people, for pet people
          </span>
          <h1 className="mt-6 text-balance font-display text-4xl font-bold leading-tight text-white md:text-6xl">
            The park is great. Finding who to meet there isn't.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-neutral-400">
            PawSome started as a shared annoyance: two dog owners standing at opposite ends of the same park, both
            wishing there was an easier way to find pets that actually match their own. So we built one.
          </p>
        </ScrollReveal>
      </section>

      {/* Story */}
      <section className="border-t border-neutral-900 py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <ScrollReveal direction="right">
            <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
              Why we exist
            </h2>
            <p className="mt-5 max-w-xl leading-relaxed text-neutral-400">
              Most pet apps are either e-commerce with a mascot, or a swipe deck that treats a fifty-pound Labrador
              the same as a five-pound Chihuahua. Neither actually helps you find a good match nearby.
            </p>
            <p className="mt-4 max-w-xl leading-relaxed text-neutral-400">
              We built PawSome around the pet, not the owner. Profiles carry breed, energy level, and temperament, so
              a match means your pets will genuinely get along, not just that two humans swiped right.
            </p>
          </ScrollReveal>
          <ScrollReveal direction="left" delay={0.1}>
            <div className="grid grid-cols-3 divide-x divide-neutral-800 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/40">
              {STATS.map((stat) => (
                <div key={stat.label} className="flex flex-col items-center gap-1 px-3 py-8 text-center">
                  <span className="font-display text-2xl font-bold text-white md:text-3xl">{stat.value}</span>
                  <span className="text-xs leading-snug text-neutral-500">{stat.label}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-neutral-900 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <ScrollReveal className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold text-white md:text-4xl">How it works</h2>
            <p className="mt-4 leading-relaxed text-neutral-400">
              Three steps between "wouldn't it be nice if my dog had a friend" and an actual playdate.
            </p>
          </ScrollReveal>

          <StaggerRevealContainer className="mt-14 flex flex-col gap-10" staggerDelay={0.12}>
            {STEPS.map((step) => (
              <StaggerRevealItem key={step.number}>
                <div className="flex gap-6 border-t border-neutral-900 pt-8 first:border-t-0 first:pt-0 md:gap-10">
                  <span className="font-display text-3xl font-bold text-neutral-700 md:text-4xl">{step.number}</span>
                  <div>
                    <h3 className="text-lg font-bold text-white md:text-xl">{step.title}</h3>
                    <p className="mt-2 max-w-xl leading-relaxed text-neutral-400">{step.description}</p>
                  </div>
                </div>
              </StaggerRevealItem>
            ))}
          </StaggerRevealContainer>
        </div>
      </section>

      {/* What we care about */}
      <section className="border-t border-neutral-900 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <ScrollReveal className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold text-white md:text-4xl">What we care about</h2>
          </ScrollReveal>

          <div className="mt-12 grid gap-x-10 gap-y-10 md:grid-cols-2">
            <ScrollReveal direction="up" delay={0.05} className="flex gap-4">
              <ShieldCheck className="h-6 w-6 shrink-0 text-[#ff6b35]" />
              <div>
                <h3 className="font-semibold text-white">Verification over vibes</h3>
                <p className="mt-1.5 leading-relaxed text-neutral-400">
                  Owner accounts are verified before pets can be messaged, so you're never guessing who's on the other
                  end of a chat.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.1} className="flex gap-4">
              <MapPin className="h-6 w-6 shrink-0 text-[#ff6b35]" />
              <div>
                <h3 className="font-semibold text-white">Local, not global</h3>
                <p className="mt-1.5 leading-relaxed text-neutral-400">
                  Matches and events are sorted by distance first. A perfect match three states over doesn't get your
                  dog to the park any faster.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.15} className="flex gap-4">
              <MessageCircle className="h-6 w-6 shrink-0 text-[#ff6b35]" />
              <div>
                <h3 className="font-semibold text-white">Conversations, not just swipes</h3>
                <p className="mt-1.5 leading-relaxed text-neutral-400">
                  Every match opens a real chat. You decide when and where to meet, on your own terms.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.2} className="flex gap-4">
              <Heart className="h-6 w-6 shrink-0 text-[#ff6b35]" />
              <div>
                <h3 className="font-semibold text-white">Built for the pet first</h3>
                <p className="mt-1.5 leading-relaxed text-neutral-400">
                  Breed, energy level, and temperament shape every match, because compatibility starts with the
                  animals, not the algorithm.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-neutral-900 py-20">
        <ScrollReveal className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 text-center">
          <h2 className="text-balance font-display text-3xl font-bold text-white md:text-4xl">
            Your pet's next best friend is closer than you think.
          </h2>
          <Link
            to="/discover"
            className="inline-flex items-center gap-2 rounded-full bg-[#ff6b35] px-7 py-3 font-semibold text-white shadow-lg shadow-[#ff6b35]/30 transition-all hover:-translate-y-0.5 hover:bg-[#ff5722]"
          >
            <Heart className="h-4 w-4" />
            Find matches near you
          </Link>
        </ScrollReveal>
      </section>

      <PawsomeFooter />
    </div>
  )
}

export default AboutPage
