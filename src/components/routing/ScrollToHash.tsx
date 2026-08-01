import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { getLenis } from '@/hooks/useSmoothScroll'

/**
 * Puts the viewport where a client-side navigation says it should be.
 *
 * Two jobs, because the router does neither by itself:
 *
 * - **`#some-id` links** scroll smoothly to that section. The browser only
 *   honours a hash on a real document load; following a Link to
 *   /about#our-story used to change the URL and leave you where you were.
 * - **Plain route changes** go to the top of the new page. Without this the
 *   old scroll position carried over, so clicking FAQ from the footer landed
 *   you at the *bottom* of the FAQ page — staring at the same footer, as if
 *   the link had done nothing.
 *
 * Scrolling goes through Lenis when it's up (it owns the scroll position;
 * fighting it with native calls is how animations stutter), falling back to
 * native APIs otherwise.
 *
 * The rAF matters: on a cross-page navigation the target section does not
 * exist yet when this effect first runs.
 */
export function ScrollToHash() {
  const { pathname, hash } = useLocation()
  // The very first render is a page load, not a navigation — the browser (and
  // useSmoothScroll's session restore) own that scroll position. Only a hash
  // is acted on then, since a fresh load of /faq#safety should still land on
  // the section.
  const isFirstRender = useRef(true)

  useEffect(() => {
    const first = isFirstRender.current
    isFirstRender.current = false

    if (!hash) {
      if (first) return
      const lenis = getLenis()
      // Immediate, not animated: this is a new page, not a movement within
      // one. Smooth-scrolling the entire height of whatever you had scrolled
      // past replays the old page in fast-forward before the new one settles.
      if (lenis) lenis.scrollTo(0, { immediate: true })
      else window.scrollTo(0, 0)
      return
    }

    const frame = requestAnimationFrame(() => {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (!target) return
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const lenis = getLenis()
      if (lenis) {
        // Lenis ignores CSS scroll-margin, which is how these sections clear
        // the fixed navbar — read it and pass it as the offset instead.
        const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0
        lenis.scrollTo(target, { offset: -margin, immediate: reduced })
      } else {
        target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
      }
    })

    return () => cancelAnimationFrame(frame)
  }, [pathname, hash])

  return null
}
