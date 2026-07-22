import { useState } from 'react'
import { LocateFixed, MapPin } from 'lucide-react'

interface LocationPickerProps {
  latitude: number | null
  longitude: number | null
  onChange: (lat: number, lng: number) => void
  className?: string
}

/** One-tap browser geolocation with plain lat/lng fields as a manual fallback/override. */
export function LocationPicker({ latitude, longitude, onChange, className = '' }: LocationPickerProps) {
  const [status, setStatus] = useState<'idle' | 'locating' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setStatus('error')
      setError('Geolocation is not supported in this browser — enter coordinates manually.')
      return
    }

    setStatus('locating')
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange(position.coords.latitude, position.coords.longitude)
        setStatus('idle')
      },
      (err) => {
        setStatus('error')
        setError(err.code === err.PERMISSION_DENIED ? 'Location permission denied — enter coordinates manually.' : 'Could not get your location — enter coordinates manually.')
      },
      { enableHighAccuracy: false, timeout: 10_000 },
    )
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={useMyLocation}
        disabled={status === 'locating'}
        className="mb-3 flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950/60 px-4 py-2.5 text-sm font-medium text-neutral-200 transition-colors hover:border-[#ff6b35] hover:text-white disabled:cursor-wait disabled:opacity-70"
      >
        <LocateFixed className={`h-4 w-4 ${status === 'locating' ? 'animate-pulse text-[#ff6b35]' : ''}`} />
        {status === 'locating' ? 'Locating…' : 'Use my current location'}
      </button>

      {error && <p className="mb-3 text-xs text-amber-400">{error}</p>}

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-neutral-500">Latitude</span>
          <input
            type="number"
            step="any"
            min={-90}
            max={90}
            value={latitude ?? ''}
            onChange={(e) => onChange(Number(e.target.value), longitude ?? 0)}
            placeholder="12.9716"
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-[#ff6b35] focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-neutral-500">Longitude</span>
          <input
            type="number"
            step="any"
            min={-180}
            max={180}
            value={longitude ?? ''}
            onChange={(e) => onChange(latitude ?? 0, Number(e.target.value))}
            placeholder="77.5946"
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-[#ff6b35] focus:outline-none"
          />
        </label>
      </div>

      {latitude !== null && longitude !== null && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-neutral-500">
          <MapPin className="h-3.5 w-3.5" />
          {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </p>
      )}
    </div>
  )
}
