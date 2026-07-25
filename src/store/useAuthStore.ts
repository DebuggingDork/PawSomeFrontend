import { create } from 'zustand'
import { clearTokens, getAccessToken } from '@/lib/api/tokens'
import { onSessionExpired } from '@/lib/api/client'
import { me } from '@/lib/api/auth'
import { listMyPets } from '@/lib/api/pets'
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

  login: (user, pets) =>
    set({
      user,
      pets,
      activePet: pets[0] ?? null,
      isAuthenticated: true,
      isHydrating: false,
    }),

  logout: () => {
    clearTokens()
    set({ user: null, pets: [], activePet: null, isAuthenticated: false })
  },

  setActivePet: (activePet) => set({ activePet }),

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
  useAuthStore.setState({
    user: null,
    pets: [],
    activePet: null,
    isAuthenticated: false,
    isHydrating: false,
    sessionJustExpired: wasActivelySignedIn,
  })
})
