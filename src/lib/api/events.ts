import { apiFetch } from './client'
import type {
  CommunityEvent,
  EventAttendeesResponse,
  EventCreateInput,
  EventListResponse,
  EventRSVPInput,
  EventRSVPResult,
} from './types'

function toQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value))
  }
  return search.toString()
}

export interface EventFilters {
  species?: string
  upcoming_only?: boolean
  limit?: number
  offset?: number
}

export function listEvents(filters: EventFilters = {}): Promise<EventListResponse> {
  const query = toQueryString({ ...filters })
  return apiFetch<EventListResponse>(`/events?${query}`)
}

export function getEvent(eventId: string): Promise<CommunityEvent> {
  return apiFetch<CommunityEvent>(`/events/${eventId}`)
}

export function createEvent(body: EventCreateInput): Promise<CommunityEvent> {
  return apiFetch<CommunityEvent>('/events', { method: 'POST', body })
}

export function cancelEvent(eventId: string): Promise<void> {
  return apiFetch<void>(`/events/${eventId}`, { method: 'DELETE' })
}

export function rsvpToEvent(eventId: string, body: EventRSVPInput): Promise<EventRSVPResult> {
  return apiFetch<EventRSVPResult>(`/events/${eventId}/rsvp`, { method: 'POST', body })
}

export function cancelRsvp(eventId: string): Promise<void> {
  return apiFetch<void>(`/events/${eventId}/rsvp`, { method: 'DELETE' })
}

export function getEventAttendees(eventId: string): Promise<EventAttendeesResponse> {
  return apiFetch<EventAttendeesResponse>(`/events/${eventId}/attendees`)
}
