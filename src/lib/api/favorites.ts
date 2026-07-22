import { apiFetch } from './client'
import type { Favorite } from './types'

export interface FavoriteListResponse {
  items: Favorite[]
  total: number
  limit: number
  offset: number
}

export function addFavorite(petId: string, targetPetId: string): Promise<{ id: string }> {
  return apiFetch<{ id: string }>('/favorites', {
    method: 'POST',
    body: { pet_id: petId, target_pet_id: targetPetId },
  })
}

export function listFavorites(petId: string, limit = 50, offset = 0): Promise<FavoriteListResponse> {
  return apiFetch<FavoriteListResponse>(`/favorites?pet_id=${petId}&limit=${limit}&offset=${offset}`)
}

export function removeFavorite(favoriteId: string): Promise<void> {
  return apiFetch<void>(`/favorites/${favoriteId}`, { method: 'DELETE' })
}
