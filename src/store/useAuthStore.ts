import { create } from 'zustand'
import { clearTokens, getAccessToken } from '@/lib/api/tokens'
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
  login: (user: User, pets: Pet[]) => void
  logout: () => void
  setActivePet: (pet: Pet | null) => void
  /** Resumes a session from a persisted access token on app boot. Safe to call once. */
  hydrate: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  pets: [],
  activePet: null,
  isAuthenticated: false,
  isHydrating: true,

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

  hydrate: async () => {
    if (!get().isHydrating) return

    const token = getAccessToken()
    if (!token) {
      set({ isHydrating: false })
      return
    }

    try {
      const [user, pets] = await Promise.all([me(), listMyPets()])
      set({ user, pets, activePet: pets[0] ?? null, isAuthenticated: true, isHydrating: false })
    } catch {
      clearTokens()
      set({ user: null, pets: [], activePet: null, isAuthenticated: false, isHydrating: false })
    }
  },
}))
