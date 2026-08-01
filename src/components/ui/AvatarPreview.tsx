import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface AvatarPreviewProps {
  open: boolean
  photoUrl: string
  name: string
  onClose: () => void
}

/**
 * Instagram-style avatar preview: the little circle, big.
 *
 * Tapping anywhere dismisses it — the whole overlay is one close target, the
 * same gesture that opened it, so there is nothing to find or aim for. Escape
 * works for keyboards. Rendered through a portal so no ancestor's overflow or
 * stacking context can clip a full-screen layer.
 */
export function AvatarPreview({ open, photoUrl, name, onClose }: AvatarPreviewProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    // The page behind a full-screen overlay should not scroll under a wheel
    // or swipe meant for dismissing it.
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`${name}'s photo`}
          className="fixed inset-0 z-[100] flex cursor-zoom-out flex-col items-center justify-center gap-5 bg-black/85 px-6 backdrop-blur-sm"
        >
          <motion.img
            src={photoUrl}
            alt={name}
            initial={{ scale: 0.55, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.28, duration: 0.45 }}
            className="h-[min(75vw,20rem)] w-[min(75vw,20rem)] rounded-full object-cover shadow-2xl shadow-black/60 ring-4 ring-white/15"
          />
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.08 }}
            className="max-w-full truncate font-display text-lg font-semibold text-white"
          >
            {name}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
