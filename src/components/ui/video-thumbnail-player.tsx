import * as React from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Play, X } from 'lucide-react'

interface VideoPlayerProps extends React.HTMLAttributes<HTMLDivElement> {
  thumbnailUrl: string
  videoUrl: string
  title: string
  description?: string
  aspectRatio?: '16/9' | '4/3' | '1/1'
}

// A direct media file (our R2-hosted recording) needs a real <video> element —
// an <iframe> is for embeds with their own player chrome (YouTube, Vimeo),
// and pointing one at a raw .mp4 either falls back to the browser's bare
// native player or, depending on the browser, nothing at all.
const DIRECT_VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov']
function isDirectVideoFile(url: string): boolean {
  const path = url.split('?')[0].toLowerCase()
  return DIRECT_VIDEO_EXTENSIONS.some((ext) => path.endsWith(ext))
}

const VideoPlayer = React.forwardRef<HTMLDivElement, VideoPlayerProps>(
  (
    { className, thumbnailUrl, videoUrl, title, description, aspectRatio = '16/9', ...props },
    ref,
  ) => {
    const [isModalOpen, setIsModalOpen] = React.useState(false)
    const videoRef = React.useRef<HTMLVideoElement>(null)

    React.useEffect(() => {
      const handleEsc = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setIsModalOpen(false)
        }
      }
      window.addEventListener('keydown', handleEsc)
      return () => {
        window.removeEventListener('keydown', handleEsc)
      }
    }, [])

    React.useEffect(() => {
      if (isModalOpen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = 'auto'
        // Stop playback (and any audio) the instant the modal closes rather
        // than leaving it running behind a torn-down iframe/video element.
        videoRef.current?.pause()
      }
    }, [isModalOpen])

    const closeModal = () => setIsModalOpen(false)

    return (
      <>
        <div
          ref={ref}
          className={cn(
            'group relative cursor-pointer overflow-hidden rounded-lg shadow-lg',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            className,
          )}
          style={{ aspectRatio }}
          onClick={() => setIsModalOpen(true)}
          onKeyDown={(e) => e.key === 'Enter' && setIsModalOpen(true)}
          role="button"
          tabIndex={0}
          aria-label={`Play video: ${title}`}
          {...props}
        >
          <img
            src={thumbnailUrl}
            alt={`Thumbnail for ${title}`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30">
              <Play className="h-8 w-8 fill-white text-white" />
            </div>
          </div>

          <div className="absolute bottom-0 left-0 p-6">
            <h3 className="text-2xl font-bold text-white">{title}</h3>
            {description && <p className="mt-1 text-sm text-white/80">{description}</p>}
          </div>
        </div>

        {createPortal(
          <AnimatePresence>
            {isModalOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
                aria-modal="true"
                role="dialog"
                onClick={closeModal}
              >
                <button
                  onClick={closeModal}
                  className="absolute right-4 top-4 z-50 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                  aria-label="Close video player"
                >
                  <X className="h-6 w-6" />
                </button>

                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className="aspect-video w-full max-w-4xl p-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isDirectVideoFile(videoUrl) ? (
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      title={title}
                      controls
                      autoPlay
                      className="h-full w-full rounded-lg bg-black"
                    >
                      Your browser does not support embedded video.
                    </video>
                  ) : (
                    <iframe
                      src={videoUrl}
                      title={title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full rounded-lg"
                    />
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
      </>
    )
  },
)
VideoPlayer.displayName = 'VideoPlayer'

export { VideoPlayer }
