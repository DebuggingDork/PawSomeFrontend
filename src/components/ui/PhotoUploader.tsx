import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, AlertTriangle, Loader2 } from 'lucide-react'
import { ApiError } from '@/lib/api/client'
import { contentTypeOf, uploadToPresignedUrl } from '@/lib/api/upload'
import type { PresignResponse } from '@/lib/api/types'

interface PhotoUploaderProps {
  /** Requests a presigned upload URL for the given content type. */
  presign: (contentType: 'image/jpeg' | 'image/png' | 'image/webp') => Promise<PresignResponse>
  /** Tells the backend the upload finished, so it can validate + record it. */
  confirm: (objectKey: string) => Promise<void>
  label?: string
  className?: string
}

type Status = 'idle' | 'uploading' | 'unavailable' | 'error'

/**
 * Presign -> PUT-to-R2 -> confirm flow shared by pet photos and the profile photo.
 * R2 isn't provisioned in every environment, so a 503 gets its own calm, expected-looking state
 * instead of the generic error banner.
 */
export function PhotoUploader({ presign, confirm, label = 'Add photo', className = '' }: PhotoUploaderProps) {
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleFile = async (file: File) => {
    const contentType = contentTypeOf(file)
    if (!contentType) {
      setStatus('error')
      setMessage('Please choose a JPEG, PNG, or WebP image.')
      return
    }

    setStatus('uploading')
    setMessage(null)
    try {
      const presigned = await presign(contentType)
      await uploadToPresignedUrl(presigned.upload_url, file, contentType)
      await confirm(presigned.object_key)
      setStatus('idle')
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

  return (
    <div className={className}>
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
      <motion.button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={status === 'uploading'}
        whileHover={{ scale: status === 'uploading' ? 1 : 1.02 }}
        whileTap={{ scale: status === 'uploading' ? 1 : 0.98 }}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-700 bg-neutral-900/60 px-4 py-6 text-sm font-medium text-neutral-300 transition-colors hover:border-[#ff6b35] hover:text-white disabled:cursor-wait"
      >
        {status === 'uploading' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading…
          </>
        ) : (
          <>
            <Camera className="h-4 w-4" />
            {label}
          </>
        )}
      </motion.button>

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
    </div>
  )
}
