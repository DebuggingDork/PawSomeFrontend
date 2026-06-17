import { useEffect } from 'react'
import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap'
import { useLoaderStore } from '@/store/useLoaderStore'

gsap.registerPlugin(ScrollTrigger)

const STORAGE_KEY = 'pawsome_scroll_y'

/** Reveal #root with a fade once we're at the correct position. */
function revealPage() {
  // Dismiss the pre-loader first — it was covering the screen until now
  const pre = document.getElementById('pre-loader')
  if (pre) pre.style.display = 'none'

  // Then make #root visible — both happen in the same JS task so there
  // is zero gap between the pre-loader leaving and the page appearing
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

    // ── Step 3: Event-driven restoration ─────────────────────────────────────
    // ScrollTrigger's 'refresh' fires after GSAP has measured all pinned
    // sections — document height is stable, so scrollTo lands precisely.
    // We dismiss the loader and reveal the page only at this point, so the
    // user never sees any flash of wrong content.
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

      const onRefreshComplete = () => {
        ScrollTrigger.removeEventListener('refresh', onRefreshComplete)
        finish(targetY)
      }

      ScrollTrigger.addEventListener('refresh', onRefreshComplete)

      return () => {
        // Safety net: unmounted before refresh fired — never leave page invisible
        ScrollTrigger.removeEventListener('refresh', onRefreshComplete)
        finish()
        window.removeEventListener('beforeunload', handleBeforeUnload)
        cancelAnimationFrame(rafId)
        lenis.destroy()
      }
    }

    // No saved position — normal first load, dismiss loader right away
    finish()

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
