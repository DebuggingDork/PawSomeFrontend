import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface StatusPageProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  secondaryAction?: ReactNode
  /** Accent tint for the icon tile. Brand for "nothing to worry about" states,
   * danger for actual failures, neutral for maintenance/informational ones. */
  tone?: 'brand' | 'danger' | 'neutral'
  children?: ReactNode
}

const TONE_STYLES = {
  brand: 'from-[#ff6b35] to-pink-500 shadow-[#ff6b35]/30',
  danger: 'from-red-500 to-orange-500 shadow-red-500/30',
  neutral: 'from-neutral-600 to-neutral-800 shadow-black/30',
}

/** Shared button classes so every state page's actions look consistent. */
export const statusPagePrimaryButton =
  'rounded-full bg-gradient-to-r from-[#ff6b35] to-pink-500 px-6 py-2.5 font-semibold text-white shadow-lg shadow-[#ff6b35]/30 transition-transform hoverable:hover:-translate-y-0.5'
export const statusPageSecondaryButton =
  'rounded-full border border-neutral-700 px-6 py-2.5 font-semibold text-neutral-300 transition-colors hover:border-[#ff6b35] hover:text-white'

/** Shared full-page layout for app-level states (404, offline, session expired,
 * server error, maintenance, crash) so they all look and feel like one system. */
export function StatusPage({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  tone = 'brand',
  children,
}: StatusPageProps) {
  return (
    <div className="flex min-h-[calc(100dvh-6rem)] flex-col items-center justify-center px-6 pb-16 pt-24 text-center md:pt-28">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex max-w-md flex-col items-center"
      >
        <div
          className={`mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br shadow-xl ${TONE_STYLES[tone]}`}
        >
          <Icon className="h-9 w-9 text-white" />
        </div>
        <h1 className="mb-3 font-display text-3xl font-bold text-white">{title}</h1>
        {description && <p className="mb-8 text-neutral-400">{description}</p>}
        {children}
        {(action || secondaryAction) && (
          <div className="flex flex-wrap items-center justify-center gap-3">
            {action}
            {secondaryAction}
          </div>
        )}
      </motion.div>
    </div>
  )
}
