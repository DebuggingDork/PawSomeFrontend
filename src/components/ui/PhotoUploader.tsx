import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, AlertTriangle, Loader2, Check, RotateCcw } from 'lucide-react'
import { ApiError } from '@/lib/api/client'
import { contentTypeOf, uploadToPresignedUrl } from '@/lib/api/upload'
import type { PresignResponse } from '@/lib/api/types'

interface PhotoUploaderProps {
  /** Requests a presigned upload URL for the given content type. */
  presign: (contentType: 'image/jpeg' | 'image/png' | 'image/webp') => Promise<PresignResponse>
  /** Tells the backend the upload finished, so it can validate + record it. */
  confirm: (objectKey: string) => Promise<void>
  /** Lets the user move on without uploading now. Omit to hide the option. */
  onSkip?: () => void
  label?: string
  className?: string
  /**
   * 'card' renders a large photo preview that replaces the dropzone once a file is chosen
   * (used where there's no photo shown elsewhere, e.g. onboarding). 'compact' keeps the
   * slim inline button with a small thumbnail beside it, for screens that already show
   * the photo elsewhere (profile avatar, photo gallery).
   */
  variant?: 'card' | 'compact'
}

type Status = 'idle' | 'uploading' | 'unavailable' | 'error'

/**
 * Presign -> PUT-to-R2 -> confirm flow shared by pet photos and the profile photo.
 * R2 isn't provisioned in every environment, so a 503 gets its own calm, expected-looking state
 * instead of the generic error banner. The preview is drawn from a local object URL so it shows
 * instantly, before the network round trip even starts.
 */
export function PhotoUploader({
  presign,
  confirm,
  onSkip,
  label = 'Add photo',
  className = '',
  variant = 'compact',
}: PhotoUploaderProps) {
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [justSaved, setJustSaved] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFile = async (file: File) => {
    const contentType = contentTypeOf(file)
    if (!contentType) {
      setStatus('error')
      setMessage('Please choose a JPEG, PNG, or WebP image.')
      return
    }

    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
    setJustSaved(false)
    setStatus('uploading')
    setMessage(null)

    try {
      const presigned = await presign(contentType)
      await uploadToPresignedUrl(presigned.upload_url, file, contentType)
      await confirm(presigned.object_key)
      setStatus('idle')
      setJustSaved(true)
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current)
      savedTimeoutRef.current = setTimeout(() => setJustSaved(false), 2200)
    } catch (err) {
      if (err instanceof ApiError && err.status === 503) {
        setStatus('unavailable')
        setMessage("Photo storage isn't set up yet — you can add this later from Profile.")
      } else {
        setStatus('error')
        setMessage(err instanceof ApiError && typeof err.detail === 'string' ? err.detail : 'Upload failed. Try again.')
      }
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const hasPreview = !!previewUrl
  const isCard = variant === 'card'

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept="image/jpeg,image/png,image/webp"
      className="hidden"
      onChange={(e) => {
        const file = e.target.files?.[0]
        if (file) handleFile(file)
      }}
    />
  )

  const savedBadge = (size: 'sm' | 'lg') => (
    <AnimatePresence>
      {justSaved && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', bounce: 0.55, duration: 0.4 }}
          className={
            size === 'lg'
              ? 'absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40'
              : 'absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-neutral-950'
          }
        >
          <Check className={size === 'lg' ? 'h-4 w-4 text-white' : 'h-2.5 w-2.5 text-white'} strokeWidth={3} />
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <div className={className}>
      {fileInput}

      {isCard ? (
        <motion.button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={status === 'uploading'}
          whileHover={{ scale: status === 'uploading' ? 1 : 1.01 }}
          whileTap={{ scale: status === 'uploading' ? 1 : 0.99 }}
          className={`group relative block w-full overflow-hidden rounded-2xl border transition-colors disabled:cursor-wait ${
            hasPreview
              ? status === 'error'
                ? 'border-red-500/40'
                : 'border-white/10'
              : 'border-dashed border-neutral-700 bg-neutral-900/60 hover:border-[#ff6b35]'
          }`}
        >
          <div
            className={`relative aspect-square w-full ${
              hasPreview ? '' : 'flex flex-col items-center justify-center gap-2 py-10'
            }`}
          >
            {hasPreview ? (
              <img src={previewUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <>
                <Camera className="h-6 w-6 text-neutral-500 transition-colors group-hover:text-[#ff6b35]" />
                <span className="text-sm font-medium text-neutral-300 group-hover:text-white">{label}</span>
              </>
            )}

            {hasPreview && status === 'idle' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/50 group-hover:opacity-100">
                <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                  <Camera className="h-3.5 w-3.5" /> Change photo
                </span>
              </div>
            )}

            <AnimatePresence>
              {status === 'uploading' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 backdrop-blur-[2px]"
                >
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                  <span className="text-xs font-medium text-white">Uploading…</span>
                </motion.div>
              )}
            </AnimatePresence>

            {status === 'error' && hasPreview && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/60">
                <RotateCcw className="h-5 w-5 text-white" />
                <span className="text-xs font-medium text-white">Tap to try again</span>
              </div>
            )}

            {status === 'unavailable' && hasPreview && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/50">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <span className="text-xs font-medium text-white">Not saved yet</span>
              </div>
            )}

            {savedBadge('lg')}
          </div>
        </motion.button>
      ) : (
        <div className="flex items-center gap-3">
          {hasPreview && (
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-white/10">
              <img src={previewUrl} alt="" className="h-full w-full object-cover" />
              {status === 'uploading' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                </div>
              )}
              {savedBadge('sm')}
            </div>
          )}
          <motion.button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={status === 'uploading'}
            whileHover={{ scale: status === 'uploading' ? 1 : 1.02 }}
            whileTap={{ scale: status === 'uploading' ? 1 : 0.98 }}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-700 bg-neutral-900/60 px-4 py-6 text-sm font-medium text-neutral-300 transition-colors hover:border-[#ff6b35] hover:text-white disabled:cursor-wait"
          >
            {status === 'uploading' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <Camera className="h-4 w-4" />
                {hasPreview ? 'Change photo' : label}
              </>
            )}
          </motion.button>
        </div>
      )}

      {message && (
        <p
          className={`mt-2 flex items-start gap-1.5 text-xs ${
            status === 'unavailable' ? 'text-amber-400' : 'text-red-400'
          }`}
        >
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          {message}
        </p>
      )}

      {onSkip && (
        <button
          type="button"
          onClick={onSkip}
          disabled={status === 'uploading'}
          className="mt-3 w-full text-center text-xs font-medium text-neutral-500 underline-offset-2 transition-colors hover:text-neutral-300 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          I'll do this later
        </button>
      )}
    </div>
  )
}
