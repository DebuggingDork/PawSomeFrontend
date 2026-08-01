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

/** Routes the bytes through the API rather than the browser's own PUT to R2.
 * See uploadProfilePhoto in users.ts for why this exists. */
export function uploadPetPhoto(petId: string, file: File): Promise<PetPhoto> {
  const form = new FormData()
  form.append('file', file)
  return apiFetch<PetPhoto>(`/pets/${petId}/photos/upload`, { method: 'POST', body: form })
}

/** Step 1 of swapping an existing photo's image in place (same id, primary
 * status, and position — not a delete + re-add). */
export function presignPetPhotoReplace(
  petId: string,
  photoId: string,
  contentType: UploadableContentType,
): Promise<PresignResponse> {
  return apiFetch<PresignResponse>(`/pets/${petId}/photos/${photoId}/replace/presign`, {
    method: 'POST',
    body: { content_type: contentType },
  })
}

export function confirmPetPhotoReplace(petId: string, photoId: string, objectKey: string): Promise<PetPhoto> {
  return apiFetch<PetPhoto>(`/pets/${petId}/photos/${photoId}/replace`, {
    method: 'POST',
    body: { object_key: objectKey },
  })
}

/** Replace routed through the API rather than the browser's own PUT to R2. */
export function uploadPetPhotoReplace(petId: string, photoId: string, file: File): Promise<PetPhoto> {
  const form = new FormData()
  form.append('file', file)
  return apiFetch<PetPhoto>(`/pets/${petId}/photos/${photoId}/replace/upload`, { method: 'POST', body: form })
}

export function setPrimaryPhoto(petId: string, photoId: string): Promise<PetPhoto> {
  return apiFetch<PetPhoto>(`/pets/${petId}/photos/${photoId}/primary`, { method: 'PATCH' })
}

export function deletePetPhoto(petId: string, photoId: string): Promise<void> {
  return apiFetch<void>(`/pets/${petId}/photos/${photoId}`, { method: 'DELETE' })
}
