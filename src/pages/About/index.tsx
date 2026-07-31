import { Link } from 'react-router'
import { MapPin, ShieldCheck, MessageCircle, Heart } from 'lucide-react'
import { ScrollReveal } from '@/components/animations/ScrollReveal'
import { StaggerRevealContainer, StaggerRevealItem } from '@/components/animations/StaggerReveal'
import PawsomeFooter from '@/components/ui/PawsomeFooter'

const AIMS = [
  {
    title: 'Make the search finite',
    body: 'Finding a match should be a list you can work through, not an open-ended ask-around that never formally ends. Filter by species, breed, age and distance, and see who is actually reachable this weekend.',
  },
  {
    title: 'Put a real person on the other end',
    body: 'Every account is tied to a verified email address before it can message anyone. It is a low bar and we say so plainly, but it is the difference between a person and a phone number someone gave you at the park.',
  },
  {
    title: 'Keep the animal ahead of the metric',
    body: 'No engagement loops, no artificial scarcity, no feed tuned to keep you scrolling. If your dog finds one good match and you never open the app again, the app worked.',
  },
]

const STEPS = [
  {
    number: '01',
    title: 'Build a profile for your pet',
    description:
      'Photos, breed, age, energy level, the works. Owners get a profile too, so everyone knows who they are meeting.',
  },
  {
    number: '02',
    title: 'Browse or get matched nearby',
    description:
      'Filter by species, breed and distance in Community, or let Discover suggest pets your dog or cat will genuinely get along with.',
  },
  {
    number: '03',
    title: 'Chat, then meet up',
    description:
      'Message through the app first. When you are both ready, take it to a park, a walk, or one of the local events.',
  },
]

function AboutPage() {
  return (
    <div className="w-full bg-neutral-950">
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pb-16 pt-28 text-center md:pt-36">
        <ScrollReveal>
          <h1 className="text-balance font-display text-4xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-6xl">
            It started with a dog named Bruno.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-neutral-300">
            He was two years old, in perfect health, and thoroughly fed up. What he needed was another dog. Finding one
            turned out to be so absurdly difficult that it became this.
          </p>
        </ScrollReveal>
      </section>

      {/* Our story */}
      <section id="our-story" className="scroll-mt-24 border-t border-neutral-900 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="gap-14 lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
            <div className="max-w-[68ch]">
              <h2 className="font-display text-3xl font-bold tracking-[-0.02em] text-white md:text-4xl">Our story</h2>

              <div className="mt-8 space-y-5 text-[1.0625rem] leading-[1.75] text-neutral-300">
                <p className="text-pretty">
                  Bruno belongs to a friend of mine. He is two years old, which in dog years is roughly the age where
                  you start quietly wondering what you are doing with your life. For a few months that is exactly how
                  he looked. He was not ill and he was not badly behaved, he had just gone flat, in the way dogs do
                  when their days stop containing anything surprising.
                </p>
                <p className="text-pretty">
                  We tried the obvious things. Longer walks. A new ball, which lasted nine minutes. The park, where
                  Bruno would do one lap, greet three dogs who were busy with their own people, and come back to sit
                  heavily on my friend's foot.
                </p>
                <p className="text-pretty">
                  What he needed was another dog. Not a hello at the gate, an actual match. And it turns out that
                  finding one is genuinely absurd. You ask around. Someone knows someone whose cousin has a female of
                  the right breed, four hours away, who may or may not still be available. You get added to a WhatsApp
                  group with four hundred people in it and one pinned message from 2021. Then you go back to the park
                  and ask strangers slightly awkward questions about their dog's age.
                </p>
                <p className="text-pretty">
                  The idea arrived on a completely ordinary evening. My friend was on the sofa, half watching
                  something, swiping through Hinge. Bruno had his chin on the armrest, watching him do it, with the
                  patient expression of someone waiting to be included.
                </p>

                <blockquote className="py-2">
                  <p className="text-pretty font-display text-2xl font-semibold leading-snug text-white md:text-[1.75rem]">
                    "This guy needs one of these."
                  </p>
                </blockquote>

                <p className="text-pretty">
                  He meant it as a joke. I clearly did not take it as one, because I could not stop turning it over
                  afterwards. Every hard part of finding Bruno a match is a problem software is good at. Who is
                  nearby. Who is the right breed, the right age, the right temperament. Who is a real person and who
                  is a stranger on the internet with somebody else's photo. Humans solved this for themselves years
                  ago, and then went back to asking around at the park on behalf of their dogs.
                </p>
                <p className="text-pretty">
                  So I built PawSome. Nights and weekends, mostly, with a lot of opinions about breeds I did not have
                  a year ago. Bruno has contributed nothing to the codebase and takes full credit for it.
                </p>
              </div>
            </div>

            {/* A byline, not a portrait frame. The empty photo well that used to
                sit here was a promise the page had no intention of keeping. */}
            <ScrollReveal direction="left" delay={0.1} className="mt-14 lg:mt-2">
              <aside className="border-t border-neutral-800 pt-5 lg:sticky lg:top-28">
                <p className="font-display font-semibold text-white">Mani Mamidala</p>
                <p className="mt-1 text-sm leading-relaxed text-neutral-400">
                  Built PawSome. Designs it, writes it, answers the support email.
                </p>
              </aside>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* What we are trying to do */}
      <section className="border-t border-neutral-900 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <ScrollReveal className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold tracking-[-0.02em] text-white md:text-4xl">
              What we are trying to do
            </h2>
            <p className="mt-4 max-w-[62ch] leading-relaxed text-neutral-300">
              Three things, in this order. When a decision about the product is hard, this is the list we check it
              against.
            </p>
          </ScrollReveal>

          <StaggerRevealContainer className="mt-12 flex flex-col" staggerDelay={0.1}>
            {AIMS.map((aim, index) => (
              <StaggerRevealItem key={aim.title}>
                <div className="flex gap-6 border-t border-neutral-900 py-8 md:gap-10">
                  <span className="font-accent text-sm text-neutral-600">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-white">{aim.title}</h3>
                    <p className="mt-2 max-w-[62ch] text-pretty leading-relaxed text-neutral-300">{aim.body}</p>
                  </div>
                </div>
              </StaggerRevealItem>
            ))}
          </StaggerRevealContainer>

          <ScrollReveal delay={0.1}>
            <p className="mt-10 max-w-[62ch] border-t border-neutral-900 pt-8 leading-relaxed text-neutral-400">
              PawSome is early, and a local product with few users in your city is honestly not much use yet. We would
              rather say that here than pad the numbers and let you find out for yourself.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-neutral-900 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <ScrollReveal className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold tracking-[-0.02em] text-white md:text-4xl">How it works</h2>
            <p className="mt-4 leading-relaxed text-neutral-300">
              Three steps between "it would be nice if my dog had someone" and an actual meeting.
            </p>
          </ScrollReveal>

          <StaggerRevealContainer className="mt-14 flex flex-col gap-10" staggerDelay={0.12}>
            {STEPS.map((step) => (
              <StaggerRevealItem key={step.number}>
                <div className="flex gap-6 border-t border-neutral-900 pt-8 first:border-t-0 first:pt-0 md:gap-10">
                  <span className="font-display text-3xl font-bold text-neutral-700 md:text-4xl">{step.number}</span>
                  <div>
                    <h3 className="text-lg font-bold text-white md:text-xl">{step.title}</h3>
                    <p className="mt-2 max-w-xl text-pretty leading-relaxed text-neutral-300">{step.description}</p>
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
            <h2 className="font-display text-3xl font-bold tracking-[-0.02em] text-white md:text-4xl">
              What we care about
            </h2>
          </ScrollReveal>

          <div className="mt-12 grid gap-x-10 gap-y-10 md:grid-cols-2">
            <ScrollReveal direction="up" delay={0.05} className="flex gap-4">
              <ShieldCheck className="h-6 w-6 shrink-0 text-[#ff6b35]" />
              <div>
                <h3 className="font-semibold text-white">Verification over vibes</h3>
                <p className="mt-1.5 text-pretty leading-relaxed text-neutral-300">
                  Owners verify their email before they can message anyone. It is a low bar, we say so on the{' '}
                  <Link
                    to="/faq"
                    className="text-[#ff6b35] underline-offset-4 transition-colors hover:text-[#ff8c5c] hover:underline"
                  >
                    FAQ
                  </Link>
                  , and it still removes most of the throwaway accounts.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.1} className="flex gap-4">
              <MapPin className="h-6 w-6 shrink-0 text-[#ff6b35]" />
              <div>
                <h3 className="font-semibold text-white">Local, not global</h3>
                <p className="mt-1.5 text-pretty leading-relaxed text-neutral-300">
                  Matches and events are sorted by distance first. A perfect match three states over does not get your
                  dog to the park any faster.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.15} className="flex gap-4">
              <MessageCircle className="h-6 w-6 shrink-0 text-[#ff6b35]" />
              <div>
                <h3 className="font-semibold text-white">Conversations, not just swipes</h3>
                <p className="mt-1.5 text-pretty leading-relaxed text-neutral-300">
                  Every match opens a real chat. You decide when and where to meet, on your own terms.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.2} className="flex gap-4">
              <Heart className="h-6 w-6 shrink-0 text-[#ff6b35]" />
              <div>
                <h3 className="font-semibold text-white">Built for the pet first</h3>
                <p className="mt-1.5 text-pretty leading-relaxed text-neutral-300">
                  Breed, age and temperament shape every match, because compatibility starts with the animals rather
                  than the algorithm.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-neutral-900 py-20">
        <ScrollReveal className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 text-center">
          <h2 className="text-balance font-display text-3xl font-bold tracking-[-0.02em] text-white md:text-4xl">
            Bruno is doing much better, since you asked.
          </h2>
          <Link
            to="/discover"
            className="inline-flex items-center gap-2 rounded-full bg-[#ff6b35] px-7 py-3 font-semibold text-white shadow-lg shadow-[#ff6b35]/25 transition-[transform,background-color] duration-200 ease-out hover:bg-[#ff5722] active:scale-[0.97] motion-reduce:transition-none"
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
