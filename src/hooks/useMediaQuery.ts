import { useEffect, useState } from 'react'

/**
 * Subscribes to a CSS media query from JS.
 *
 * Tailwind covers anything that is purely a class swap. This is for the
 * decisions that aren't: props handed to Framer Motion, whether a field grabs
 * focus on mount — things a breakpoint class can't reach.
 *
 * The initial value is read synchronously so the first render is already
 * correct. Anything that only applies on mount (`autoFocus`) depends on that.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(query).matches
      : false,
  )

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const list = window.matchMedia(query)
    const onChange = () => setMatches(list.matches)
    // Re-read on subscribe: the query can have changed between the initial
    // state and this effect (a rotated phone, a resized window).
    onChange()
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/**
 * A finger, not a mouse. Phones and tablets, plus touch laptops in tablet mode.
 *
 * Use this for behaviour that is actively wrong on touch rather than merely
 * different: autofocusing a field, for instance, throws up the on-screen
 * keyboard and scrolls the page out from under someone who has not decided
 * where to start yet.
 */
export function useIsTouchDevice(): boolean {
  return useMediaQuery('(hover: none) and (pointer: coarse)')
}

/** Narrow viewport — Tailwind's `lg` breakpoint, seen from below. */
export function useIsNarrowViewport(): boolean {
  return useMediaQuery('(max-width: 1023px)')
}
