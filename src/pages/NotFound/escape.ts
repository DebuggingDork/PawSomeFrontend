/**
 * Where the 404's "Take me home" button runs to when you reach for it.
 *
 * Pulled out of the component because this is the only part of the gag with
 * real logic in it, and it is geometry: given a box, a cursor and a viewport,
 * it is a pure function, and a pure function can be checked without booting a
 * browser and chasing a button around with synthetic mouse events.
 */

export interface Box {
  left: number
  top: number
  width: number
  height: number
}

export interface EscapeInput {
  /** The button's untransformed layout box, in viewport coordinates. */
  home: Box
  /** Its current offset from that home position. */
  offset: { x: number; y: number }
  /** Cursor position. Non-finite values fall back to the button's own centre. */
  cursor: { x: number; y: number }
  viewport: { width: number; height: number }
  /** How far it tries to bolt. */
  reach: number
  /** Keeps it clear of the fixed navbar, where it would be unclickable. */
  topInset?: number
  /** Breathing room between the button and the viewport edge. */
  edgeInset?: number
  /**
   * Rotates the ring of candidates so repeated dodges from the same spot do not
   * retrace the same eight landing points. Caller passes Math.random(); tests
   * pass a fixed number.
   */
  spin?: number
}

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi)

/** Candidate landing spots tried per dodge. */
const CANDIDATES = 12

/**
 * Returns the new offset from `home`, i.e. what to hand the transform.
 *
 * The obvious implementation — run in a straight line away from the pointer —
 * breaks against the edges of the screen. Once the button is up against a wall
 * the "away" vector points into it, the clamp cancels the movement, and the
 * button ends up sitting perfectly still underneath the cursor, which reads as
 * a broken button rather than a cheeky one.
 *
 * So instead it tries a ring of candidates, clamps each one into the viewport
 * first, and keeps whichever ends up furthest from the pointer. There is always
 * somewhere to go, and because the winner is scored on distance from the cursor
 * it can never land back under the hand chasing it.
 */
export function pickEscape({
  home,
  offset,
  cursor,
  viewport,
  reach,
  topInset = 96,
  edgeInset = 16,
  spin = 0,
}: EscapeInput): { x: number; y: number } {
  const halfW = home.width / 2 + edgeInset
  const halfH = home.height / 2 + edgeInset

  const homeCx = home.left + home.width / 2
  const homeCy = home.top + home.height / 2
  const fromCx = homeCx + offset.x
  const fromCy = homeCy + offset.y

  // Scoring against a NaN cursor makes every comparison below false, which
  // would silently leave the seed value in place and the button standing still,
  // with nothing in the console to say why.
  const cursorX = Number.isFinite(cursor.x) ? cursor.x : fromCx
  const cursorY = Number.isFinite(cursor.y) ? cursor.y : fromCy

  const minX = halfW
  const maxX = Math.max(halfW, viewport.width - halfW)
  const minY = topInset + halfH
  const maxY = Math.max(topInset + halfH, viewport.height - halfH)

  let best = { x: offset.x, y: offset.y, far: -Infinity }

  for (let i = 0; i < CANDIDATES; i++) {
    const angle = spin + (i / CANDIDATES) * Math.PI * 2
    const tx = clamp(fromCx + Math.cos(angle) * reach, minX, maxX)
    const ty = clamp(fromCy + Math.sin(angle) * reach, minY, maxY)
    const far = Math.hypot(tx - cursorX, ty - cursorY)
    if (far > best.far) best = { x: tx - homeCx, y: ty - homeCy, far }
  }

  return { x: best.x, y: best.y }
}

/**
 * How far it bolts. Scaled to the viewport so the leap reads as "across the
 * page" on a laptop and still clears the cursor in a small window, with a floor
 * so it can never be a polite little hop.
 */
export function leapDistance(viewport: { width: number; height: number }): number {
  return Math.max(280, Math.min(viewport.width, viewport.height) * 0.5)
}
