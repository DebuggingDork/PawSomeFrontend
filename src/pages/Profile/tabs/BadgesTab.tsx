import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { getMyAchievements } from '@/lib/api/achievements'
import { Skeleton } from '@/components/ui/Skeleton'

export function BadgesTab() {
  const { data, isLoading } = useQuery({ queryKey: ['achievements', 'me'], queryFn: getMyAchievements })

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-5 overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-semibold text-white">
            {data.total_earned} / {data.total_available} badges earned
          </p>
          <p className="text-sm text-neutral-500">{data.completion_percentage}%</p>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-neutral-800">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.completion_percentage}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-[#ff6b35] to-pink-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {data.badges.map((badge, i) => (
          <motion.div
            key={badge.type}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.03 }}
            className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all ${
              badge.earned
                ? 'border-[#ff6b35]/40 bg-[#ff6b35]/5 shadow-lg shadow-[#ff6b35]/5'
                : 'border-neutral-800/80 bg-neutral-900/60 opacity-50 grayscale'
            }`}
          >
            <span className="text-3xl">{badge.icon}</span>
            <p className="text-sm font-semibold text-white">{badge.name}</p>
            <p className="text-xs text-neutral-500">{badge.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
