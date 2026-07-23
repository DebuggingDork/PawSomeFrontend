import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface PillTabsProps<T extends string> {
  tabs: { key: T; label: string; badge?: number; icon?: LucideIcon }[]
  active: T
  onChange: (key: T) => void
  /** Unique per instance so simultaneous PillTabs on one page don't share a layout animation. */
  layoutId: string
  className?: string
}

/** Animated sliding-pill tab switcher shared across the app (Discover, Profile, tab filters, Auth mode). */
export function PillTabs<T extends string>({ tabs, active, onChange, layoutId, className = '' }: PillTabsProps<T>) {
  return (
    <div className={`inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-neutral-900 p-1 text-sm font-semibold ${className}`}>
      {tabs.map((t) => {
        const Icon = t.icon
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={`relative flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 transition-colors ${
              active === t.key ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {active === t.key && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-[#ff6b35] to-pink-500"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
              />
            )}
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {t.label}
            {typeof t.badge === 'number' && t.badge > 0 && (
              <span className="rounded-full bg-white/20 px-1.5 text-xs">{t.badge}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
