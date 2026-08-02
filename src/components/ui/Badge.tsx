import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

/**
 * Small status pill.
 *
 * Every badge in the app was an inline Tailwind string copied between
 * components, which is fine until several new ones arrive at once and start
 * drifting apart. The class strings here are the ones already in use — this
 * names the pattern rather than changing it.
 */

export type BadgeTone = 'neutral' | 'brand' | 'emerald' | 'amber' | 'red'

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-neutral-800/70 text-neutral-300',
  brand: 'bg-brand/20 text-brand-light',
  emerald: 'bg-emerald-400/15 text-emerald-400',
  amber: 'bg-amber-400/15 text-amber-400',
  red: 'bg-red-400/15 text-red-400',
}

interface BadgeProps {
  children: ReactNode
  tone?: BadgeTone
  icon?: LucideIcon
  title?: string
  className?: string
}

export function Badge({ children, tone = 'neutral', icon: Icon, title, className = '' }: BadgeProps) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${TONES[tone]} ${className}`}
    >
      {Icon && <Icon className="h-3 w-3 flex-shrink-0" />}
      {children}
    </span>
  )
}
