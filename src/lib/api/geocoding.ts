/**
 * Address search + reverse geocoding, proxied through our own backend (see
 * backend/app/api/routes/geocoding.py) rather than calling Nominatim directly
 * from the browser — Nominatim's public API doesn't send
 * Access-Control-Allow-Origin, so a direct browser fetch() gets blocked by
 * CORS. The backend calls Nominatim server-side (not subject to CORS) and
 * also throttles/identifies itself per Nominatim's usage policy.
 */
import { apiFetch } from './client'

export interface GeocodeResult {
  address: string
  pincode: string | null
  lat: number
  lng: number
}

/** Free-text address search for autocomplete-style suggestions while typing. */
export async function searchAddress(query: string, signal?: AbortSignal): Promise<GeocodeResult[]> {
  return apiFetch<GeocodeResult[]>(`/geocoding/search?q=${encodeURIComponent(query)}`, { signal })
}

/** Reverse-geocodes a lat/lng (e.g. from "use my current location") into an address + pincode. */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult> {
  return apiFetch<GeocodeResult>(`/geocoding/reverse?lat=${lat}&lng=${lng}`)
}
