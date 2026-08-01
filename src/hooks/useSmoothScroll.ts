import { useEffect } from 'react'
import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap'
import { useLoaderStore } from '@/store/useLoaderStore'
import { useAuthStore } from '@/store/useAuthStore'

gsap.registerPlugin(ScrollTrigger)

const STORAGE_KEY = 'pawsome_scroll_y'

/** The live Lenis instance, for anything outside this hook that needs to move
 * the page (ScrollToHash after route changes). Programmatic native scrolls and
 * Lenis disagree about who owns the position; going through Lenis avoids the
 * fight. */
let activeLenis: Lenis | null = null
export function getLenis(): Lenis | null {
  return activeLenis
}

/** Past this point we reveal the app whether or not the session has resolved.
 * A slow or hanging backend used to pin the splash indefinitely; the navbar
 * renders its own hydrating skeleton, so a late resolution fills that in rather
 * than contradicting anything already on screen. */
const HYDRATION_REVEAL_TIMEOUT_MS = 2500

/** Reveal #root with a fade once we're at the correct position. */
function revealPage() {
  // Dismiss the pre-loader and reveal #root in the same JS task — no gap.
  // The two fades overlap into a crossfade instead of the splash snapping out.
  const pre = document.getElementById('pre-loader')
  if (pre) {
    pre.classList.add('is-done')
    // It's already pointer-events:none, so it can't swallow clicks while the
    // fade plays out; this just keeps the finished splash out of the tree.
    setTimeout(() => pre.remove(), 400)
  }
  const root = document.getElementById('root')
  if (root) root.classList.add('ready')
}

export function useSmoothScroll() {
  const { stopLoading } = useLoaderStore()

  useEffect(() => {
    // ── Step 1: Save position right before the page unloads ──────────────────
    const handleBeforeUnload = () => {
      sessionStorage.setItem(STORAGE_KEY, String(window.scrollY))
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    // ── Step 2: Boot Lenis ────────────────────────────────────────────────────
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
      wheelMultiplier: 1,
      // Prevent Lenis from creating a second scroll context
      prevent: (node: any) => node.classList?.contains('lenis-prevent-scroll'),
    })
    activeLenis = lenis

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    const rafId = requestAnimationFrame(raf)

    // ── Step 3: Reliable scroll restoration ──────────────────────────────────
    // We can't rely on listening to ScrollTrigger's 'refresh' event because
    // child components (e.g. ScrollPinnedSlider) call ScrollTrigger.refresh()
    // inside their own useEffects, which fire BEFORE this hook can attach a
    // listener — so the event is missed entirely.
    //
    // Instead: yield two animation frames so all component useEffects have
    // run and registered their ScrollTrigger instances, then call
    // ScrollTrigger.refresh() ourselves. This guarantees the DOM height is
    // fully calculated before we restore the scroll position.
    const savedY = sessionStorage.getItem(STORAGE_KEY)

    // Resuming a session from a stored token (see useAuthStore.hydrate) is async,
    // so on a fresh page load isAuthenticated starts out false regardless of the
    // real session state. Revealing the navbar before that resolves is what caused
    // the "signed out, then signed in" flash on every refresh — so the pre-loader
    // stays up until hydration finishes too, not just once scroll is restored.
    // hydrate() is idempotent/cached and always settles (see its own try/catch),
    // so this can't leave the splash stuck even if the API call fails.
    //
    // The splash itself stays invisible for its first 450ms (see index.html), so
    // a session that resolves quickly is never announced with a loading screen at
    // all — the user just sees the app. The splash only fades in when there is
    // genuinely something to wait for.
    const hydrated = useAuthStore.getState().hydrate()

    let revealTimeoutId: number | undefined
    const settled = Promise.race([
      hydrated,
      new Promise<void>((resolve) => {
        revealTimeoutId = window.setTimeout(resolve, HYDRATION_REVEAL_TIMEOUT_MS)
      }),
    ])

    const finish = (targetY?: number) => {
      settled.then(() => {
        if (revealTimeoutId !== undefined) clearTimeout(revealTimeoutId)
        if (targetY !== undefined) {
          lenis.scrollTo(targetY, { immediate: true })
          sessionStorage.removeItem(STORAGE_KEY)
        }
        stopLoading()
        revealPage()
      })
    }

    if (savedY) {
      const targetY = Number(savedY)

      // Two rAFs: first yields to let all child useEffects run,
      // second yields to let their ScrollTrigger.refresh() calls settle.
      // Then we do a final refresh() and immediately restore position.
      let rafId2: number
      rafId2 = requestAnimationFrame(() => {
        rafId2 = requestAnimationFrame(() => {
          ScrollTrigger.refresh()
          finish(targetY)
        })
      })

      return () => {
        cancelAnimationFrame(rafId2)
        // NB: deliberately no unconditional revealPage() here. This cleanup also
        // runs on React 18 StrictMode's dev-only mount→cleanup→remount cycle,
        // which fires almost immediately — long before `hydrated` resolves. An
        // unconditional reveal here showed the pre-hydration navbar (wrong nav
        // links, skeleton avatar buttons) on every refresh, which then snapped
        // to the real one a moment later. hydrate() always settles (see its
        // try/catch), so the surviving mount's own finish()→hydrated.then()
        // chain is guaranteed to reveal the page — no separate safety net needed.
        if (revealTimeoutId !== undefined) clearTimeout(revealTimeoutId)
        window.removeEventListener('beforeunload', handleBeforeUnload)
        cancelAnimationFrame(rafId)
        if (activeLenis === lenis) activeLenis = null
        lenis.destroy()
      }
    }

    // No saved position — normal first load, reveal immediately
    finish()

    return () => {
      if (revealTimeoutId !== undefined) clearTimeout(revealTimeoutId)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      cancelAnimationFrame(rafId)
      if (activeLenis === lenis) activeLenis = null
      lenis.destroy()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
