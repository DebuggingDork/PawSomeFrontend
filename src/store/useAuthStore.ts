import { create } from 'zustand'

export interface User {
  id: string
  name: string
  email: string
}

export interface Pet {
  id: string
  name: string
  breed: string
  photoUrl?: string
}

interface AuthState {
  user: User | null
  activePet: Pet | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
  setActivePet: (pet: Pet | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  activePet: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, activePet: null, isAuthenticated: false }),
  setActivePet: (activePet) => set({ activePet }),
}))
