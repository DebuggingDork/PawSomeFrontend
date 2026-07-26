import { create } from 'zustand'
import type { BrowseFilters } from '@/lib/api/types'

/**
 * Where the user had got to in Discover, kept outside the page component.
 *
 * DiscoverPage unmounts on every navigation, and it held the deck order, the
 * filters and the active tab in local `useState`. Stepping over to Community and
 * back therefore rewound the deck to the server's original ordering, so the cards
 * you had already paged past came round again. The candidate *list* was never the
 * problem (swipes are excluded server-side and the React Query cache survives the
 * unmount) - only the position within it.
 *
 * Deliberately in memory rather than sessionStorage: a full reload refetching the
 * deck and starting from the nearest pet again is reasonable, and persisting an
 * order that references pet ids which may since have gone away buys nothing.
 */

export const DEFAULT_BROWSE_FILTERS: BrowseFilters = { radius: 5000 }

export type DiscoverTab = 'discover' | 'likes'

interface DiscoverState {
  /** Identifies which deck `order` belongs to (active pet + filters). A saved
   * order is only reused when this matches, so changing filters or switching pet
   * correctly starts over instead of restoring a stale sequence. */
  deckKey: string | null
  /** Pet ids, front of the deck first. Null until the user reorders anything. */
  order: string[] | null
  filters: BrowseFilters
  tab: DiscoverTab

  setOrder: (deckKey: string, order: string[]) => void
  setFilters: (filters: BrowseFilters) => void
  setTab: (tab: DiscoverTab) => void
}

export const useDiscoverStore = create<DiscoverState>((set) => ({
  deckKey: null,
  order: null,
  filters: DEFAULT_BROWSE_FILTERS,
  tab: 'discover',

  setOrder: (deckKey, order) => set({ deckKey, order }),
  // A different filter set is a different deck, so the remembered order retires
  // with it rather than being reconciled against candidates it never described.
  setFilters: (filters) => set({ filters, order: null, deckKey: null }),
  setTab: (tab) => set({ tab }),
}))
