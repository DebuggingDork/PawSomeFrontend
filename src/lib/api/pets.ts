import { apiFetch } from './client'
import type { Pet, PetCreateInput, PetUpdateInput } from './types'

export interface BrowsePetsParams {
  species?: 'dog' | 'cat'
  gender?: 'male' | 'female'
  breed?: string
  limit?: number
  offset?: number
}

export interface PetListResponse {
  items: Pet[]
  total: number
  limit: number
  offset: number
}

export function browsePets(params?: BrowsePetsParams): Promise<PetListResponse> {
  const query = new URLSearchParams()
  if (params?.species) query.append('species', params.species)
  if (params?.gender) query.append('gender', params.gender)
  if (params?.breed) query.append('breed', params.breed)
  if (params?.limit) query.append('limit', params.limit.toString())
  if (params?.offset) query.append('offset', params.offset.toString())
  
  const queryString = query.toString()
  return apiFetch<PetListResponse>(`/pets${queryString ? `?${queryString}` : ''}`)
}

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
