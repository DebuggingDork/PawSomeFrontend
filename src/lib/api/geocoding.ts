/**
 * Address search + reverse geocoding via OpenStreetMap's Nominatim
 * (nominatim.openstreetmap.org) — free, no API key. Called directly from the
 * browser rather than proxied through our backend since Nominatim's usage
 * policy accepts a browser's own Referer header in place of a custom
 * User-Agent (which fetch() can't set from client-side JS anyway).
 *
 * Their policy caps this at ~1 request/second and asks that autocomplete-style
 * callers debounce — see debounce use at the call site in LocationPicker.
 * This is fine for PawSome's current traffic; a real production deployment
 * with heavier usage should move to a paid provider (Google Places, Mapbox)
 * with a proper key instead of leaning on the free tier indefinitely.
 */

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'

export interface GeocodeResult {
  address: string
  pincode: string | null
  lat: number
  lng: number
}

interface NominatimAddress {
  postcode?: string
  [key: string]: string | undefined
}

interface NominatimResult {
  display_name: string
  lat: string
  lon: string
  address?: NominatimAddress
}

function toResult(raw: NominatimResult): GeocodeResult {
  return {
    address: raw.display_name,
    pincode: raw.address?.postcode ?? null,
    lat: Number(raw.lat),
    lng: Number(raw.lon),
  }
}

/** Free-text address search for autocomplete-style suggestions while typing. */
export async function searchAddress(query: string, signal?: AbortSignal): Promise<GeocodeResult[]> {
  const url = `${NOMINATIM_BASE}/search?format=jsonv2&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`Address search failed (${res.status})`)
  const data = (await res.json()) as NominatimResult[]
  return data.map(toResult)
}

/** Reverse-geocodes a lat/lng (e.g. from "use my current location") into an address + pincode. */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult> {
  const url = `${NOMINATIM_BASE}/reverse?format=jsonv2&addressdetails=1&lat=${lat}&lon=${lng}`
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`Reverse geocoding failed (${res.status})`)
  const data = (await res.json()) as NominatimResult
  return toResult(data)
}
