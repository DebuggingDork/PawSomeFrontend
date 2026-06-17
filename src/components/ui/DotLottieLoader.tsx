import React, { useState, useEffect } from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import type { DotLottie } from '@lottiefiles/dotlottie-react'

interface DotLottieLoaderProps {
  /**
   * URL to the animation file (.json or .lottie)
   * You can use animations from LottieFiles or host your own
   */
  src: string
  /**
   * Size of the loader (small: 60px, medium: 120px, large: 200px, xlarge: 300px)
   * @default "medium"
   */
  size?: 'small' | 'medium' | 'large' | 'xlarge' | 'custom'
  /**
   * Custom size in pixels (only used when size="custom")
   */
  customSize?: number
  /**
   * Animation playback speed
   * @default 1
   */
  speed?: number
  /**
   * Show overlay background
   * @default true
   */
  showOverlay?: boolean
  /**
   * Overlay opacity (0-1)
   * @default 0.8
   */
  overlayOpacity?: number
  /**
   * Loading text to display below animation
   */
  text?: string
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Position of the loader
   * @default "fixed" - covers entire viewport
   * "absolute" - covers parent container (parent must have position: relative)
   * "static" - inline in normal document flow
   */
  position?: 'fixed' | 'absolute' | 'static'
  /**
   * z-index of the loader
   * @default 9999
   */
  zIndex?: number
  /**
   * Callback when animation is loaded
   */
  onLoad?: () => void
  /**
   * Callback when animation completes one loop
   */
  onComplete?: () => void
}

/**
 * DotLottieLoader - A reusable loader component using Lottie animations
 *
 * @example
 * // Simple usage
 * <DotLottieLoader src="https://lottie.host/your-animation.json" />
 *
 * @example
 * // With custom text and size
 * <DotLottieLoader
 *   src="https://lottie.host/your-animation.json"
 *   size="large"
 *   text="Finding your perfect match..."
 * />
 *
 * @example
 * // Inline loader without overlay
 * <DotLottieLoader
 *   src="https://lottie.host/your-animation.json"
 *   size="small"
 *   showOverlay={false}
 *   position="static"
 * />
 */
export const DotLottieLoader: React.FC<DotLottieLoaderProps> = ({
  src,
  size = 'medium',
  customSize,
  speed = 1,
  showOverlay = true,
  overlayOpacity = 0.8,
  text,
  className = '',
  position = 'fixed',
  zIndex = 9999,
  onLoad,
  onComplete,
}) => {
  const [dotLottie, setDotLottie] = useState<DotLottie | null>(null)

  // Event listeners
  useEffect(() => {
    if (!dotLottie) return

    const handleLoad = () => {
      onLoad?.()
    }

    const handleComplete = () => {
      onComplete?.()
    }

    dotLottie.addEventListener('ready', handleLoad)
    dotLottie.addEventListener('complete', handleComplete)

    return () => {
      dotLottie.removeEventListener('ready', handleLoad)
      dotLottie.removeEventListener('complete', handleComplete)
    }
  }, [dotLottie, onLoad, onComplete])

  const dotLottieRefCallback = (instance: DotLottie | null) => {
    setDotLottie(instance)
  }

  // Size mapping
  const sizeMap = {
    small: 60,
    medium: 120,
    large: 200,
    xlarge: 300,
    custom: customSize || 120,
  }

  const animationSize = sizeMap[size]

  // Position styles
  const positionStyles: Record<typeof position, string> = {
    fixed: 'fixed inset-0',
    absolute: 'absolute inset-0',
    static: 'relative',
  }

  return (
    <div
      className={`${positionStyles[position]} flex items-center justify-center ${className}`}
      style={{ zIndex }}
    >
      {/* Overlay */}
      {showOverlay && position !== 'static' && (
        <div
          className="absolute inset-0 bg-neutral-950"
          style={{ opacity: overlayOpacity }}
        />
      )}

      {/* Loader Content */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* Animation */}
        <div
          style={{
            width: `${animationSize}px`,
            height: `${animationSize}px`,
          }}
        >
          <DotLottieReact
            src={src}
            loop
            autoplay
            speed={speed}
            dotLottieRefCallback={dotLottieRefCallback}
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* Loading Text */}
        {text && (
          <p className="text-center text-sm font-medium text-neutral-300 animate-pulse">
            {text}
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * Hook to control loader visibility
 *
 * @example
 * const { isLoading, startLoading, stopLoading } = useLoader()
 *
 * return (
 *   <>
 *     {isLoading && <DotLottieLoader src="..." />}
 *     <button onClick={startLoading}>Start</button>
 *   </>
 * )
 */
export const useLoader = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState)

  const startLoading = () => setIsLoading(true)
  const stopLoading = () => setIsLoading(false)
  const toggleLoading = () => setIsLoading((prev) => !prev)

  return {
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading,
    setIsLoading,
  }
}
