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
      // Add padding calculation if necessary, but scrollWidth - clientWidth usually handles it.
      // Math.max guarantees we don't go positive if content is smaller than screen
      const amount = Math.max(0, wrapper.scrollWidth - window.innerWidth)
      return -amount
    }

    // Only create animation if there's enough content to scroll
    if (wrapper.scrollWidth > window.innerWidth) {
      const tween = gsap.to(wrapper, {
        x: getScrollAmount,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: () => `+=${Math.abs(getScrollAmount())}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })

      return () => {
        tween.kill()
        ScrollTrigger.getAll().forEach((t) => t.kill())
      }
    }
  }, [children])

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
