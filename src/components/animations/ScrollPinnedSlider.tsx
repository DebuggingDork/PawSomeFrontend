import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface ScrollPinnedSliderProps {
  children: React.ReactNode
  className?: string
}

export const ScrollPinnedSlider: React.FC<ScrollPinnedSliderProps> = ({
  children,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={containerRef} className={`overflow-hidden h-screen bg-neutral-950 flex flex-col justify-center ${className}`}>
      <div
        ref={wrapperRef}
        className="flex h-auto w-max will-change-transform items-center px-4 md:px-12 gap-8 py-12"
      >
        {children}
      </div>
    </div>
  )
}
