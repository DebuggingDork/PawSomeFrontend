import { useQuery } from '@tanstack/react-query'
import { Cloud, CloudRain, CloudSnow, Sun, CloudFog, Zap, Wind } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { getConditions, withinForecastHorizon } from '@/lib/api/conditions'
import type { AqiBand } from '@/lib/api/types'
import { Badge, type BadgeTone } from '@/components/ui/Badge'

interface ConditionsBadgeProps {
  latitude: number
  longitude: number
  /** ISO timestamp of the meetup. */
  at: string
  className?: string
}

/** WMO code buckets → icon. Grouped the way the summary text is grouped. */
function iconFor(code: number): LucideIcon {
  if (code === 0 || code === 1) return Sun
  if (code === 45 || code === 48) return CloudFog
  if (code >= 95) return Zap
  if (code >= 71 && code <= 86) return CloudSnow
  if (code >= 51) return CloudRain
  return Cloud
}

/** Rain probability worth reacting to. Below this it's noise. */
const RAIN_ALERT_THRESHOLD = 50

const AQI_LABEL: Record<AqiBand, string> = {
  good: 'Good air',
  moderate: 'Moderate air',
  unhealthy_sensitive: 'Poor air',
  unhealthy: 'Unhealthy air',
  very_unhealthy: 'Very unhealthy air',
  hazardous: 'Hazardous air',
}

const AQI_TONE: Record<AqiBand, BadgeTone> = {
  good: 'emerald',
  moderate: 'neutral',
  unhealthy_sensitive: 'amber',
  unhealthy: 'amber',
  very_unhealthy: 'red',
  hazardous: 'red',
}

/**
 * Weather and air quality for a playdate or event.
 *
 * A rained-out meetup is the most common way a good match fizzles, and in
 * Indian metros air quality genuinely decides whether walking a dog is a good
 * idea — both are worth knowing *before* you accept rather than on the day.
 *
 * This is decorative: it renders nothing while loading (a skeleton would shift
 * the card's layout for data that may never arrive) and nothing on error. A
 * weather service having a bad day must not be visible on a playdate card.
 */
export function ConditionsBadge({ latitude, longitude, at, className = '' }: ConditionsBadgeProps) {
  const enabled = withinForecastHorizon(at)

  const { data } = useQuery({
    // Rounding into the key is what makes ten playdates at the same park share
    // one request — the backend caches at the same granularity.
    queryKey: ['conditions', latitude.toFixed(2), longitude.toFixed(2), at.slice(0, 13)],
    queryFn: () => getConditions(latitude, longitude, at),
    enabled,
    staleTime: 15 * 60_000,
    retry: false,
  })

  if (!enabled || !data?.available) return null

  const { temperature_c: temp, precipitation_probability: rain, weather_code: code, summary } = data
  const WeatherIcon = code === null ? Cloud : iconFor(code)
  const rainy = rain !== null && rain >= RAIN_ALERT_THRESHOLD

  const hasWeather = temp !== null || summary !== null

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {hasWeather && (
        <Badge tone={rainy ? 'amber' : 'neutral'} icon={WeatherIcon} title={summary ?? undefined}>
          {temp !== null && `${Math.round(temp)}°C`}
          {temp !== null && summary && ' · '}
          {summary}
        </Badge>
      )}

      {rainy && (
        <Badge tone="amber" icon={CloudRain}>
          {rain}% rain
        </Badge>
      )}

      {data.aqi_band && (
        <Badge tone={AQI_TONE[data.aqi_band]} icon={Wind} title={`US AQI ${data.us_aqi}`}>
          {AQI_LABEL[data.aqi_band]}
          {data.us_aqi !== null && ` ${data.us_aqi}`}
        </Badge>
      )}
    </div>
  )
}
