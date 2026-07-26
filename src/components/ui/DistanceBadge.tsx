import { useQuery } from '@tanstack/react-query'
import { Navigation } from 'lucide-react'
import { getTravelEstimate } from '@/lib/api/travel'
import { useUserLocation } from '@/hooks/useUserLocation'
import { Badge } from './Badge'

interface DistanceBadgeProps {
  latitude: number
  longitude: number
  className?: string
}

/**
 * "4.2 km away", or "4.2 km · ~15 min drive" once a routing key is configured.
 *
 * Renders nothing until the user has volunteered their location at least once
 * — see `useUserLocation`, which deliberately never triggers a permission
 * prompt. Like the weather badge, it's decorative and stays silent on error.
 */
export function DistanceBadge({ latitude, longitude, className = '' }: DistanceBadgeProps) {
  const from = useUserLocation()

  const { data } = useQuery({
    queryKey: [
      'travel',
      from?.lat.toFixed(2),
      from?.lng.toFixed(2),
      latitude.toFixed(2),
      longitude.toFixed(2),
    ],
    queryFn: () => getTravelEstimate({ lat: from!.lat, lng: from!.lng }, { lat: latitude, lng: longitude }),
    enabled: from !== null,
    // Neither endpoint moves, so this answer is good for as long as the page
    // lives; the backend caches it for six hours besides.
    staleTime: 60 * 60_000,
    retry: false,
  })

  if (!data) return null

  // Only claim a drive time when a router actually produced one — presenting a
  // crow-flies distance as a drive would be wrong on any route with a river in it.
  const drive = data.duration_minutes !== null ? ` · ~${data.duration_minutes} min drive` : ' away'

  return (
    <Badge icon={Navigation} className={className}>
      {data.distance_km} km{drive}
    </Badge>
  )
}
