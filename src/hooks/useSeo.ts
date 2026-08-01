import { useEffect } from 'react'

/**
 * Per-route <title>, description and canonical.
 *
 * Every route shared one title — "PawSome" — and one description, because this
 * is a single HTML file and nothing ever changed the head after boot. In a
 * search result the title is the clickable line, so seven public routes were
 * competing for the same one with nothing to tell them apart.
 *
 * This only reaches crawlers that execute JavaScript. Google does; the ones
 * that build link previews (LinkedIn, Slack, WhatsApp, X) do not, and read the
 * static markup in index.html instead. That is why the Open Graph tags live
 * there as fixed values rather than being set from here — anything written to
 * the head at runtime is invisible to the audience those tags exist for.
 *
 * Nothing is restored on unmount. A SPA route change always runs the next
 * route's effect, and stale head tags between two synchronous effects are not
 * observable; resetting to a default in a cleanup only risks a flash of the
 * wrong title if the order ever changed.
 */

const SITE_NAME = 'PawSome'
const ORIGIN = 'https://pawsome.bond'

function setMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export interface SeoOptions {
  /** Page title without the brand — " — PawSome" is appended. Pass the full
   *  string as `title` on the home page, where the brand comes first. */
  title: string
  description?: string
  /** Path only, e.g. "/community". Omit on routes that should not claim one —
   *  anything parameterised or signed-in. */
  path?: string
  /** Set on routes with nothing worth indexing, so a crawler that renders JS
   *  drops them even if it arrived by a route robots.txt does not cover. */
  noIndex?: boolean
}

export function useSeo({ title, description, path, noIndex }: SeoOptions) {
  useEffect(() => {
    document.title = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`

    if (description) {
      setMeta('meta[name="description"]', 'name', 'description', description)
    }

    if (path) {
      let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
      if (!link) {
        link = document.createElement('link')
        link.rel = 'canonical'
        document.head.appendChild(link)
      }
      link.href = `${ORIGIN}${path}`
    }

    // Removed rather than set to "index", so the tag is absent by default. An
    // explicit robots meta on every page is one more thing that can be left
    // saying the wrong thing after a copy-paste.
    const robots = document.head.querySelector('meta[name="robots"]')
    if (noIndex) {
      setMeta('meta[name="robots"]', 'name', 'robots', 'noindex, nofollow')
    } else if (robots) {
      robots.remove()
    }
  }, [title, description, path, noIndex])
}
