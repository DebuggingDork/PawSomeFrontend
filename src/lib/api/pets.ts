import { apiFetch } from './client'
import type { Pet, PetCreateInput, PetUpdateInput } from './types'

export function listMyPets(): Promise<Pet[]> {
  return apiFetch<Pet[]>('/pets/me')
}

export function getPet(petId: string): Promise<Pet> {
  return apiFetch<Pet>(`/pets/${petId}`)
}

export function createPet(body: PetCreateInput): Promise<Pet> {
  return apiFetch<Pet>('/pets', { method: 'POST', body })
}

export function updatePet(petId: string, body: PetUpdateInput): Promise<Pet> {
  return apiFetch<Pet>(`/pets/${petId}`, { method: 'PATCH', body })
}

export function deletePet(petId: string): Promise<void> {
  return apiFetch<void>(`/pets/${petId}`, { method: 'DELETE' })
}
