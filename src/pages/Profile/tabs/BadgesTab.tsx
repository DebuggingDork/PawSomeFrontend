import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Award, Loader2 } from 'lucide-react'
import { getMyAchievements } from '@/lib/api/achievements'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import type { AchievementBadge } from '@/lib/api/types'

/** Badges revealed per batch as the user scrolls. Enough to fill more than a
 * screen on the widest grid, so the first paint never looks truncated. */
const PAGE_SIZE = 9

function BadgeCard({ badge, index }: { badge: AchievementBadge; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      // Stagger within a batch only. Multiplying by the absolute index would make
      // the last badge of a long list wait over a second to appear.
      transition={{ duration: 0.28, delay: (index % PAGE_SIZE) * 0.035, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-colors ${
        badge.earned
          ? 'border-[#ff6b35]/40 bg-[#ff6b35]/5 shadow-lg shadow-[#ff6b35]/5'
          : 'border-neutral-800/80 bg-neutral-900/60'
      }`}
    >
      {/* Unearned badges are dimmed, but the whole card is no longer greyed out:
          at opacity-50 + grayscale the description was unreadable, which made the
          one thing that tells you how to earn it the hardest thing to read. */}
      <span className={`text-3xl ${badge.earned ? '' : 'opacity-40 grayscale'}`}>{badge.icon}</span>
      <p className={`text-sm font-semibold ${badge.earned ? 'text-white' : 'text-neutral-300'}`}>{badge.name}</p>
      <p className="text-xs leading-snug text-neutral-400">{badge.description}</p>
      {badge.earned && badge.earned_at && (
        <p className="text-[11px] text-[#ff6b35]">{new Date(badge.earned_at).toLocaleDateString()}</p>
      )}
    </motion.div>
  )
}

export function BadgesTab() {
  const { data, isLoading } = useQuery({ queryKey: ['achievements', 'me'], queryFn: getMyAchievements })
  const [visible, setVisible] = useState(PAGE_SIZE)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const badges = data?.badges ?? []
  const hasMore = visible < badges.length

  // Reveal the next batch when the sentinel scrolls into view. IntersectionObserver
  // rather than a scroll handler: no listener firing on every frame, and it also
  // covers the case where the viewport is tall enough that the sentinel is already
  // visible and the next batch should load without any scrolling at all.
  useEffect(() => {
    if (!hasMore) return
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setVisible((n) => n + PAGE_SIZE)
      },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, visible])

  if (isLoading || !data) {
    return (
      <div>
        <Skeleton className="mb-5 h-28 rounded-2xl" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-5 rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionHeader
            icon={Award}
            title="Badges"
            subtitle={`${data.total_earned} of ${data.total_available} earned`}
          />
          <span className="font-display text-lg font-bold text-[#ff6b35]">{data.completion_percentage}%</span>
        </div>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-neutral-800">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.completion_percentage}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-[#ff6b35] to-pink-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {badges.slice(0, visible).map((badge, i) => (
          <BadgeCard key={badge.type} badge={badge} index={i} />
        ))}
      </div>

      {hasMore && (
        <div ref={sentinelRef} className="flex items-center justify-center gap-2 py-6 text-xs text-neutral-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Loading more badges
        </div>
      )}
    </div>
  )
}
