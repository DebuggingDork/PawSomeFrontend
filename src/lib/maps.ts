/**
 * Google Maps deep links + a keyless inline map preview.
 *
 * Deliberately no Google Maps JS SDK and no API key: the Maps URLs API
 * (https://developers.google.com/maps/documentation/urls/get-started) is a
 * documented, versioned URL scheme that is free, unmetered, and needs no
 * credentials. Opening one hands the user off to the Google Maps app on
 * mobile (or maps.google.com on desktop), which is where they'd want to be
 * anyway to navigate — we get turn-by-turn, saved places, and share sheets
 * for free instead of rebuilding them.
 *
 * The inline preview uses OpenStreetMap's embed iframe for the same reason:
 * Google's Maps Embed API needs a billable key, OSM's doesn't, and we already
 * geocode against OSM/Nominatim (see backend/app/api/routes/geocoding.py), so
 * the pin lands exactly where the address search resolved it.
 */

export interface MapPoint {
  latitude: number
  longitude: number
  /** Human-friendly place name, e.g. "KBR Park walking track". */
  locationName?: string | null
  /** Full postal address, when we have one. */
  address?: string | null
}

/** `api=1` pins the URL scheme's version — without it Google may reinterpret params. */
const MAPS_BASE = 'https://www.google.com/maps'

/**
 * Coordinates are the authoritative destination; the name/address only rides
 * along as a label. Sending the address as the query instead would re-geocode
 * it on Google's side and can land on a different pin than the one the
 * proposer actually picked.
 */
function coords(point: MapPoint): string {
  return `${point.latitude},${point.longitude}`
}

/** A pin at the location, with its name as the label where Google honours it. */
export function mapsViewUrl(point: MapPoint): string {
  const params = new URLSearchParams({ api: '1', query: coords(point) })
  return `${MAPS_BASE}/search/?${params.toString()}`
}

/** Turn-by-turn from wherever the user currently is. */
export function mapsDirectionsUrl(point: MapPoint, travelMode: 'driving' | 'walking' | 'transit' | 'bicycling' = 'driving'): string {
  const params = new URLSearchParams({
    api: '1',
    destination: coords(point),
    travelmode: travelMode,
  })
  return `${MAPS_BASE}/dir/?${params.toString()}`
}

/** Street View at the location — useful for "what does the gate look like?". */
export function streetViewUrl(point: MapPoint): string {
  const params = new URLSearchParams({ api: '1', map_action: 'pano', viewpoint: coords(point) })
  return `${MAPS_BASE}/@?${params.toString()}`
}

/** Roughly a 600 m box around the point — close enough to read the street names. */
const EMBED_DELTA_DEG = 0.003

/** Keyless OpenStreetMap iframe source, centred on the point with a marker. */
export function osmEmbedUrl(point: MapPoint): string {
  const { latitude: lat, longitude: lng } = point
  const bbox = [lng - EMBED_DELTA_DEG, lat - EMBED_DELTA_DEG, lng + EMBED_DELTA_DEG, lat + EMBED_DELTA_DEG].join(',')
  const params = new URLSearchParams({ bbox, layer: 'mapnik', marker: `${lat},${lng}` })
  return `https://www.openstreetmap.org/export/embed.html?${params.toString()}`
}

/** Best single line of text we can show for a place. */
export function describePoint(point: MapPoint): string {
  return point.locationName?.trim() || point.address?.trim() || coords(point)
}

/** Guards against rendering a map for a half-filled form. */
export function hasCoordinates(point: Partial<MapPoint>): point is MapPoint {
  return (
    typeof point.latitude === 'number' &&
    typeof point.longitude === 'number' &&
    Number.isFinite(point.latitude) &&
    Number.isFinite(point.longitude)
  )
}
