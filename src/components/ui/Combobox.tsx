import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ComboboxProps {
  value?: string
  onChange: (value: string | undefined) => void
  options: string[]
  placeholder?: string
  /** Shown when the query matches nothing. */
  emptyLabel?: string
  className?: string
  disabled?: boolean
}

/** Splits a label around the matched query so the hit can be picked out. */
function splitMatch(label: string, query: string) {
  if (!query) return [label, '', ''] as const
  const index = label.toLowerCase().indexOf(query.toLowerCase())
  if (index < 0) return [label, '', ''] as const
  return [label.slice(0, index), label.slice(index, index + query.length), label.slice(index + query.length)] as const
}

/**
 * Replaces the native `<input list>` + `<datalist>` this app used for breed
 * filters.
 *
 * A datalist popup is drawn by the browser, not the page. It takes no styling,
 * honours no max-height, and Chrome positions it against the viewport rather
 * than the field, so a list of thirty breeds rendered as a full-height column
 * that ran up over the navbar and off the top of the screen.
 *
 * The panel is portaled to the body and positioned fixed rather than absolute,
 * because one of the three places this is used sits inside an
 * `overflow-hidden` animated container that would otherwise clip it.
 */
export function Combobox({
  value,
  onChange,
  options,
  placeholder = 'Search...',
  emptyLabel = 'No matches',
  className,
  disabled,
}: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  // Pointer hover should not steal the highlight from the arrow keys while the
  // list is scrolling underneath a stationary cursor.
  const pointerMoved = useRef(false)

  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const reduceMotion = useReducedMotion()

  const [anchor, setAnchor] = useState<{
    left: number
    width: number
    top?: number
    bottom?: number
    maxHeight: number
    fromTop: boolean
  } | null>(null)

  const filtered = query
    ? options.filter((option) => option.toLowerCase().includes(query.toLowerCase()))
    : options

  const measure = useCallback(() => {
    const el = wrapRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const GAP = 8
    const EDGE = 12
    const spaceBelow = window.innerHeight - rect.bottom - GAP - EDGE
    const spaceAbove = rect.top - GAP - EDGE
    // Only flip up when below is genuinely cramped and above is roomier, so the
    // panel does not jump sides on a small scroll.
    const fromTop = spaceBelow < 200 && spaceAbove > spaceBelow

    setAnchor({
      left: rect.left,
      width: rect.width,
      maxHeight: Math.max(140, Math.min(320, fromTop ? spaceAbove : spaceBelow)),
      fromTop,
      ...(fromTop
        ? { bottom: window.innerHeight - rect.top + GAP }
        : { top: rect.bottom + GAP }),
    })
  }, [])

  useLayoutEffect(() => {
    if (!open) return
    measure()
  }, [open, measure, filtered.length])

  useEffect(() => {
    if (!open) return
    const onScrollOrResize = () => measure()
    // Capture phase so scrolling any ancestor keeps the panel attached.
    window.addEventListener('scroll', onScrollOrResize, true)
    window.addEventListener('resize', onScrollOrResize)
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true)
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [open, measure])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (wrapRef.current?.contains(target) || panelRef.current?.contains(target)) return
      setOpen(false)
      setQuery('')
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  // Keep the highlighted row in view without dragging the whole page around.
  useEffect(() => {
    if (!open) return
    const node = panelRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
    node?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open])

  const commit = (option: string) => {
    onChange(option)
    setQuery('')
    setOpen(false)
    inputRef.current?.focus()
  }

  const clear = () => {
    onChange(undefined)
    setQuery('')
    setOpen(false)
    inputRef.current?.focus()
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      pointerMoved.current = false
      if (!open) {
        setOpen(true)
        setActiveIndex(0)
        return
      }
      const delta = event.key === 'ArrowDown' ? 1 : -1
      setActiveIndex((index) => {
        const next = index + delta
        if (next < 0) return filtered.length - 1
        if (next >= filtered.length) return 0
        return next
      })
      return
    }

    if (event.key === 'Home' && open) {
      event.preventDefault()
      setActiveIndex(0)
    } else if (event.key === 'End' && open) {
      event.preventDefault()
      setActiveIndex(filtered.length - 1)
    } else if (event.key === 'Enter') {
      if (open && filtered[activeIndex]) {
        event.preventDefault()
        commit(filtered[activeIndex])
      }
    } else if (event.key === 'Escape') {
      if (open) {
        event.preventDefault()
        setOpen(false)
        setQuery('')
      }
    } else if (event.key === 'Tab') {
      setOpen(false)
      setQuery('')
    }
  }

  const displayed = open ? query : (value ?? '')

  return (
    <>
      <div ref={wrapRef} className={cn('relative', className)}>
        <Search
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-150',
            open ? 'text-brand' : 'text-neutral-400',
          )}
        />

        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && filtered[activeIndex] ? `${listId}-${activeIndex}` : undefined}
          autoComplete="off"
          disabled={disabled}
          placeholder={value && !open ? value : placeholder}
          value={displayed}
          onChange={(event) => {
            setQuery(event.target.value)
            setActiveIndex(0)
            if (!open) setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className={cn(
            'w-full rounded-lg border bg-neutral-800 py-2 pl-10 pr-16 text-sm text-white',
            'placeholder-neutral-500 transition-colors duration-150 focus:outline-none',
            value && !open ? 'placeholder-white' : '',
            open ? 'border-brand' : 'border-neutral-700 hover:border-neutral-600',
            disabled && 'cursor-not-allowed opacity-50',
          )}
        />

        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
          {value && (
            <button
              type="button"
              onClick={clear}
              aria-label="Clear breed filter"
              className="rounded-md p-1 text-neutral-400 transition-[color,transform] duration-150 ease-out hover:text-white active:scale-90 motion-reduce:transition-none"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={() => {
              setOpen((isOpen) => !isOpen)
              inputRef.current?.focus()
            }}
            className="rounded-md p-1 text-neutral-400 transition-colors duration-150 hover:text-neutral-300"
          >
            <ChevronDown
              className="h-4 w-4 transition-transform duration-200 ease-out motion-reduce:transition-none"
              style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>
        </div>
      </div>

      {createPortal(
        <AnimatePresence>
          {open && anchor && (
            <motion.div
              ref={panelRef}
              id={listId}
              role="listbox"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: anchor.fromTop ? 4 : -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: anchor.fromTop ? 2 : -2, scale: 0.99 }}
              transition={{
                duration: reduceMotion ? 0.12 : 0.16,
                ease: [0.23, 1, 0.32, 1],
              }}
              style={{
                position: 'fixed',
                left: anchor.left,
                width: anchor.width,
                top: anchor.top,
                bottom: anchor.bottom,
                maxHeight: anchor.maxHeight,
                // Anchored to the field, so it grows out of the field rather
                // than out of its own middle.
                transformOrigin: anchor.fromTop ? 'bottom center' : 'top center',
              }}
              className={cn(
                'z-[200] overflow-y-auto overscroll-contain rounded-xl border border-neutral-700/80 bg-[#141414]',
                'shadow-2xl shadow-black/60 ring-1 ring-black/40',
                '[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full',
                '[&::-webkit-scrollbar-thumb]:bg-neutral-700 [&::-webkit-scrollbar-track]:bg-transparent',
              )}
            >
              {filtered.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-neutral-400">
                  {emptyLabel}
                  {query ? <span className="text-neutral-400"> for "{query}"</span> : null}
                </p>
              ) : (
                <ul className="p-1.5">
                  {filtered.map((option, index) => {
                    const [before, hit, after] = splitMatch(option, query)
                    const selected = option === value
                    const active = index === activeIndex

                    return (
                      <li key={option}>
                        <button
                          type="button"
                          id={`${listId}-${index}`}
                          data-index={index}
                          role="option"
                          aria-selected={selected}
                          onClick={() => commit(option)}
                          onPointerMove={() => {
                            pointerMoved.current = true
                            setActiveIndex(index)
                          }}
                          className={cn(
                            'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm',
                            'transition-colors duration-100',
                            active ? 'bg-white/[0.06] text-white' : 'text-neutral-300',
                            selected && 'bg-brand/12 text-white',
                          )}
                        >
                          <span className="truncate">
                            {before}
                            {hit && <span className="font-semibold text-brand">{hit}</span>}
                            {after}
                          </span>
                          {selected && <Check className="h-4 w-4 shrink-0 text-brand" />}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  )
}
