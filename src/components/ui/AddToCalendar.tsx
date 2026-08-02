import { CalendarPlus, Download } from 'lucide-react'
import { downloadIcs, googleCalendarUrl, type CalendarEvent } from '@/lib/calendar'

interface AddToCalendarProps {
  event: CalendarEvent
  /** Filename for the .ics download, without extension. */
  filename?: string
  className?: string
}

const ACTION =
  'inline-flex items-center gap-1.5 rounded-lg border border-neutral-800 px-2.5 py-1.5 text-xs font-medium text-neutral-400 transition-colors hover:border-brand/50 hover:text-white'

/** Slugify for a filename — anything but letters, digits and dashes goes. */
function safeName(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50) || 'playdate'
  )
}

/**
 * Both routes to a calendar, because neither covers everyone: the Google link
 * is one tap for the majority here, and the `.ics` download is the only thing
 * that works for Apple Calendar, Outlook, and anyone not signed into Google.
 */
export function AddToCalendar({ event, filename, className = '' }: AddToCalendarProps) {
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      <a href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" className={ACTION}>
        <CalendarPlus className="h-3.5 w-3.5" />
        Google Calendar
      </a>
      <button
        type="button"
        onClick={() => downloadIcs(event, `${safeName(filename ?? event.title)}.ics`)}
        className={ACTION}
      >
        <Download className="h-3.5 w-3.5" />
        .ics
      </button>
    </div>
  )
}
