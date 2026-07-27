import { apiFetch, WS_BASE_URL } from './client'
import { getAccessToken } from './tokens'
import type {
  BrowseFilters,
  BrowsePetsResponse,
  Conversation,
  LikesReceivedResponse,
  MatchSummary,
  NotificationPushEvent,
  NotificationWithDetails,
  PetRelationship,
  Playdate,
  PlaydateCreateInput,
  PlaydateListResponse,
  SuperWoofStatus,
  SwipeHistoryFilters,
  SwipeHistoryResponse,
  SwipeInput,
  SwipeResult,
  SwipeStatistics,
  UndoSwipeResult,
} from './types'

export function getMyMatches(): Promise<MatchSummary[]> {
  return apiFetch<MatchSummary[]>('/matches/my-matches')
}

/**
 * Loads the caller's matches as ready-to-render conversations.
 *
 * The other pet now comes back embedded in the match itself. This used to fan
 * out one GET /pets/{id} per match under a Promise.all, and that endpoint 404s
 * on a deactivated pet — so a single pet going inactive rejected the whole
 * batch and both Matches and Chat rendered as though the user had no matches at
 * all, while the other side could still message them.
 */
export async function getConversations(): Promise<Conversation[]> {
  const matches = await getMyMatches()

  return matches
    .map(
      (match) =>
        ({
          matchId: match.id,
          yourPetId: match.your_pet_id,
          otherPet: match.other_pet,
          createdAt: match.created_at,
        }) satisfies Conversation,
    )
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

/** How the caller already stands with a pet, so browse surfaces don't offer
 * "Interested" on someone they have already matched or swiped on. */
export function getPetRelationship(targetPetId: string, petId?: string): Promise<PetRelationship> {
  const query = petId ? `?${toQueryString({ pet_id: petId })}` : ''
  return apiFetch<PetRelationship>(`/matches/relationship/${targetPetId}${query}`)
}

function toQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value))
  }
  return search.toString()
}

export function browsePets(petId?: string, filters: BrowseFilters = {}): Promise<BrowsePetsResponse> {
  const params: Record<string, string | number | boolean | undefined> = { ...filters }
  if (petId) {
    params.pet_id = petId
  }
  const query = toQueryString(params)
  return apiFetch<BrowsePetsResponse>(`/matches/browse?${query}`)
}

export function swipe(body: SwipeInput): Promise<SwipeResult> {
  return apiFetch<SwipeResult>('/matches/swipe', { method: 'POST', body })
}

export function undoSwipe(swipeId: string): Promise<UndoSwipeResult> {
  return apiFetch<UndoSwipeResult>('/matches/undo-swipe', { method: 'POST', body: { swipe_id: swipeId } })
}

export interface UnmatchResult {
  message: string
  match_id: string
  blocked: boolean
  notification_sent: boolean
}

export function unmatch(matchId: string, blockUser = false): Promise<UnmatchResult> {
  return apiFetch<UnmatchResult>(`/matches/${matchId}/unmatch`, {
    method: 'POST',
    body: { block_user: blockUser },
  })
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

export function markAllNotificationsRead(): Promise<void> {
  return apiFetch<void>('/matches/notifications/read-all', { method: 'POST' })
}

export function deleteNotification(notificationId: string): Promise<void> {
  return apiFetch<void>(`/matches/notifications/${notificationId}`, { method: 'DELETE' })
}

export function clearNotifications(): Promise<void> {
  return apiFetch<void>('/matches/notifications', { method: 'DELETE' })
}

export function getSwipeStatistics(petId: string): Promise<SwipeStatistics> {
  return apiFetch<SwipeStatistics>(`/matches/statistics?pet_id=${petId}`)
}

export function getSwipeHistory(petId: string, filters: SwipeHistoryFilters = {}): Promise<SwipeHistoryResponse> {
  const query = toQueryString({ pet_id: petId, ...filters })
  return apiFetch<SwipeHistoryResponse>(`/matches/swipe-history?${query}`)
}

export function getBreeds(species?: string): Promise<string[]> {
  const query = species ? `?${toQueryString({ species })}` : ''
  return apiFetch<string[]>(`/matches/breeds${query}`)
}

export function getSuperWoofStatus(): Promise<SuperWoofStatus> {
  return apiFetch<SuperWoofStatus>('/matches/super-woof/remaining')
}

// --- Playdates ---

export function getPlaydates(matchId: string): Promise<PlaydateListResponse> {
  return apiFetch<PlaydateListResponse>(`/matches/${matchId}/playdates`)
}

export function proposePlaydate(matchId: string, body: PlaydateCreateInput): Promise<Playdate> {
  return apiFetch<Playdate>(`/matches/${matchId}/playdates`, { method: 'POST', body })
}

export function respondToPlaydate(
  matchId: string,
  playdateId: string,
  responseStatus: 'accepted' | 'declined',
): Promise<Playdate> {
  return apiFetch<Playdate>(`/matches/${matchId}/playdates/${playdateId}/respond`, {
    method: 'POST',
    body: { status: responseStatus },
  })
}

export function cancelPlaydate(matchId: string, playdateId: string): Promise<Playdate> {
  return apiFetch<Playdate>(`/matches/${matchId}/playdates/${playdateId}/cancel`, { method: 'POST' })
}

export function getUpcomingPlaydates(): Promise<PlaydateListResponse> {
  return apiFetch<PlaydateListResponse>('/matches/playdates/upcoming')
}

export interface NotificationSocket {
  close: () => void
}

/** Opens the real-time notifications WebSocket — new_like/new_match/new_message
 * push while connected, so the bell doesn't rely on polling alone. */
export function connectNotificationSocket(onNotification: (event: NotificationPushEvent) => void): NotificationSocket {
  const token = getAccessToken()
  const socket = new WebSocket(`${WS_BASE_URL}/matches/notifications/ws?token=${encodeURIComponent(token ?? '')}`)

  socket.onmessage = (event) => {
    try {
      const parsed = JSON.parse(event.data) as NotificationPushEvent
      if (parsed.type === 'notification') onNotification(parsed)
    } catch {
      // ignore malformed frames
    }
  }

  return { close: () => socket.close() }
}
