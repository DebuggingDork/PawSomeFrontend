/**
 * Distance — and drive time where a routing key is configured — between the
 * user and a venue. See backend/app/api/routes/travel.py: without an Ola Maps
 * key the backend answers with straight-line distance rather than failing, so
 * `source` tells us how to phrase it.
 */
import { apiFetch } from './client'
import type { TravelEstimate } from './types'

export function getTravelEstimate(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
): Promise<TravelEstimate> {
  const query = new URLSearchParams({
    from_lat: String(from.lat),
    from_lng: String(from.lng),
    to_lat: String(to.lat),
    to_lng: String(to.lng),
  })
  return apiFetch<TravelEstimate>(`/travel/eta?${query.toString()}`)
}
