import { apiFetch } from './client'
import type { Pet } from './types'

export function listMyPets(): Promise<Pet[]> {
  return apiFetch<Pet[]>('/pets/me')
}

export function getPet(petId: string): Promise<Pet> {
  return apiFetch<Pet>(`/pets/${petId}`)
}
