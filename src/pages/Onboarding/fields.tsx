import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Loader2 } from 'lucide-react'

/**
 * The shared vocabulary every onboarding step is built from. Kept here rather
 * than repeated per step so the six screens read as one continuous surface: same
 * field height, same focus treatment, same rhythm between label and control.
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
        {hint && <span className="ml-2 font-normal text-neutral-500">{hint}</span>}
      </label>
      {children}
    </div>
  )
}

const INPUT_BASE =
  'w-full rounded-xl border border-neutral-800 bg-neutral-900/60 text-white placeholder:text-neutral-500 transition-colors focus:border-[#ff6b35] focus:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/25'

/** `emphasis="lead"` is for the one field a step is really about. The scale jump is
 * the hierarchy: it tells you where to start typing without a "start here" label.
 * Not named `size` because that collides with the native input attribute, which
 * silently types every other prop as `never`. */
export function TextInput({
  emphasis = 'base',
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { emphasis?: 'lead' | 'base' }) {
  const scale = emphasis === 'lead' ? 'px-4 py-3.5 text-lg' : 'px-4 py-2.5 text-sm'
  return <input {...props} className={`${INPUT_BASE} ${scale} ${className}`} />
}

export function TextArea({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${INPUT_BASE} resize-none px-4 py-3 text-sm ${className}`} />
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
            className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
              selected
                ? 'border-[#ff6b35] bg-[#ff6b35]/15 font-medium text-white'
                : 'border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-neutral-700 hover:text-white'
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
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
              selected
                ? 'border-[#ff6b35] bg-[#ff6b35]/12 text-white'
                : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
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
      className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff6b35] to-pink-500 py-3.5 font-semibold text-white shadow-lg shadow-[#ff6b35]/25 transition-shadow hover:shadow-xl hover:shadow-[#ff6b35]/35 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {pendingLabel}
        </>
      ) : (
        <>
          {children}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </>
      )}
    </motion.button>
  )
}

/** Deliberately quiet: skipping is allowed, but it shouldn't compete with finishing. */
export function SkipAction({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      type="button"
      className="w-full py-2 text-sm font-medium text-neutral-400 underline-offset-4 transition-colors hover:text-white hover:underline"
    >
      {children}
    </button>
  )
}

export function StepError({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="text-sm text-red-400">
      {children}
    </p>
  )
}
