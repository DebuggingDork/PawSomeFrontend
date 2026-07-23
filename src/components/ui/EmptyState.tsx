import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  /** 'lg' for a full-page moment (gradient icon tile); 'sm' for inline/tab states. */
  size?: 'sm' | 'lg'
  className?: string
}

/** Shared empty-state layout so every "nothing here yet" screen looks and feels the same. */
export function EmptyState({ icon: Icon, title, description, action, size = 'sm', className = '' }: EmptyStateProps) {
  const isLarge = size === 'lg'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`flex flex-col items-center justify-center text-center ${isLarge ? 'py-20' : 'py-14'} ${className}`}
    >
      {isLarge ? (
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff6b35] to-pink-500 shadow-lg shadow-[#ff6b35]/30">
          <Icon className="h-7 w-7 text-white" />
        </div>
      ) : (
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 ring-1 ring-neutral-800/80">
          <Icon className="h-6 w-6 text-neutral-500" />
        </div>
      )}
      <p className={isLarge ? 'mb-2 font-display text-2xl font-bold text-white' : 'mb-1 font-semibold text-neutral-200'}>
        {title}
      </p>
      {description && (
        <p className={isLarge ? 'mb-6 max-w-sm text-neutral-400' : 'mb-5 max-w-xs text-sm text-neutral-500'}>
          {description}
        </p>
      )}
      {action}
    </motion.div>
  )
}
