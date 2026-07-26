import { useEffect, useRef, useState } from 'react'
import { LocateFixed, MapPin, Loader2 } from 'lucide-react'
import { searchAddress, reverseGeocode, type GeocodeResult } from '@/lib/api/geocoding'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { rememberUserLocation } from '@/hooks/useUserLocation'
import { ShowInMap } from './ShowInMap'
import { NearbyPlaces } from './NearbyPlaces'

const SEARCH_DEBOUNCE_MS = 450

export interface LocationPickerValue {
  lat: number
  lng: number
  address?: string
  pincode?: string
}

interface LocationPickerProps {
  latitude: number | null
  longitude: number | null
  /** Address text to show in the input — the caller owns this so it can persist
   * alongside lat/lng in its own form state. */
  address?: string | null
  onChange: (value: LocationPickerValue) => void
  className?: string
}

/**
 * Address entry with autocomplete (debounced, via Nominatim — see
 * lib/api/geocoding.ts) plus one-tap "use my current location", which
 * reverse-geocodes the browser's coordinates into the same address + pincode
 * shape a manual search would produce. Replaces raw lat/lng number fields —
 * once there's a proper address search, asking someone to type coordinates
 * by hand is no longer the easiest path for the common case.
 */
export function LocationPicker({ latitude, longitude, address, onChange, className = '' }: LocationPickerProps) {
  const [query, setQuery] = useState(address ?? '')
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searching, setSearching] = useState(false)
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const skipNextSearchRef = useRef(false)

  useOnClickOutside(containerRef, () => setShowSuggestions(false))

  // Keep the input in sync if the caller's address changes from outside
  // (e.g. loading a saved profile after this component already mounted).
  useEffect(() => {
    setQuery((current) => (address !== undefined && address !== null && address !== current ? address : current))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      abortRef.current?.abort()
    }
  }, [])

  const handleQueryChange = (value: string) => {
    setQuery(value)
    setError(null)

    if (skipNextSearchRef.current) {
      // Programmatic update right after picking a suggestion / geolocating —
      // don't immediately re-search the address we just resolved.
      skipNextSearchRef.current = false
      setShowSuggestions(false)
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    abortRef.current?.abort()

    const trimmed = value.trim()
    if (trimmed.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController()
      abortRef.current = controller
      setSearching(true)
      try {
        const results = await searchAddress(trimmed, controller.signal)
        setSuggestions(results)
        setShowSuggestions(true)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setSuggestions([])
        }
      } finally {
        if (!controller.signal.aborted) setSearching(false)
      }
    }, SEARCH_DEBOUNCE_MS)
  }

  const pickSuggestion = (result: GeocodeResult) => {
    skipNextSearchRef.current = true
    setQuery(result.address)
    setShowSuggestions(false)
    setSuggestions([])
    onChange({ lat: result.lat, lng: result.lng, address: result.address, pincode: result.pincode ?? undefined })
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser — search for your address instead.')
      return
    }

    setLocating(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords
        // The one moment the user has deliberately shared where they are —
        // remember it so distance labels elsewhere can work without ever
        // raising a permission prompt of their own.
        rememberUserLocation(lat, lng)
        try {
          const result = await reverseGeocode(lat, lng)
          skipNextSearchRef.current = true
          setQuery(result.address)
          onChange({ lat: result.lat, lng: result.lng, address: result.address, pincode: result.pincode ?? undefined })
        } catch {
          // Reverse geocoding failed (network hiccup, rate limit) — still hand
          // back real coordinates rather than losing the location entirely.
          setError("Found your location but couldn't look up its address.")
          onChange({ lat, lng })
        } finally {
          setLocating(false)
        }
      },
      (err) => {
        setLocating(false)
        setError(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission denied — search for your address instead.'
            : 'Could not get your location — search for your address instead.',
        )
      },
      { enableHighAccuracy: false, timeout: 10_000 },
    )
  }

  return (
    <div className={className} ref={containerRef}>
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder="Search for an address"
          autoComplete="off"
          className="w-full rounded-lg border border-neutral-800 bg-neutral-950/60 py-2.5 pl-10 pr-9 text-sm text-white placeholder:text-neutral-500 focus:border-[#ff6b35] focus:outline-none"
        />
        {searching && (
          <Loader2 className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-neutral-500" />
        )}

        {showSuggestions && suggestions.length > 0 && (
          <ul className="thin-scrollbar lenis-prevent-scroll absolute inset-x-0 top-full z-20 mt-1.5 max-h-64 overflow-y-auto overscroll-contain rounded-lg border border-neutral-800 bg-neutral-900 py-1 shadow-xl shadow-black/40">
            {suggestions.map((s, i) => (
              <li key={`${s.lat}-${s.lng}-${i}`}>
                <button
                  type="button"
                  onClick={() => pickSuggestion(s)}
                  className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-800"
                >
                  <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-neutral-500" />
                  <span className="line-clamp-2">{s.address}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={useMyLocation}
        disabled={locating}
        className="mt-3 flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950/60 px-4 py-2.5 text-sm font-medium text-neutral-200 transition-colors hover:border-[#ff6b35] hover:text-white disabled:cursor-wait disabled:opacity-70"
      >
        <LocateFixed className={`h-4 w-4 ${locating ? 'animate-pulse text-[#ff6b35]' : ''}`} />
        {locating ? 'Locating…' : 'Use my current location'}
      </button>

      {error && <p className="mt-2 text-xs text-amber-400">{error}</p>}

      {/* Once there's a pin, let people actually look at it before committing —
       * an address string that reads right can still resolve to the wrong side
       * of the city, and a playdate is a real-world meetup. */}
      {latitude !== null && longitude !== null && (
        <>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-neutral-500">
            <MapPin className="h-3.5 w-3.5" />
            {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </p>
          <ShowInMap className="mt-2" point={{ latitude, longitude, address }} />
          <NearbyPlaces
            className="mt-3"
            latitude={latitude}
            longitude={longitude}
            onPick={(place) => {
              skipNextSearchRef.current = true
              setQuery(place.name)
              setShowSuggestions(false)
              onChange({ lat: place.latitude, lng: place.longitude, address: place.name })
            }}
          />
        </>
      )}
    </div>
  )
}
