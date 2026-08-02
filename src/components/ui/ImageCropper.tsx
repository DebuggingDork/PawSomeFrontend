import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { X, ZoomIn, ZoomOut, RotateCcw, Loader2 } from 'lucide-react'

/**
 * Instagram-style crop step, shown between picking a file and uploading it.
 *
 * Cards render photos with object-cover at a fixed aspect ratio, so a portrait
 * phone photo dropped into a 4:5 card silently lost its top and bottom, and a
 * landscape one lost its sides. The subject was cropped by the CSS box rather
 * than by the person who took the picture, which for a pet's primary photo
 * usually meant a headless dog. This hands that decision back: drag to choose
 * the part that matters, zoom in if the framing is loose, and what you see in
 * the frame is exactly what gets uploaded.
 *
 * Written against canvas directly rather than pulling in a crop library: the
 * whole job is one drawImage call plus offset clamping, and the bundle is
 * already flagged as oversized.
 */

/** The Discover card renders 24rem x 30rem, so pet photos are framed to match.
 * Kept here so every upload path crops to the same shape the card will show. */
export const PET_CARD_ASPECT = 4 / 5
export const AVATAR_ASPECT = 1

const MAX_ZOOM = 4
const ZOOM_STEP = 0.25
/** Long edge of the exported image. Beyond this is wasted bytes for a card that
 * renders around 400px wide, even on a 3x display. */
const MAX_OUTPUT_EDGE = 1080
const JPEG_QUALITY = 0.9

interface Props {
  file: File
  /** width / height of the crop frame. 1 for avatars, 0.8 (4:5) for pet cards. */
  aspect: number
  /** Circular mask. Purely presentational: the export is always rectangular,
   * because that is what the img elements downstream actually render. */
  shape?: 'rect' | 'circle'
  title?: string
  hint?: string
  onCancel: () => void
  onCropped: (file: File) => void
}

interface Size {
  w: number
  h: number
}

interface Point {
  x: number
  y: number
}

/** Keeps the image covering the frame: it can never be panned far enough to
 * expose an empty edge. */
function clampOffset(next: Point, limits: Point): Point {
  return {
    x: Math.min(limits.x, Math.max(-limits.x, next.x)),
    y: Math.min(limits.y, Math.max(-limits.y, next.y)),
  }
}

export function ImageCropper({
  file,
  aspect,
  shape = 'rect',
  title = 'Position your photo',
  hint,
  onCancel,
  onCropped,
}: Props) {
  const shouldReduceMotion = useReducedMotion()

  const frameRef = useRef<HTMLDivElement | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; originX: number; originY: number } | null>(
    null,
  )
  /** Every finger currently on the frame, so two of them can mean "pinch". */
  const pointersRef = useRef(new Map<number, Point>())
  /** Set while two fingers are down: the span and zoom level they started at. */
  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null)

  const [url, setUrl] = useState<string | null>(null)
  const [natural, setNatural] = useState<Size | null>(null)
  const [frame, setFrame] = useState<Size | null>(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [exporting, setExporting] = useState(false)
  const [failed, setFailed] = useState(false)

  // Read as a data URL rather than an object URL.
  //
  // The object-URL version of this hoarded the URL in a useState initialiser and
  // revoked it in an effect cleanup. Under StrictMode, which mounts, unmounts and
  // remounts every component, the cleanup fired on the fake unmount and revoked a
  // URL that useState then preserved across the remount: the <img> pointed at a
  // dead blob, onLoad never fired, and the cropper span forever.
  //
  // FileReader has no such lifecycle to get wrong. Creation and teardown are
  // paired inside one effect, so a StrictMode remount simply reads again.
  useEffect(() => {
    const reader = new FileReader()
    reader.onload = () => setUrl(typeof reader.result === 'string' ? reader.result : null)
    reader.onerror = () => setFailed(true)
    reader.readAsDataURL(file)
    return () => reader.abort()
  }, [file])

  // The frame is responsive, so its pixel size has to be measured rather than
  // assumed: every offset bound and the export rect are expressed in frame px.
  useLayoutEffect(() => {
    const el = frameRef.current
    if (!el) return
    const measure = () => setFrame({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [url])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    // The page behind must not scroll while this is open; Lenis owns the wheel
    // otherwise and would drag the page under the modal.
    //
    // The lock goes on <html>, not <body>: the document scroller is the root
    // element (see index.css), so locking body left the page free to scroll
    // behind the sheet on touch — you would drag to reposition the photo, miss
    // the frame by a few pixels, and send the form scrolling instead.
    const root = document.documentElement
    const previousRootOverflow = root.style.overflow
    const previousBodyOverflow = document.body.style.overflow
    root.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      root.style.overflow = previousRootOverflow
      document.body.style.overflow = previousBodyOverflow
    }
  }, [onCancel])

  // Scale at which the image exactly covers the frame. Everything else is
  // expressed as a multiple of it, so zoom=1 always means "no empty corners".
  const baseScale = natural && frame ? Math.max(frame.w / natural.w, frame.h / natural.h) : 1
  const scale = baseScale * zoom
  const displayed: Size | null = natural ? { w: natural.w * scale, h: natural.h * scale } : null

  const bounds = displayed && frame
    ? { x: Math.max(0, (displayed.w - frame.w) / 2), y: Math.max(0, (displayed.h - frame.h) / 2) }
    : { x: 0, y: 0 }

  // The offset actually used, clamped as a derivation rather than corrected by an
  // effect after the fact. Zooming out shrinks the room to pan, and re-clamping in
  // an effect would paint one frame with the image parked off its own edge before
  // snapping back.
  const view = clampOffset(offset, bounds)

  // Anchors a pan to wherever the image is sitting right now. `view` is this
  // render's value, which is the committed one by the time any pointer event
  // runs — so lifting one finger of a pinch resumes panning from the position
  // the pinch left the image in, not the one it started from.
  const beginDrag = (pointerId: number, x: number, y: number) => {
    dragRef.current = { pointerId, startX: x, startY: y, originX: view.x, originY: view.y }
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (exporting) return
    e.currentTarget.setPointerCapture(e.pointerId)
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (pointersRef.current.size >= 2) {
      // A second finger means this is a pinch, not a drag. Zooming with the
      // slider is fine on a desktop; on a phone pinch is simply what a hand
      // does to an image, and its absence read as the cropper being stuck.
      dragRef.current = null
      const [a, b] = [...pointersRef.current.values()]
      pinchRef.current = { distance: Math.hypot(a.x - b.x, a.y - b.y) || 1, zoom }
      return
    }

    beginDrag(e.pointerId, e.clientX, e.clientY)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const pointers = pointersRef.current
    if (!pointers.has(e.pointerId)) return
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

    const pinch = pinchRef.current
    if (pinch && pointers.size >= 2) {
      const [a, b] = [...pointers.values()]
      const distance = Math.hypot(a.x - b.x, a.y - b.y)
      setZoom(Math.min(MAX_ZOOM, Math.max(1, pinch.zoom * (distance / pinch.distance))))
      return
    }

    const drag = dragRef.current
    if (!drag || drag.pointerId !== e.pointerId) return
    setOffset(
      clampOffset(
        { x: drag.originX + (e.clientX - drag.startX), y: drag.originY + (e.clientY - drag.startY) },
        bounds,
      ),
    )
  }

  const endDrag = (e: React.PointerEvent) => {
    const pointers = pointersRef.current
    pointers.delete(e.pointerId)
    if (dragRef.current?.pointerId === e.pointerId) dragRef.current = null
    if (pointers.size < 2) pinchRef.current = null

    // One finger left after a pinch: hand panning back to it rather than
    // waiting for a fresh touch, which is what makes zoom-then-reposition feel
    // like one gesture instead of three.
    if (pointers.size === 1) {
      const [[id, point]] = [...pointers.entries()]
      beginDrag(id, point.x, point.y)
    }
  }

  const onWheel = (e: React.WheelEvent) => {
    if (exporting) return
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(1, z - e.deltaY * 0.0015)))
  }

  const reset = () => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
  }

  const apply = () => {
    const img = imgRef.current
    if (!img || !natural || !frame) return
    setExporting(true)
    setFailed(false)

    // Frame rect expressed back in the image's own pixels. The frame's top-left
    // sits at half the overhang, less however far the user has dragged.
    const sw = Math.min(natural.w, frame.w / scale)
    const sh = Math.min(natural.h, frame.h / scale)
    const sx = Math.min(Math.max(0, (displayed!.w - frame.w) / 2 - view.x) / scale, natural.w - sw)
    const sy = Math.min(Math.max(0, (displayed!.h - frame.h) / 2 - view.y) / scale, natural.h - sh)

    // Never upscale: enlarging a heavily zoomed crop invents detail and costs bytes.
    const outW = Math.max(1, Math.round(Math.min(sw, aspect >= 1 ? MAX_OUTPUT_EDGE : MAX_OUTPUT_EDGE * aspect)))
    const outH = Math.max(1, Math.round(outW / aspect))

    const canvas = document.createElement('canvas')
    canvas.width = outW
    canvas.height = outH
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      setExporting(false)
      setFailed(true)
      return
    }
    ctx.imageSmoothingQuality = 'high'
    // JPEG has no alpha; without this, transparent PNG regions export as black.
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, outW, outH)
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH)

    canvas.toBlob(
      (blob) => {
        setExporting(false)
        if (!blob) {
          setFailed(true)
          return
        }
        const name = file.name.replace(/\.[^.]+$/, '') || 'photo'
        onCropped(new File([blob], `${name}.jpg`, { type: 'image/jpeg' }))
      },
      'image/jpeg',
      JPEG_QUALITY,
    )
  }

  const ready = !!natural && !!frame

  return (
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        // Bottom sheet on a phone, centred dialog from `sm` up. A sheet anchors
        // the controls beside the thumb that has to press them, and it is the
        // shape a phone user already reads as "this is a step, not a page".
        className="lenis-prevent-scroll fixed inset-0 z-50 flex items-end justify-center overscroll-contain bg-black/80 backdrop-blur-sm sm:items-center sm:p-4"
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) onCancel()
        }}
      >
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          // `max-h-[100dvh]` with a scrollable middle is the safety net: the
          // frame is already sized from the viewport height below, but a very
          // short screen (a landscape phone) would otherwise push the Cancel
          // and Use photo buttons off the bottom with no way to reach them.
          className="flex max-h-[100dvh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-neutral-950 shadow-2xl shadow-black/60 sm:rounded-3xl"
        >
          <div className="flex flex-shrink-0 items-center justify-between border-b border-neutral-900 px-5 py-3.5">
            <h2 className="font-display text-base font-bold text-white">{title}</h2>
            <button
              type="button"
              onClick={onCancel}
              aria-label="Cancel"
              className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="thin-scrollbar lenis-prevent-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-5">
            {/* Checkerboard-free dark bed; the area outside the frame is dimmed
                rather than hidden, so you can see what you are cutting off. */}
            <div className="flex justify-center">
              <div
                ref={frameRef}
                // Width, not height, is the definite dimension — `aspect-ratio`
                // then derives the height, which keeps the frame's shape exact
                // at every size. The three candidates are: the space actually
                // available, whatever fits in 46% of the viewport height, and
                // the desktop maximum. Sizing off the viewport is what stops a
                // 4:5 frame on a short phone pushing the buttons off-screen.
                style={{
                  aspectRatio: String(aspect),
                  width: `min(100%, calc(46dvh * ${aspect}), ${Math.round(380 * aspect)}px)`,
                }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onWheel={onWheel}
                className={`relative touch-none select-none overflow-hidden bg-neutral-900 ${
                  shape === 'circle' ? 'rounded-full' : 'rounded-2xl'
                } ${exporting ? 'cursor-wait' : 'cursor-grab active:cursor-grabbing'}`}
              >
                {url && (
                  <img
                    ref={imgRef}
                    src={url}
                    alt=""
                    draggable={false}
                    onLoad={(e) =>
                      setNatural({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })
                    }
                    // Without this a file the browser can't decode leaves the
                    // spinner turning with nothing to say.
                    onError={() => setFailed(true)}
                    style={
                      displayed
                        ? {
                            width: displayed.w,
                            height: displayed.h,
                            transform: `translate(calc(-50% + ${view.x}px), calc(-50% + ${view.y}px))`,
                          }
                        : { opacity: 0 }
                    }
                    className="absolute left-1/2 top-1/2 max-w-none"
                  />
                )}

                {/* Rule-of-thirds guides, the standard cue that this is a framing
                    decision and not just a preview. */}
                <div aria-hidden className="pointer-events-none absolute inset-0">
                  <div className="absolute inset-y-0 left-1/3 w-px bg-white/20" />
                  <div className="absolute inset-y-0 left-2/3 w-px bg-white/20" />
                  <div className="absolute inset-x-0 top-1/3 h-px bg-white/20" />
                  <div className="absolute inset-x-0 top-2/3 h-px bg-white/20" />
                  <div
                    className={`absolute inset-0 ring-1 ring-inset ring-white/30 ${
                      shape === 'circle' ? 'rounded-full' : 'rounded-2xl'
                    }`}
                  />
                </div>

                {!ready && !failed && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                  </div>
                )}
                {failed && !ready && (
                  <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                    <p className="text-sm text-neutral-400">Couldn't read that image.</p>
                  </div>
                )}
              </div>
            </div>

            <p className="mt-3 text-center text-xs text-neutral-400">
              {hint ?? 'Drag to reposition. Pinch, scroll or use the slider to zoom.'}
            </p>
          </div>

          {/* Zoom */}
          <div className="flex flex-shrink-0 items-center gap-3 px-5 py-4">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(1, z - ZOOM_STEP))}
              disabled={zoom <= 1}
              aria-label="Zoom out"
              className="flex h-10 w-8 flex-shrink-0 items-center justify-center text-neutral-400 transition-colors hover:text-white disabled:opacity-40"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <input
              type="range"
              min={1}
              max={MAX_ZOOM}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              aria-label="Zoom"
              className="range-touch lenis-prevent-scroll min-w-0 flex-1 accent-brand"
            />
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))}
              disabled={zoom >= MAX_ZOOM}
              aria-label="Zoom in"
              className="flex h-10 w-8 flex-shrink-0 items-center justify-center text-neutral-400 transition-colors hover:text-white disabled:opacity-40"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={reset}
              disabled={zoom === 1 && offset.x === 0 && offset.y === 0}
              aria-label="Reset framing"
              title="Reset framing"
              className="flex h-10 w-8 flex-shrink-0 items-center justify-center text-neutral-400 transition-colors hover:text-white disabled:opacity-40"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {failed && (
            <p role="alert" className="flex-shrink-0 px-5 pb-2 text-sm text-red-400">
              Couldn't process that image. Try a different one.
            </p>
          )}

          <div className="flex flex-shrink-0 gap-3 border-t border-neutral-900 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 touch-manipulation rounded-xl border border-neutral-800 py-3.5 text-sm font-medium text-neutral-300 transition-colors hover:border-neutral-700 hover:text-white sm:py-2.5"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={apply}
              disabled={!ready || exporting}
              className="flex flex-1 touch-manipulation items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand to-pink-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition-shadow hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 sm:py-2.5"
            >
              {exporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Preparing
                </>
              ) : (
                'Use photo'
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
