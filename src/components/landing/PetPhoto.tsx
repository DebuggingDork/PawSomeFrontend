import { useState } from 'react'
import { PawPrint } from 'lucide-react'

interface PetPhotoProps {
  src: string | null | undefined
  alt: string
  className?: string
}

/**
 * A pet photo that cannot leave a broken-image icon on the marketing page.
 *
 * The landing sections decide what to show by testing `primary_photo_url` for
 * truthiness, but a row having a URL is not the same as the object still being
 * in the bucket. Rows outlive their files — a re-upload that reuses an object
 * key, a manual cleanup — and nothing in a filter can tell the difference
 * without fetching. When one of those URLs 404s the browser paints its own
 * broken-image glyph and the alt text across an empty box, on the first screen
 * a stranger ever sees.
 *
 * So the failure is caught where it actually surfaces. `failedSrc` rather than
 * a boolean for the same reason PetAvatar uses one: a blip on one URL must not
 * suppress the next good one, or a pet whose photo is replaced stays broken.
 */
export function PetPhoto({ src, alt, className = '' }: PetPhotoProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const failed = failedSrc !== null && failedSrc === src

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt || undefined}
        className={`flex items-center justify-center bg-neutral-900 ${className}`}
      >
        <PawPrint className="h-10 w-10 text-neutral-700" aria-hidden="true" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailedSrc(src)}
      className={className}
    />
  )
}
