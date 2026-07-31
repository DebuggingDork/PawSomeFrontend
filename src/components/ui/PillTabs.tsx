import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface PillTabsProps<T extends string> {
  tabs: readonly { key: T; label: string; badge?: number; icon?: LucideIcon }[]
  active: T
  onChange: (key: T) => void
  /** Unique per instance so simultaneous PillTabs on one page don't share a layout animation. */
  layoutId: string
  className?: string
  /**
   * Which surface this sits on. The app is dark nearly everywhere, so that
   * stays the default; `light` is for the warm bright pages (Auth), where a
   * near-black track and grey labels would both float and fail contrast.
   */
  tone?: 'dark' | 'light'
}

const TRACK = {
  dark: 'bg-neutral-900',
  light: 'bg-[#ffdfcd]',
} as const

const LABEL = {
  dark: { active: 'text-white', idle: 'text-neutral-400 hover:text-neutral-200' },
  light: { active: 'text-white', idle: 'text-[#7a4a35] hover:text-[#3d1a0d]' },
} as const

const PILL = {
  dark: 'bg-gradient-to-r from-[#ff6b35] to-pink-500',
  // Deeper than the dark-tone pill so the white label clears 4.5:1 on it.
  light: 'bg-gradient-to-r from-[#d2400e] to-[#c2185b]',
} as const

/** Animated sliding-pill tab switcher shared across the app (Discover, Profile, tab filters, Auth mode). */
export function PillTabs<T extends string>({
  tabs,
  active,
  onChange,
  layoutId,
  className = '',
  tone = 'dark',
}: PillTabsProps<T>) {
  return (
    <div className={`inline-flex max-w-full gap-1 overflow-x-auto rounded-full ${TRACK[tone]} p-1 text-sm font-semibold ${className}`}>
      {tabs.map((t) => {
        const Icon = t.icon
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={`relative flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 transition-colors ${
              active === t.key ? LABEL[tone].active : LABEL[tone].idle
            }`}
          >
            {active === t.key && (
              <motion.span
                layoutId={layoutId}
                className={`absolute inset-0 -z-10 rounded-full ${PILL[tone]}`}
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
