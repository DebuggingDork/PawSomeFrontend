/**
 * Calendar export for playdates and events.
 *
 * No API involved — `.ics` (RFC 5545) is a plain text format, and Google
 * Calendar takes a documented URL template. The whole feature is string
 * building, which is why it's worth doing: a confirmed playdate that nobody
 * writes down is a no-show waiting to happen.
 */

import { mapsViewUrl, type MapPoint } from './maps'

export interface CalendarEvent {
  title: string
  /** ISO timestamp. */
  start: string
  durationMinutes?: number
  description?: string
  location: MapPoint
  locationText?: string
}

const DEFAULT_DURATION_MINUTES = 60

/** UTC basic format — `20260727T183000Z` — which both formats want. */
function stamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function endOf(event: CalendarEvent): Date {
  const start = new Date(event.start)
  return new Date(start.getTime() + (event.durationMinutes ?? DEFAULT_DURATION_MINUTES) * 60_000)
}

/** Both formats treat these as separators, so they have to be escaped. */
function escapeText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1')
}

/** Human-readable place plus a maps link, so the calendar entry is navigable. */
function locationLine(event: CalendarEvent): string {
  const label = event.locationText?.trim() || event.location.locationName?.trim() || ''
  const url = mapsViewUrl(event.location)
  return label ? `${label} — ${url}` : url
}

export function toIcs(event: CalendarEvent): string {
  const now = new Date()
  const uid = `${stamp(now)}-${Math.random().toString(36).slice(2, 10)}@pawsome.app`

  const description = [event.description?.trim(), locationLine(event)].filter(Boolean).join('\n')

  // CRLF line endings are required by RFC 5545 — some calendar clients reject
  // a bare-LF file outright.
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PawSome//Playdates//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp(now)}`,
    `DTSTART:${stamp(new Date(event.start))}`,
    `DTEND:${stamp(endOf(event))}`,
    `SUMMARY:${escapeText(event.title)}`,
    `LOCATION:${escapeText(locationLine(event))}`,
    `DESCRIPTION:${escapeText(description)}`,
    `GEO:${event.location.latitude};${event.location.longitude}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

export function googleCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${stamp(new Date(event.start))}/${stamp(endOf(event))}`,
    location: locationLine(event),
  })
  if (event.description?.trim()) params.set('details', event.description.trim())
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/** Turns the `.ics` text into a download. Revokes the object URL after. */
export function downloadIcs(event: CalendarEvent, filename = 'playdate.ics'): void {
  const blob = new Blob([toIcs(event)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}
