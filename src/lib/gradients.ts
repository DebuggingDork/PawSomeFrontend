// Deterministic, vibrant gradients keyed off a stable id (event id, pet id, …).
// Lets image-less cards still feel colorful and unique — the same id always maps
// to the same gradient, so a card doesn't "flicker" colors between renders.

export interface Gradient {
  from: string
  to: string
  /** A mid accent good for text/rings against a dark background. */
  accent: string
  /**
   * Text colour for content sitting directly on the band.
   *
   * It has to travel with the palette rather than being a fixed `text-white`,
   * because these gradients deliberately span a wide range of brightness and no
   * single ink is legible across all of them — see the note below.
   */
  ink: string
  /** Ready-to-use CSS value for `style={{ background }}`. */
  css: string
}

/**
 * One lane, eight lanes' worth of variety.
 *
 * This used to cycle the whole colour wheel — cyan, emerald, indigo, violet —
 * on an app whose brand is a warm orange. A cyan-to-blue event cover sitting
 * under orange chrome does not read as a colourful product, it reads as eight
 * colours chosen by nobody in particular. That is the single loudest tell that
 * a palette was generated rather than picked.
 *
 * So everything now lives in a warm arc, hue 330 through 44, running from plum
 * rose through crimson and brick to marigold. The brand orange is the anchor
 * and the first entry. Cards stay easy to tell apart, but they are recognisably
 * the same product.
 *
 * Variety comes from brightness as much as hue, which is the part that also
 * solves a legibility problem. The five bright palettes take dark ink; the
 * three deep ones take light ink. Each is deliberately pushed to one side of
 * the middle, because mid-luminance is exactly where neither white nor black
 * clears 4.5:1 — the previous set had four gradients stranded in that band with
 * `text-white` on top of them, one of which measured 1.6:1.
 *
 * Verified: every ink clears 4.5:1 against BOTH stops of its own gradient
 * (worst 5.30), and every accent clears 4.5:1 as body text on the event card's
 * background (worst 6.57).
 */
const INK_ON_BRIGHT = '#1a0d07' // near-black, warmed so it doesn't read as a hole
const INK_ON_DEEP = '#fffaf7'

const PALETTES: Omit<Gradient, 'css'>[] = [
  // Bright — dark ink.
  { from: '#ff6b35', to: '#f7415a', accent: '#ff8c5c', ink: INK_ON_BRIGHT }, // brand orange → rose
  { from: '#ffa62b', to: '#ff6b35', accent: '#ffc16b', ink: INK_ON_BRIGHT }, // amber → brand orange
  { from: '#ffb08a', to: '#ff7a5c', accent: '#ffcbb3', ink: INK_ON_BRIGHT }, // peach → coral
  { from: '#f6c445', to: '#ef7d24', accent: '#ffd76b', ink: INK_ON_BRIGHT }, // marigold → tangerine
  { from: '#f0a15e', to: '#e2673c', accent: '#f7bf93', ink: INK_ON_BRIGHT }, // apricot → terracotta
  // Deep — light ink.
  { from: '#c02f4b', to: '#7d1f38', accent: '#f2758c', ink: INK_ON_DEEP }, // deep rose → wine
  { from: '#a8325f', to: '#6b1f45', accent: '#e87bab', ink: INK_ON_DEEP }, // plum rose → plum
  { from: '#b0402a', to: '#6e2419', accent: '#e8927a', ink: INK_ON_DEEP }, // brick → rust
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
