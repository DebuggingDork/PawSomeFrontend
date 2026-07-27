import { useQuery } from '@tanstack/react-query'
import { API_BASE_URL } from '@/lib/api/client'
import type { Pet } from '@/lib/api/types'

/**
 * The real pets on PawSome, for the landing page to show off.
 *
 * Deliberately a bare fetch rather than `browsePets()` from lib/api. Two
 * reasons, both about this being the one page a stranger sees first:
 *
 *  1. apiFetch counts network-level failures and, after two in a row, hands the
 *     whole app over to ServerErrorPage. That is right for /discover, where
 *     there is nothing to show without the API. It is wrong here — if the
 *     backend is down, a visitor should still get the pitch, the photos of the
 *     hero and a working "Sign in" button, not a full-page error. Every section
 *     below degrades on its own instead.
 *  2. /pets is public and never returns owner details to an anonymous caller,
 *     so there is no token to attach and nothing to refresh.
 *
 * One request feeds every section on the page; React Query dedupes the rest.
 */
const LANDING_PET_LIMIT = 36

export interface LandingPets {
  /** Photographed pets only, newest first — the API's own order. */
  all: Pet[]
  dogs: Pet[]
  cats: Pet[]
  /** Distinct breeds across the fetched pets. */
  breedCount: number
  /** Every active pet on PawSome, not just the page of them we fetched. */
  total: number
}

const EMPTY: LandingPets = { all: [], dogs: [], cats: [], breedCount: 0, total: 0 }

async function fetchLandingPets(signal: AbortSignal): Promise<LandingPets> {
  const res = await fetch(`${API_BASE_URL}/pets?limit=${LANDING_PET_LIMIT}`, { signal })
  if (!res.ok) throw new Error(`Failed to load pets (${res.status})`)

  const data: { items: Pet[]; total: number } = await res.json()

  // A pet with no photo leaves a hole in a layout that is mostly photography,
  // so the marketing page only ever shows the ones we can actually picture.
  const all = data.items.filter((pet) => Boolean(pet.primary_photo_url))

  return {
    all,
    dogs: all.filter((pet) => pet.species === 'dog'),
    cats: all.filter((pet) => pet.species === 'cat'),
    breedCount: new Set(all.map((pet) => pet.breed).filter(Boolean)).size,
    total: data.total,
  }
}

export function useLandingPets() {
  const query = useQuery({
    queryKey: ['landing', 'pets'],
    queryFn: ({ signal }) => fetchLandingPets(signal),
    staleTime: 5 * 60_000,
    // No retry storm behind a marketing page. One attempt; if it misses, the
    // sections fall back and the visitor is none the wiser.
    retry: false,
    refetchOnWindowFocus: false,
  })

  return {
    ...query,
    pets: query.data ?? EMPTY,
  }
}

/**
 * "Simba, Kaju and 28 others" — a real sentence built from real names.
 *
 * Reads better than a count on its own, and it is the names that make the page
 * feel like it belongs to somebody: a stranger scanning the hero learns that
 * this is a place with a Kaju in it.
 */
export function nameRollCall(pets: Pet[], shown: number, total: number): string {
  const names = pets.slice(0, shown).map((pet) => pet.name)
  if (names.length === 0) return ''

  const others = Math.max(0, total - names.length)

  // Only one "and" in the sentence. Joining the names with "and" *and* then
  // appending "and N more" produced "Mouli, Kaju and Meesha and 27 more", which
  // reads as a mistake because it is one. When there is a tail, the names are a
  // plain comma list and the single "and" belongs to the tail.
  if (others > 0) return `${names.join(', ')} and ${others} more`
  if (names.length === 1) return names[0]
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}
