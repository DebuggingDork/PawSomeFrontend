import { apiFetch } from './client'
import type { PetPhoto, PresignResponse } from './types'
import type { UploadableContentType } from './upload'

export function presignPetPhoto(petId: string, contentType: UploadableContentType): Promise<PresignResponse> {
  return apiFetch<PresignResponse>(`/pets/${petId}/photos/presign`, {
    method: 'POST',
    body: { content_type: contentType },
  })
}

export function confirmPetPhoto(petId: string, objectKey: string): Promise<PetPhoto> {
  return apiFetch<PetPhoto>(`/pets/${petId}/photos`, {
    method: 'POST',
    body: { object_key: objectKey },
  })
}

export function setPrimaryPhoto(petId: string, photoId: string): Promise<PetPhoto> {
  return apiFetch<PetPhoto>(`/pets/${petId}/photos/${photoId}/primary`, { method: 'PATCH' })
}

export function deletePetPhoto(petId: string, photoId: string): Promise<void> {
  return apiFetch<void>(`/pets/${petId}/photos/${photoId}`, { method: 'DELETE' })
}
