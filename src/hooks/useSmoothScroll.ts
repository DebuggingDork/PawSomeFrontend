import { useEffect } from 'react'
import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap'
import { useLoaderStore } from '@/store/useLoaderStore'
import { useAuthStore } from '@/store/useAuthStore'

gsap.registerPlugin(ScrollTrigger)

const STORAGE_KEY = 'pawsome_scroll_y'

/** Reveal #root with a fade once we're at the correct position. */
function revealPage() {
  // Dismiss the pre-loader and reveal #root in the same JS task — no gap
  const pre = document.getElementById('pre-loader')
  if (pre) pre.style.display = 'none'
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
    const hydrated = useAuthStore.getState().hydrate()

    const finish = (targetY?: number) => {
      hydrated.then(() => {
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
        window.removeEventListener('beforeunload', handleBeforeUnload)
        cancelAnimationFrame(rafId)
        lenis.destroy()
      }
    }

    // No saved position — normal first load, reveal immediately
    finish()

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
