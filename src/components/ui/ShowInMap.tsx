import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Map as MapIcon, Navigation, ExternalLink, ChevronDown } from 'lucide-react'
import { mapsViewUrl, mapsDirectionsUrl, osmEmbedUrl, describePoint, type MapPoint } from '@/lib/maps'

interface ShowInMapProps {
  point: MapPoint
  /** `inline` expands a preview in place; `link` is just the two deep links. */
  variant?: 'inline' | 'link'
  className?: string
}

const LINK =
  'inline-flex items-center gap-1.5 rounded-lg border border-neutral-800 px-2.5 py-1.5 text-xs font-medium text-neutral-400 transition-colors hover:border-brand/50 hover:text-white'

/**
 * "Show in map" for anywhere we hold a pinned location — playdates, events,
 * and the location picker's confirmation.
 *
 * The preview is an OpenStreetMap iframe (keyless, and it's the same data our
 * geocoder resolved against) while the buttons hand off to Google Maps, which
 * is where people actually navigate from. Rendering the preview only after the
 * toggle keeps a list of ten playdates from booting ten map frames.
 */
export function ShowInMap({ point, variant = 'inline', className = '' }: ShowInMapProps) {
  const [open, setOpen] = useState(false)
  const label = describePoint(point)

  const links = (
    <>
      <a href={mapsViewUrl(point)} target="_blank" rel="noopener noreferrer" className={LINK}>
        <ExternalLink className="h-3.5 w-3.5" />
        Google Maps
      </a>
      <a href={mapsDirectionsUrl(point)} target="_blank" rel="noopener noreferrer" className={LINK}>
        <Navigation className="h-3.5 w-3.5" />
        Directions
      </a>
    </>
  )

  if (variant === 'link') {
    return <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>{links}</div>
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={`${LINK} ${open ? 'border-brand/50 text-white' : ''}`}
        >
          <MapIcon className="h-3.5 w-3.5" />
          {open ? 'Hide map' : 'Show in map'}
          <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {links}
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div className="mt-2 overflow-hidden rounded-xl border border-neutral-800">
              <iframe
                title={`Map showing ${label}`}
                src={osmEmbedUrl(point)}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block h-44 w-full border-0"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-neutral-600">{label}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
