import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Loader2 } from 'lucide-react'

/**
 * The shared vocabulary every onboarding step is built from. Kept here rather
 * than repeated per step so the six screens read as one continuous surface: same
 * field height, same focus treatment, same rhythm between label and control.
 *
 * Sizing is decided by the phone, not the desktop. Every control here clears
 * 44px on touch and only tightens up from `sm:` — the reverse of how the file
 * started, which was a desktop layout with mobile treated as a narrow version
 * of it.
 */

/** Label + optional hint above a control. `hint` carries the "why we ask", which is
 * what actually keeps people filling fields in. */
export function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string
  hint?: string
  htmlFor?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-neutral-200">
        {label}
        {hint && <span className="ml-2 font-normal text-neutral-400">{hint}</span>}
      </label>
      {children}
    </div>
  )
}

const INPUT_BASE =
  'w-full rounded-xl border border-neutral-800 bg-neutral-900/60 text-white placeholder:text-neutral-400 transition-colors focus:border-brand focus:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand/25'

/** `emphasis="lead"` is for the one field a step is really about. The scale jump is
 * the hierarchy: it tells you where to start typing without a "start here" label.
 * Not named `size` because that collides with the native input attribute, which
 * silently types every other prop as `never`. */
export function TextInput({
  emphasis = 'base',
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { emphasis?: 'lead' | 'base' }) {
  const scale = emphasis === 'lead' ? 'px-4 py-3.5 text-lg' : 'px-4 py-3 text-base sm:py-2.5 sm:text-sm'
  return <input {...props} className={`${INPUT_BASE} ${scale} ${className}`} />
}

export function TextArea({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${INPUT_BASE} resize-none px-4 py-3 text-base sm:text-sm ${className}`} />
}

/** Tappable suggestions. Faster than typing, and they double as examples of the
 * kind of answer that's useful, which a placeholder alone never manages. */
export function ChipGroup({
  options,
  value,
  onSelect,
  ariaLabel,
}: {
  options: readonly string[]
  value: string
  onSelect: (option: string) => void
  ariaLabel: string
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={ariaLabel}>
      {options.map((option) => {
        const selected = value.trim().toLowerCase() === option.toLowerCase()
        return (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            aria-pressed={selected}
            className={`touch-manipulation rounded-full border px-4 py-2.5 text-sm transition-colors sm:px-3.5 sm:py-1.5 ${
              selected
                ? 'border-brand bg-brand/15 font-medium text-white'
                : 'border-neutral-800 bg-neutral-900/60 text-neutral-300 hoverable:hover:border-neutral-700 hoverable:hover:text-white'
            }`}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}

/** Two-or-more mutually exclusive choices shown side by side. */
export function SegmentedChoice<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: readonly { value: T; label: string; glyph?: string }[]
  value: T
  onChange: (value: T) => void
  ariaLabel: string
}) {
  return (
    <div className="flex gap-2" role="group" aria-label={ariaLabel}>
      {options.map((option) => {
        const selected = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={selected}
            className={`flex flex-1 touch-manipulation items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors sm:py-2.5 ${
              selected
                ? 'border-brand bg-brand/12 text-white'
                : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hoverable:hover:border-neutral-700 hoverable:hover:text-neutral-200'
            }`}
          >
            {option.glyph && <span aria-hidden className="text-base">{option.glyph}</span>}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Docks a step's actions to the bottom of the screen on a phone.
 *
 * These forms are two to three screens tall on a 390px-wide device, so the
 * button that finishes the step spent most of its life below the fold — the
 * user filled in the last field and then had to go looking for the way out.
 * Sticky keeps it in reach the whole way down and costs nothing when the form
 * is short: it simply sits where it would have anyway.
 *
 * Full-bleed on purpose. A translucent bar that stops short of the screen edges
 * leaves two slivers of scrolling content beside it, which reads as a rendering
 * fault rather than a design. From `lg` up there is no fold to fall below and
 * the whole treatment switches off.
 */
export function StepActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 z-30 -mx-4 mt-2 space-y-2 border-t border-white/[0.06] bg-neutral-950/90 px-4 pb-[max(0.875rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
      {children}
    </div>
  )
}

export function PrimaryAction({
  children,
  pending = false,
  pendingLabel = 'Saving',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { pending?: boolean; pendingLabel?: string }) {
  const shouldReduceMotion = useReducedMotion()
  const disabled = props.disabled || pending
  return (
    <motion.button
      {...(props as React.ComponentProps<typeof motion.button>)}
      disabled={disabled}
      whileHover={disabled || shouldReduceMotion ? undefined : { scale: 1.01 }}
      whileTap={disabled || shouldReduceMotion ? undefined : { scale: 0.985 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="group flex w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand to-pink-500 py-4 font-semibold text-white shadow-lg shadow-brand/25 transition-shadow hoverable:hover:shadow-xl hoverable:hover:shadow-brand/35 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none sm:py-3.5"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {pendingLabel}
        </>
      ) : (
        <>
          {children}
          <ArrowRight className="h-4 w-4 transition-transform hoverable:group-hover:translate-x-0.5" />
        </>
      )}
    </motion.button>
  )
}

export function StepError({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="text-sm text-red-400">
      {children}
    </p>
  )
}
