import { useQuery } from '@tanstack/react-query'
import { Trees, Dog, Stethoscope, Loader2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { getNearbyPlaces } from '@/lib/api/places'
import type { NearbyPlace, PlaceKind } from '@/lib/api/types'

interface NearbyPlacesProps {
  /** Centre of the search — usually the location already picked. */
  latitude: number
  longitude: number
  onPick: (place: NearbyPlace) => void
  className?: string
}

const KIND_ICON: Record<PlaceKind, LucideIcon> = {
  dog_park: Dog,
  park: Trees,
  vet: Stethoscope,
}

const SEARCH_RADIUS_M = 3000
const MAX_SHOWN = 6

function distanceLabel(metres: number): string {
  return metres < 1000 ? `${metres} m` : `${(metres / 1000).toFixed(1)} km`
}

/**
 * One-tap venue suggestions from OpenStreetMap.
 *
 * Same reasoning as the quick date slots in the propose form: most playdates
 * happen at one of a handful of obvious local spots, so offering those beats
 * making everyone type a full address for the common case. Dog parks first,
 * since that's what people are usually looking for.
 */
export function NearbyPlaces({ latitude, longitude, onPick, className = '' }: NearbyPlacesProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['nearby-places', latitude.toFixed(2), longitude.toFixed(2)],
    queryFn: () => getNearbyPlaces(latitude, longitude, { radiusM: SEARCH_RADIUS_M }),
    // Points of interest barely change and the backend caches them for a day —
    // no reason to ask again within a session.
    staleTime: 60 * 60_000,
    retry: false,
  })

  if (isLoading) {
    return (
      <p className={`flex items-center gap-1.5 text-xs text-neutral-400 ${className}`}>
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Looking for spots nearby…
      </p>
    )
  }

  // A suggestion list is a convenience on top of a working address search —
  // if it fails or finds nothing, say nothing rather than showing an error for
  // something the user didn't ask for.
  if (isError || !data?.items.length) return null

  const places = [...data.items]
    // Dog parks are the point; a generic park is the fallback.
    .sort((a, b) => (a.kind === 'dog_park' ? -1 : 0) - (b.kind === 'dog_park' ? -1 : 0))
    .slice(0, MAX_SHOWN)

  return (
    <div className={className}>
      <span className="mb-1.5 block text-xs font-medium text-neutral-400">Spots nearby</span>
      <div className="flex flex-wrap gap-1.5">
        {places.map((place) => {
          const Icon = KIND_ICON[place.kind]
          return (
            <button
              key={`${place.latitude}-${place.longitude}-${place.name}`}
              type="button"
              onClick={() => onPick(place)}
              className="flex max-w-full items-center gap-1.5 rounded-full border border-neutral-800 px-2.5 py-1 text-xs font-medium text-neutral-400 transition-colors hover:border-brand hover:text-white"
            >
              <Icon className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{place.name}</span>
              <span className="flex-shrink-0 text-neutral-400">{distanceLabel(place.distance_m)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
