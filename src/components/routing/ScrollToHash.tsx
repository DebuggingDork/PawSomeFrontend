import { useEffect } from 'react'
import { useLocation } from 'react-router'

/**
 * Scrolls to `#some-id` after a client-side navigation.
 *
 * The browser only honours a hash on a real document load. Following a router
 * Link to /about#our-story changes the URL and renders the page, but leaves you
 * at the top of it, which makes every deep link in the footer look broken.
 *
 * The rAF matters: on a cross-page navigation the target does not exist yet
 * when this effect first runs.
 */
export function ScrollToHash() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) return

    const frame = requestAnimationFrame(() => {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (!target) return
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    })

    return () => cancelAnimationFrame(frame)
  }, [pathname, hash])

  return null
}
