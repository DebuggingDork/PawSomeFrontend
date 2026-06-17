import { DotLottieLoader } from './DotLottieLoader'
import { useLoaderStore } from '@/store/useLoaderStore'

/**
 * GlobalLoader - Place this at the root of your app to show loading states globally
 *
 * This component listens to the useLoaderStore and displays the loader
 * whenever isLoading is true.
 *
 * @example
 * // In App.tsx
 * import { GlobalLoader } from '@/components/ui/GlobalLoader'
 *
 * function App() {
 *   return (
 *     <>
 *       <GlobalLoader />
 *       {/* rest of your app *\/}
 *     </>
 *   )
 * }
 */
export const GlobalLoader = () => {
  const { isLoading, loadingText, animationSrc } = useLoaderStore()

  if (!isLoading) return null

  // Default animation URL - custom PawSome loader animation
  const defaultAnimationSrc =
    animationSrc || 'https://lottie.host/c13861b9-0350-4c9f-a37e-99d4b986369d/VkPhxnZqXt.lottie'

  return (
    <DotLottieLoader
      src={defaultAnimationSrc}
      size="large"
      text={loadingText}
      showOverlay={true}
      overlayOpacity={0.85}
      position="fixed"
      speed={1.2}
    />
  )
}
