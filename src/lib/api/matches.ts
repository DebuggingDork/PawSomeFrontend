import { apiFetch } from './client'
import { getPet } from './pets'
import type {
  BrowseFilters,
  BrowsePetsResponse,
  Conversation,
  LikesReceivedResponse,
  MatchSummary,
  NotificationWithDetails,
  SwipeInput,
  SwipeResult,
  SwipeStatistics,
  UndoSwipeResult,
} from './types'

export function getMyMatches(): Promise<MatchSummary[]> {
  return apiFetch<MatchSummary[]>('/matches/my-matches')
}

/**
 * Loads the caller's matches and resolves each one into a Conversation —
 * pairing the match with whichever pet in it isn't one of `myPetIds`.
 */
export async function getConversations(myPetIds: string[]): Promise<Conversation[]> {
  const matches = await getMyMatches()
  const ownIds = new Set(myPetIds)

  const conversations = await Promise.all(
    matches.map(async (match) => {
      const yourPetId = ownIds.has(match.pet1_id) ? match.pet1_id : match.pet2_id
      const otherPetId = yourPetId === match.pet1_id ? match.pet2_id : match.pet1_id
      const otherPet = await getPet(otherPetId)

      return {
        matchId: match.id,
        yourPetId,
        otherPet,
        createdAt: match.created_at,
      } satisfies Conversation
    }),
  )

  return conversations.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

function toQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value))
  }
  return search.toString()
}

export function browsePets(petId: string, filters: BrowseFilters = {}): Promise<BrowsePetsResponse> {
  const query = toQueryString({ pet_id: petId, ...filters })
  return apiFetch<BrowsePetsResponse>(`/matches/browse?${query}`)
}

export function swipe(body: SwipeInput): Promise<SwipeResult> {
  return apiFetch<SwipeResult>('/matches/swipe', { method: 'POST', body })
}

export function undoSwipe(swipeId: string): Promise<UndoSwipeResult> {
  return apiFetch<UndoSwipeResult>('/matches/undo-swipe', { method: 'POST', body: { swipe_id: swipeId } })
}

export function getLikesReceived(petId: string): Promise<LikesReceivedResponse> {
  return apiFetch<LikesReceivedResponse>(`/matches/likes-received?pet_id=${petId}`)
}

export function acceptLike(notificationId: string): Promise<{ match_id: string; message: string }> {
  return apiFetch<{ match_id: string; message: string }>(`/matches/likes/${notificationId}/accept`, {
    method: 'POST',
  })
}

export function rejectLike(notificationId: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/matches/likes/${notificationId}/reject`, { method: 'POST' })
}

export function getNotifications(unreadOnly = false, limit = 50): Promise<NotificationWithDetails[]> {
  return apiFetch<NotificationWithDetails[]>(
    `/matches/notifications?${toQueryString({ unread_only: unreadOnly, limit })}`,
  )
}

export function markNotificationsRead(notificationIds: string[]): Promise<void> {
  return apiFetch<void>('/matches/notifications/read', {
    method: 'PATCH',
    body: { notification_ids: notificationIds },
  })
}

export function getSwipeStatistics(petId: string): Promise<SwipeStatistics> {
  return apiFetch<SwipeStatistics>(`/matches/statistics?pet_id=${petId}`)
}
