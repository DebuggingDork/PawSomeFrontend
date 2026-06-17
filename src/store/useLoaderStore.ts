import { create } from 'zustand'

interface LoaderState {
  isLoading: boolean
  loadingText?: string
  animationSrc?: string
  startLoading: (text?: string, animationSrc?: string) => void
  stopLoading: () => void
}

/**
 * Global loader store for managing loading states across the app
 *
 * @example
 * // In any component
 * import { useLoaderStore } from '@/store/useLoaderStore'
 *
 * function MyComponent() {
 *   const { startLoading, stopLoading } = useLoaderStore()
 *
 *   const handleAction = async () => {
 *     startLoading('Processing...')
 *     await someAsyncOperation()
 *     stopLoading()
 *   }
 * }
 */
export const useLoaderStore = create<LoaderState>((set) => ({
  isLoading: false,
  loadingText: undefined,
  animationSrc: undefined,
  startLoading: (text, animationSrc) =>
    set({ isLoading: true, loadingText: text, animationSrc }),
  stopLoading: () => set({ isLoading: false, loadingText: undefined, animationSrc: undefined }),
}))
