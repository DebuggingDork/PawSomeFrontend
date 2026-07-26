import { create } from 'zustand'
import { clearTokens, getAccessToken } from '@/lib/api/tokens'
import { onSessionExpired } from '@/lib/api/client'
import { me } from '@/lib/api/auth'
import { listMyPets } from '@/lib/api/pets'
import { resetClientState } from '@/lib/queryClient'
import type { Pet, UserResponse } from '@/lib/api/types'

export type { Pet }
export type User = UserResponse

interface AuthState {
  user: User | null
  pets: Pet[]
  activePet: Pet | null
  isAuthenticated: boolean
  /** True while the store is trying to resume a session from a stored token. */
  isHydrating: boolean
  /** Set when an active session died mid-use (not on a fresh boot with already-dead
   * tokens) — App.tsx watches this to redirect to /session-expired exactly once. */
  sessionJustExpired: boolean
  login: (user: User, pets: Pet[]) => void
  logout: () => void
  setActivePet: (pet: Pet | null) => void
  /**
   * Re-reads the signed-in user and their pets from the API.
   *
   * `pets` is otherwise a snapshot taken at login, which went stale the moment
   * anything created a pet mid-session: onboarding would add one, invalidate the
   * React Query caches, and leave `activePet` null, so Discover kept showing
   * "Create a pet profile to start swiping" and silently dropped every swipe for a
   * user who plainly had a pet. Anything that adds, edits or removes a pet must
   * call this.
   */
  refreshSession: () => Promise<void>
  /** Resumes a session from a persisted access token on app boot. Safe to call once. */
  hydrate: () => Promise<void>
  clearSessionExpiredFlag: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  pets: [],
  activePet: null,
  isAuthenticated: false,
  isHydrating: true,
  sessionJustExpired: false,

  login: (user, pets) => {
    // Every cached query belongs to whoever was signed in when it was fetched. The
    // store used to swap the user out from under a cache that still held the previous
    // account, so a fresh sign-in (or sign-up) rendered the *old* user's avatar, name
    // and onboarding status until a reload happened to drop the in-memory cache.
    resetClientState()
    set({
      user,
      pets,
      activePet: pets[0] ?? null,
      isAuthenticated: true,
      isHydrating: false,
    })
  },

  logout: () => {
    clearTokens()
    // Same reason as login(), plus: leaving the cache populated after sign-out means
    // the next account to sign in on this tab starts by seeing this one's data.
    resetClientState()
    set({ user: null, pets: [], activePet: null, isAuthenticated: false })
  },

  setActivePet: (activePet) => set({ activePet }),

  refreshSession: async () => {
    if (!getAccessToken()) return
    try {
      const [user, pets] = await Promise.all([me(), listMyPets()])
      set((state) => ({
        user,
        pets,
        // Keep whatever the user had selected if it still exists, so refreshing
        // after an unrelated edit can't quietly switch which pet they're swiping as.
        activePet: pets.find((p) => p.id === state.activePet?.id) ?? pets[0] ?? null,
        isAuthenticated: true,
      }))
    } catch {
      // A failed refresh means "couldn't update just now", never "signed out" —
      // same reasoning as hydrate(). Leave the existing state in place.
    }
  },

  clearSessionExpiredFlag: () => set({ sessionJustExpired: false }),

  hydrate: () => {
    if (!hydratePromise) {
      hydratePromise = (async () => {
        const token = getAccessToken()
        if (!token) {
          set({ isHydrating: false })
          return
        }

        try {
          const [user, pets] = await Promise.all([me(), listMyPets()])
          set({ user, pets, activePet: pets[0] ?? null, isAuthenticated: true, isHydrating: false })
        } catch {
          // Don't clearTokens() here — a network hiccup or a request aborted by a fast
          // navigation isn't proof the session is invalid, and wiping a good refresh
          // token over a transient failure is what caused sessions to die for no
          // reason. A confirmed-dead refresh token already clears tokens itself via
          // onSessionExpired below. This just reflects "couldn't confirm" for this
          // page load; the still-present tokens let the next attempt succeed.
          set({ user: null, pets: [], activePet: null, isAuthenticated: false, isHydrating: false })
        }
      })()
    }
    return hydratePromise
  },
}))

// Cached across calls (not store state) so React 18 StrictMode's double-invoked
// mount effect can't race hydrate() into running the network calls twice.
let hydratePromise: Promise<void> | null = null

// The access token can die between requests (refresh token expired/revoked) without
// any component explicitly calling logout() — sync the UI the moment that happens
// instead of leaving it showing a stale "signed in" state until the next reload.
onSessionExpired(() => {
  // Only flag it as a mid-use expiry (redirect-worthy) if the user was actually
  // signed in already — a fresh page load with already-dead stored tokens is just
  // "not logged in," not a session that expired out from under them.
  const wasActivelySignedIn = useAuthStore.getState().isAuthenticated

  clearTokens()
  resetClientState()
  useAuthStore.setState({
    user: null,
    pets: [],
    activePet: null,
    isAuthenticated: false,
    isHydrating: false,
    sessionJustExpired: wasActivelySignedIn,
  })
})
