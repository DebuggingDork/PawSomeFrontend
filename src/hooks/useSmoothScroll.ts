import { useEffect } from 'react'
import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap'
import { useLoaderStore } from '@/store/useLoaderStore'

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

    const finish = (targetY?: number) => {
      if (targetY !== undefined) {
        lenis.scrollTo(targetY, { immediate: true })
        sessionStorage.removeItem(STORAGE_KEY)
      }
      stopLoading()
      revealPage()
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
        // Safety net: always reveal so page is never stuck invisible
        revealPage()
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
