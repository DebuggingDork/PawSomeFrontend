import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import PawsomeFooter from '@/components/ui/PawsomeFooter'
import { cn } from '@/lib/utils'

export interface LegalSection {
  id: string
  title: string
  content: ReactNode
}

interface LegalDocumentProps {
  title: string
  lede: string
  lastUpdated: string
  /** Plain-language précis, shown before the numbered sections. */
  summary: ReactNode
  sections: LegalSection[]
}

/**
 * Shell for the Privacy Policy and Terms of Use.
 *
 * Two things here are deliberate. The body copy is neutral-300 rather than the
 * neutral-400 the marketing pages use: 400 clears WCAG AA on this background,
 * but these are the only pages on the site someone reads for four minutes
 * straight, and the extra contrast is worth more than the elegance.
 *
 * And nothing in the article is gated behind a scroll reveal. Everywhere else
 * an unplayed animation costs you a fade; here it would cost you the terms you
 * just agreed to.
 */
export function LegalDocument({ title, lede, lastUpdated, summary, sections }: LegalDocumentProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '')
  const visible = useRef(new Set<string>())

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.current.add(entry.target.id)
          else visible.current.delete(entry.target.id)
        }
        // Highest section still on screen wins, so the marker doesn't jump to a
        // heading that is only just peeking in at the bottom of the viewport.
        const first = sections.find((section) => visible.current.has(section.id))
        if (first) setActiveId(first.id)
      },
      { rootMargin: '-100px 0px -65% 0px' },
    )

    for (const section of sections) {
      const el = document.getElementById(section.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [sections])

  const jumpTo = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id)
    if (!target) return
    event.preventDefault()
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    // Keep the URL shareable without letting the browser also jump.
    history.replaceState(null, '', `#${id}`)
  }

  return (
    <div className="w-full bg-neutral-950">
      <header className="mx-auto max-w-3xl px-6 pb-14 pt-28 md:pt-36">
        <Link
          to="/"
          className="group inline-flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-200 ease-out group-hover:-translate-x-0.5" />
          Back to PawSome
        </Link>

        <h1 className="mt-8 text-balance font-display text-4xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
          {title}
        </h1>
        <p className="mt-5 max-w-[62ch] text-pretty text-lg leading-relaxed text-neutral-300">{lede}</p>
        <p className="mt-6 font-accent text-xs uppercase tracking-[0.14em] text-neutral-500">
          Last updated {lastUpdated}
        </p>
      </header>

      <div className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-2xl bg-[#ff6b35]/[0.07] p-6 md:p-8">
          <h2 className="font-display text-lg font-bold text-white">The short version</h2>
          <div className="mt-3 max-w-[68ch] space-y-3 leading-relaxed text-neutral-300">{summary}</div>
          <p className="mt-4 text-sm leading-relaxed text-neutral-400">
            This summary is here to be readable, not to be the agreement. Where the two disagree, the numbered
            sections below are what counts.
          </p>
        </div>

        <div className="mt-16 gap-16 lg:grid lg:grid-cols-[210px_minmax(0,1fr)]">
          <nav aria-label="On this page" className="mb-12 lg:mb-0">
            <div className="lg:sticky lg:top-28">
              <p className="font-accent text-xs uppercase tracking-[0.14em] text-neutral-500">On this page</p>
              <ul className="mt-4 space-y-1">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      onClick={(event) => jumpTo(event, section.id)}
                      className={cn(
                        'block rounded-md py-1.5 pl-3 pr-2 text-sm leading-snug transition-colors duration-150',
                        activeId === section.id
                          ? 'bg-white/[0.04] text-white'
                          : 'text-neutral-400 hover:text-neutral-200',
                      )}
                    >
                      <span className="mr-2 font-accent text-xs text-neutral-600">{index + 1}</span>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <article className="max-w-[70ch]">
            {sections.map((section, index) => (
              <section key={section.id} id={section.id} className="scroll-mt-28 border-t border-neutral-900 pt-10 first:border-t-0 first:pt-0 [&+&]:mt-14">
                <h2 className="font-display text-2xl font-bold leading-snug text-white md:text-[1.75rem]">
                  <span className="mr-3 font-accent text-base font-medium text-neutral-600">{index + 1}</span>
                  {section.title}
                </h2>
                <div className="mt-5">{section.content}</div>
              </section>
            ))}
          </article>
        </div>
      </div>

      <PawsomeFooter />
    </div>
  )
}

/* ── Prose primitives ─────────────────────────────────────────────────────────
   Small named components instead of a global prose stylesheet: these pages are
   the only long-form copy in the app, and a `.prose` cascade would leak into
   every card and chat bubble that later happens to sit inside one. */

export function P({ children }: { children: ReactNode }) {
  return <p className="mt-4 text-pretty leading-relaxed text-neutral-300 first:mt-0">{children}</p>
}

export function H3({ children }: { children: ReactNode }) {
  return <h3 className="mt-8 font-display text-lg font-semibold text-white">{children}</h3>
}

export function UL({ children }: { children: ReactNode }) {
  return <ul className="mt-4 space-y-2.5">{children}</ul>
}

export function LI({ children }: { children: ReactNode }) {
  return (
    <li className="relative pl-6 leading-relaxed text-neutral-300">
      <span
        aria-hidden="true"
        className="absolute left-0 top-[0.6em] h-1.5 w-1.5 rounded-full bg-[#ff6b35]"
      />
      {children}
    </li>
  )
}

/** For the sentences a reader should not skim past. */
export function Note({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 rounded-xl bg-white/[0.03] px-5 py-4 leading-relaxed text-neutral-300">{children}</div>
  )
}

export function Term({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-white">{children}</strong>
}
