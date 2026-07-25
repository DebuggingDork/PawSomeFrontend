import { useEffect } from 'react'

/**
 * Calls `handler` when a mousedown lands outside `ref`.
 *
 * `ignoreSelector` widens what counts as "inside" to anything matching that
 * selector. That matters when a component is mounted more than once while
 * sharing one open/closed state: each copy runs its own check against its own
 * ref, so a click inside copy A registers as outside to copy B, which then
 * closes the shared state out from under it.
 */
export function useOnClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  handler: () => void,
  ignoreSelector?: string,
) {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      const target = event.target as Node | null
      if (!ref.current || (target && ref.current.contains(target))) return
      if (ignoreSelector && target instanceof Element && target.closest(ignoreSelector)) return
      handler()
    }
    document.addEventListener('mousedown', listener)
    return () => document.removeEventListener('mousedown', listener)
  }, [ref, handler, ignoreSelector])
}
