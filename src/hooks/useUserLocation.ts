import { useEffect, useState } from 'react'

/**
 * The user's last known position — **read-only, and never prompts.**
 *
 * Distance labels need to know where the user is, but firing a geolocation
 * prompt because a card scrolled into view is hostile: the browser shows a
 * permission dialog with no explanation of why, attached to no action the user
 * took. So this only ever *reads* a position that was captured earlier, when
 * they pressed "use my current location" in the location picker and knew
 * exactly what they were asking for.
 *
 * The consequence is deliberate: distance simply doesn't appear until they've
 * volunteered their location once. A feature that's absent is better than a
 * prompt that's unexplained.
 */

const STORAGE_KEY = 'pawsome:last-known-location'

/** A month. Past that it's likely a different city, and a wrong distance is
 * worse than no distance. */
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000

export interface KnownLocation {
  lat: number
  lng: number
  savedAt: number
}

/** Notifies hooks already mounted when a fresh position is stored — `storage`
 * events only fire in *other* tabs, so same-tab listeners need this. */
const listeners = new Set<(value: KnownLocation | null) => void>()

export function readUserLocation(): KnownLocation | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<KnownLocation>
    if (typeof parsed.lat !== 'number' || typeof parsed.lng !== 'number') return null
    if (typeof parsed.savedAt !== 'number' || Date.now() - parsed.savedAt > MAX_AGE_MS) return null

    return parsed as KnownLocation
  } catch {
    // Private browsing, disabled storage, or corrupt JSON — all just mean
    // "we don't know where they are", which is a supported state.
    return null
  }
}

/** Called by LocationPicker when the user successfully uses their location. */
export function rememberUserLocation(lat: number, lng: number): void {
  const value: KnownLocation = { lat, lng, savedAt: Date.now() }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // Storage unavailable: the in-memory notify below still lights up distance
    // for this session, it just won't survive a reload.
  }
  listeners.forEach((notify) => notify(value))
}

export function useUserLocation(): KnownLocation | null {
  const [location, setLocation] = useState<KnownLocation | null>(() => readUserLocation())

  useEffect(() => {
    listeners.add(setLocation)
    return () => {
      listeners.delete(setLocation)
    }
  }, [])

  return location
}
