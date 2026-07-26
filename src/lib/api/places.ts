/**
 * Nearby dog parks / parks / vets from OpenStreetMap, via our Overpass proxy
 * (see backend/app/api/routes/places.py).
 */
import { apiFetch } from './client'
import type { NearbyPlaceList, PlaceKind } from './types'

interface NearbyOptions {
  radiusM?: number
  kinds?: PlaceKind[]
}

export function getNearbyPlaces(
  lat: number,
  lng: number,
  { radiusM, kinds }: NearbyOptions = {},
  signal?: AbortSignal,
): Promise<NearbyPlaceList> {
  const query = new URLSearchParams({ lat: String(lat), lng: String(lng) })
  if (radiusM !== undefined) query.set('radius_m', String(radiusM))
  if (kinds?.length) query.set('kinds', kinds.join(','))
  return apiFetch<NearbyPlaceList>(`/places/nearby?${query.toString()}`, { signal })
}
