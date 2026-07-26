import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, AlertTriangle, Loader2, Check, RotateCcw, ImagePlus } from 'lucide-react'
import { ApiError } from '@/lib/api/client'
import { ImageCropper } from './ImageCropper'
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
   * The photo already saved on the server, if any. Without this the uploader can
   * only ever preview a file picked in this session, so a screen with a photo
   * already on file (the profile photo) kept showing an empty "upload" dropzone
   * as though nothing had ever been set. A freshly picked file still takes
   * precedence, so the preview stays instant.
   */
  currentPhotoUrl?: string | null
  /** Alt text for the preview. Defaults to decorative, since most callers label
   * the surrounding section themselves. */
  photoAlt?: string
  /**
   * Fires with a local object URL the instant a file is picked, before the upload
   * starts. Onboarding uses it to drop the photo onto its live card preview
   * immediately; waiting for the round trip would leave the card blank through the
   * one moment the user is most curious about how it looks.
   */
  onLocalPreview?: (objectUrl: string) => void
  /**
   * Aspect ratio (width / height) the photo will actually be displayed at. When
   * set, picking a file opens the cropper first so the user chooses the framing
   * instead of letting object-cover decide it for them. Omit to upload as-is.
   */
  cropAspect?: number
  /** Circular crop mask, for avatars. Presentational only. */
  cropShape?: 'rect' | 'circle'
  cropTitle?: string
  cropHint?: string
  /**
   * 'card' renders a large photo preview that replaces the dropzone once a file is chosen
   * (used where there's no photo shown elsewhere, e.g. onboarding). 'compact' keeps the
   * slim inline button with a small thumbnail beside it, for screens that already show
   * the photo elsewhere (profile avatar). 'tile' is a square dashed cell sized to sit as
   * the last item of a photo grid, for adding to a gallery.
   */
  variant?: 'card' | 'compact' | 'tile'
  /**
   * Clears the preview once the upload is confirmed, returning the control to its
   * empty "add" state.
   *
   * Single-slot uploaders (the profile avatar) should keep showing what was just
   * set. Gallery uploaders must not: holding on to the last file made the control
   * read "Change photo" over a thumbnail, which describes replacing the photo you
   * just added rather than adding another, and left no way to add a third without
   * reloading the page. Defaults on for 'tile', which only ever appends.
   */
  resetAfterUpload?: boolean
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
  currentPhotoUrl = null,
  photoAlt = '',
  onLocalPreview,
  cropAspect,
  cropShape = 'rect',
  cropTitle,
  cropHint,
  resetAfterUpload = variant === 'tile',
}: PhotoUploaderProps) {
  // Held between "file picked" and "framing confirmed". Nothing is uploaded
  // until the cropper hands back the framed version.
  const [pendingFile, setPendingFile] = useState<File | null>(null)
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

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return objectUrl
    })
    onLocalPreview?.(objectUrl)
    setJustSaved(false)
    setStatus('uploading')
    setMessage(null)

    try {
      const presigned = await presign(contentType)
      await uploadToPresignedUrl(presigned.upload_url, file, contentType)
      await confirm(presigned.object_key)
      setStatus('idle')
      setJustSaved(true)
      if (resetAfterUpload) {
        // Back to an empty "add" affordance, ready for the next one. The saved
        // tick still flashes below so the upload doesn't just vanish silently.
        setPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev)
          return null
        })
      }
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

  // A file picked in this session wins: its object URL renders immediately,
  // without waiting for the upload or the refetch that follows it.
  const displayUrl = previewUrl ?? currentPhotoUrl
  const hasPreview = !!displayUrl
  const isCard = variant === 'card'

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept="image/jpeg,image/png,image/webp"
      className="hidden"
      onChange={(e) => {
        const file = e.target.files?.[0]
        if (!file) return
        // Reset immediately so re-picking the same file after cancelling still
        // fires a change event.
        e.target.value = ''
        if (cropAspect) setPendingFile(file)
        else handleFile(file)
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

      {pendingFile && cropAspect && (
        <ImageCropper
          // Remount per file: the cropper derives its object URL once on mount.
          key={`${pendingFile.name}-${pendingFile.size}-${pendingFile.lastModified}`}
          file={pendingFile}
          aspect={cropAspect}
          shape={cropShape}
          title={cropTitle}
          hint={cropHint}
          onCancel={() => setPendingFile(null)}
          onCropped={(cropped) => {
            setPendingFile(null)
            handleFile(cropped)
          }}
        />
      )}

      {variant === 'tile' ? (
        <motion.button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={status === 'uploading'}
          whileHover={status === 'uploading' ? undefined : { scale: 1.01 }}
          whileTap={status === 'uploading' ? undefined : { scale: 0.99 }}
          aria-label={label}
          className="group relative flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-700 bg-neutral-900/40 transition-colors hover:border-[#ff6b35] hover:bg-neutral-900/70 disabled:cursor-wait"
        >
          {status === 'uploading' ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
              <span className="text-xs font-medium text-neutral-400">Uploading…</span>
            </>
          ) : justSaved ? (
            <>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500">
                <Check className="h-5 w-5 text-white" strokeWidth={3} />
              </span>
              <span className="text-xs font-medium text-emerald-400">Added</span>
            </>
          ) : (
            <>
              <ImagePlus className="h-6 w-6 text-neutral-500 transition-colors group-hover:text-[#ff6b35]" />
              <span className="px-2 text-center text-xs font-medium text-neutral-300 group-hover:text-white">
                {label}
              </span>
            </>
          )}
        </motion.button>
      ) : isCard ? (
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
              <img src={displayUrl} alt={photoAlt} className="h-full w-full object-cover" />
            ) : (
              <>
                <Camera className="h-6 w-6 text-neutral-500 transition-colors group-hover:text-[#ff6b35]" />
                <span className="text-sm font-medium text-neutral-300 group-hover:text-white">{label}</span>
              </>
            )}

            {/* Always visible, not hover-only: on touch there is no hover, so a
                saved photo would otherwise read as a static image with no hint
                that tapping it swaps the picture. */}
            {hasPreview && status === 'idle' && (
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-gradient-to-t from-black/85 via-black/45 to-transparent pb-2.5 pt-7 text-xs font-semibold text-white transition-colors group-hover:from-black group-hover:via-black/60">
                <Camera className="h-3.5 w-3.5" />
                Change photo
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
              <img src={displayUrl} alt={photoAlt} className="h-full w-full object-cover" />
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
