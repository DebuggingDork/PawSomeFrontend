// Deterministic, vibrant gradients keyed off a stable id (event id, pet id, …).
// Lets image-less cards still feel colorful and unique — the same id always maps
// to the same gradient, so a card doesn't "flicker" colors between renders.

export interface Gradient {
  from: string
  to: string
  /** A mid accent good for text/rings against a dark background. */
  accent: string
  /** Ready-to-use CSS value for `style={{ background }}`. */
  css: string
}

const PALETTES: Omit<Gradient, 'css'>[] = [
  { from: '#ff6b35', to: '#f7415a', accent: '#ff8c5c' }, // brand orange → rose
  { from: '#f43f5e', to: '#a855f7', accent: '#f472b6' }, // rose → violet
  { from: '#8b5cf6', to: '#3b82f6', accent: '#a78bfa' }, // violet → blue
  { from: '#06b6d4', to: '#3b82f6', accent: '#38bdf8' }, // cyan → blue
  { from: '#10b981', to: '#06b6d4', accent: '#34d399' }, // emerald → cyan
  { from: '#f59e0b', to: '#ef4444', accent: '#fbbf24' }, // amber → red
  { from: '#ec4899', to: '#f97316', accent: '#fb7185' }, // pink → orange
  { from: '#6366f1', to: '#ec4899', accent: '#818cf8' }, // indigo → pink
]

function hashString(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0 // force 32-bit
  }
  return Math.abs(hash)
}

export function gradientForId(id: string): Gradient {
  const palette = PALETTES[hashString(id) % PALETTES.length]
  return {
    ...palette,
    css: `linear-gradient(135deg, ${palette.from} 0%, ${palette.to} 100%)`,
  }
}
