/**
 * Stacking order within a swipe card, named rather than scattered as bare
 * numbers across the card and the deck that renders it.
 *
 * The ordering is load-bearing, not cosmetic: DIM sits *above* BADGE on
 * purpose. A background card's own corner badges would otherwise render
 * through the deck's dimming layer and stay fully readable, which is exactly
 * the clutter that dimming exists to remove.
 *
 * Its own module because both SwipeCard and SwipeDeck need it, and exporting
 * a non-component from either would break their fast refresh.
 */
export const LAYER = {
  /** Corner pills, gender/safety controls, the expand affordance. */
  BADGE: 'z-10',
  /** Dimming veil the deck lays over every card that isn't on top. */
  DIM: 'z-20',
  /** Deck browse chevrons, which must stay clickable over any card. */
  CHEVRON: 'z-30',
} as const
