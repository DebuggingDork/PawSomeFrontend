import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface ScrollPinnedSliderProps {
  children: React.ReactNode
  className?: string
  /**
   * Changes whenever the panels do. The pin distance is measured from
   * scrollWidth once, on mount — so panels that arrive later (pets loading in
   * from the API) would leave the pin ending in the wrong place, either cutting
   * the last panel off or holding the page still after the strip has run out.
   * Feeding this into the effect rebuilds the trigger against the new width.
   */
  contentKey?: string | number
}

/** Live answer to prefers-reduced-motion, so a change in OS settings takes
 *  effect without a reload (matters here: the pin is set up once in an effect). */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return reduced
}

export const ScrollPinnedSlider: React.FC<ScrollPinnedSliderProps> = ({
  children,
  className = '',
  contentKey,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const reduceMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (reduceMotion) return
    if (!containerRef.current || !wrapperRef.current) return

    const container = containerRef.current
    const wrapper = wrapperRef.current

    // Calculate how far to move horizontally
    const getScrollAmount = () => {
      const amount = Math.max(0, wrapper.scrollWidth - window.innerWidth)
      return -amount
    }

    // Small delay so the DOM has fully painted before measuring
    const ctx = gsap.context(() => {
      if (wrapper.scrollWidth <= window.innerWidth) return

      gsap.to(wrapper, {
        x: getScrollAmount,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: () => `+=${Math.abs(getScrollAmount())}`,
          pin: true,
          pinSpacing: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: () => {
            // Reset inline transform so recalculation is clean
            gsap.set(wrapper, { clearProps: 'x' })
          },
        },
      })

      // Recalculate all trigger positions after setup
      ScrollTrigger.refresh()
    }, containerRef)

    return () => {
      // ctx.revert() only kills triggers/tweens created inside this context,
      // leaving all other page ScrollTriggers intact
      ctx.revert()
    }
  }, [reduceMotion, contentKey])

  // Pinning the viewport and driving the panels sideways off the scroll wheel is
  // exactly the kind of hijacking that makes people motion-sick, so with reduced
  // motion the same panels become an ordinary horizontal scroller they can flick
  // through at their own pace. Same content, same order, no takeover.
  if (reduceMotion) {
    return (
      <div className={`w-full min-w-0 max-w-full py-16 ${className}`}>
        <div className="thin-scrollbar flex snap-x snap-mandatory items-center gap-8 overflow-x-auto px-4 pb-6 md:px-12">
          {React.Children.map(children, (child) => (
            <div className="snap-center">{child}</div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`w-full min-w-0 max-w-full overflow-hidden h-screen bg-neutral-950 flex flex-col justify-center ${className}`}
    >
      <div
        ref={wrapperRef}
        className="flex h-auto w-max max-w-none will-change-transform items-center px-4 md:px-12 gap-8 py-12"
      >
        {children}
      </div>
    </div>
  )
}
