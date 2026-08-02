import React from 'react'
import { Link } from 'react-router'
import { MailCheck, ShieldOff, UserX } from 'lucide-react'
import { ScrollReveal } from '@/components/animations/ScrollReveal'
import { MaskReveal } from '@/components/animations/MaskReveal'
import {
  StaggerRevealContainer,
  StaggerRevealItem,
} from '@/components/animations/StaggerReveal'

/**
 * What "trust" actually amounts to here.
 *
 * The section this replaces was three equal cards reading Verified Profiles /
 * Built on Trust / Safety Tools, and the hero above it claimed 100% Verified
 * Profiles. The FAQ says the opposite in plain words: the badge means somebody
 * clicked a link in an email, "not an identity check and not an endorsement".
 * A homepage that oversells what the FAQ then walks back is worse than one that
 * claims nothing, so this says the smaller true thing — including the part about
 * what PawSome does not do, which is the most useful sentence on the page.
 *
 * Laid out as a list with rules between the items rather than a card grid. Three
 * same-sized cards with an icon on top is the shape that gives a page away.
 */

const POINTS = [
  {
    icon: MailCheck,
    title: 'A verified badge means one specific thing',
    body: 'That the person clicked a link in an email we sent to the address they signed up with. It filters out throwaway accounts. It is not an identity check and it is not an endorsement.',
  },
  {
    icon: UserX,
    title: 'You can end it from your side, at any point',
    body: "Block someone and they disappear from your matches, your chats and your browsing. Report them and it reaches a person, not a queue. Anything about an animal's welfare goes to the front of it.",
  },
  {
    icon: ShieldOff,
    title: 'Things we do not do',
    body: "We do not inspect animals, verify pedigree papers, or vouch for anyone's breeding practices. Meet in daylight, somewhere public, and meet the person before anything is decided.",
  },
]

export const TrustSection: React.FC = () => {
  return (
    <section className="border-t border-neutral-900 bg-neutral-950 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="gap-16 lg:grid lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-start">
          <ScrollReveal>
            <div className="lg:sticky lg:top-28">
              <MaskReveal>
                <h2 className="text-balance font-display text-4xl font-bold tracking-[-0.02em] text-white md:text-5xl">
                  You are going to meet a stranger.
                </h2>
              </MaskReveal>
              <p className="mt-5 max-w-[46ch] text-pretty text-lg leading-relaxed text-neutral-300">
                So here is precisely what PawSome checks, and precisely what it does
                not. Padding this part would be the one thing that actually matters
                to get wrong.
              </p>
              <Link
                to="/faq#safety"
                className="mt-6 inline-block font-semibold text-brand underline-offset-4 transition-colors duration-200 hover:text-brand-light hover:underline"
              >
                Read the safety and trust FAQ
              </Link>
            </div>
          </ScrollReveal>

          <StaggerRevealContainer className="mt-14 flex flex-col lg:mt-0" staggerDelay={0.1}>
            {POINTS.map(({ icon: Icon, title, body }) => (
              <StaggerRevealItem key={title}>
                <div className="flex gap-5 border-t border-neutral-900 py-8 first:border-t-0 first:pt-0 md:gap-7">
                  <Icon className="mt-1 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                  <div className="min-w-0">
                    <h3 className="font-display text-xl font-semibold text-white">{title}</h3>
                    <p className="mt-2.5 max-w-[62ch] text-pretty leading-relaxed text-neutral-300">
                      {body}
                    </p>
                  </div>
                </div>
              </StaggerRevealItem>
            ))}
          </StaggerRevealContainer>
        </div>
      </div>
    </section>
  )
}
