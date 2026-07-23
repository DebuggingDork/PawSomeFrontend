import { useQuery } from '@tanstack/react-query'
import { getMyAchievements } from '@/lib/api/achievements'

export function BadgesTab() {
  const { data, isLoading } = useQuery({ queryKey: ['achievements', 'me'], queryFn: getMyAchievements })

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-neutral-900/60" />
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-4">
        <div>
          <p className="font-semibold text-white">
            {data.total_earned} / {data.total_available} badges earned
          </p>
          <p className="text-sm text-neutral-500">{data.completion_percentage}% complete</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {data.badges.map((badge) => (
          <div
            key={badge.type}
            className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-opacity ${
              badge.earned ? 'border-[#ff6b35]/40 bg-[#ff6b35]/5' : 'border-neutral-800/80 bg-neutral-900/60 opacity-50'
            }`}
          >
            <span className="text-3xl">{badge.icon}</span>
            <p className="text-sm font-semibold text-white">{badge.name}</p>
            <p className="text-xs text-neutral-500">{badge.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
