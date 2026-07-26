/**
 * Weather + air quality for a place and time, via our backend proxy (see
 * backend/app/api/routes/conditions.py). The proxy exists for caching rather
 * than CORS — everyone looking at the same park at the same hour shares one
 * upstream Open-Meteo call.
 */
import { apiFetch } from './client'
import type { Conditions } from './types'

/** Open-Meteo's forecast horizon. Past this there is nothing to ask for. */
export const FORECAST_HORIZON_DAYS = 16

/** True when `when` is close enough ahead that a forecast exists for it. */
export function withinForecastHorizon(when: string | Date): boolean {
  const target = when instanceof Date ? when : new Date(when)
  const daysOut = (target.getTime() - Date.now()) / 86_400_000
  return daysOut >= 0 && daysOut <= FORECAST_HORIZON_DAYS
}

export function getConditions(lat: number, lng: number, at: string): Promise<Conditions> {
  const query = new URLSearchParams({ lat: String(lat), lng: String(lng), at })
  return apiFetch<Conditions>(`/conditions?${query.toString()}`)
}
