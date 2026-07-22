import { apiFetch } from './client'
import type { AchievementSummary } from './types'

export function getMyAchievements(): Promise<AchievementSummary> {
  return apiFetch<AchievementSummary>('/achievements/me')
}
