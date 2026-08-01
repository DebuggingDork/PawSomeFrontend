import { apiFetch } from './client'
import type {
  MatchPreferences,
  MatchPreferencesUpdateInput,
  PresignResponse,
  ProfileCompletionStatus,
  UserProfile,
  UserProfileUpdateInput,
} from './types'
import type { UploadableContentType } from './upload'

export function getMyProfile(): Promise<UserProfile> {
  return apiFetch<UserProfile>('/users/me')
}

export function updateMyProfile(body: UserProfileUpdateInput): Promise<UserProfile> {
  return apiFetch<UserProfile>('/users/me', { method: 'PATCH', body })
}

export function getProfileCompletion(): Promise<ProfileCompletionStatus> {
  return apiFetch<ProfileCompletionStatus>('/users/me/completion')
}

export function getUserProfile(userId: string): Promise<UserProfile> {
  return apiFetch<UserProfile>(`/users/${userId}`)
}

export function presignProfilePhoto(contentType: UploadableContentType): Promise<PresignResponse> {
  return apiFetch<PresignResponse>('/users/me/photo/presign', {
    method: 'POST',
    body: { content_type: contentType },
  })
}

/**
 * Uploads the photo through the API instead of straight to R2.
 *
 * The presign + PUT pair above is the fast path and stays the default — it
 * keeps the bytes off our server. This is what PhotoUploader falls back to
 * when the browser could not deliver them to R2 itself, which on a phone is
 * usually the bucket's CORS allowlist not naming that origin. Adding a photo
 * is a required onboarding step, so this path is the difference between a
 * slower upload and an account that cannot be finished.
 */
export function uploadProfilePhoto(file: File): Promise<UserProfile> {
  const form = new FormData()
  form.append('file', file)
  return apiFetch<UserProfile>('/users/me/photo/upload', { method: 'POST', body: form })
}

export function confirmProfilePhoto(objectKey: string): Promise<UserProfile> {
  return apiFetch<UserProfile>('/users/me/photo', {
    method: 'POST',
    body: { object_key: objectKey },
  })
}

export function deleteProfilePhoto(): Promise<void> {
  return apiFetch<void>('/users/me/photo', { method: 'DELETE' })
}

export function updateMatchPreferences(body: MatchPreferencesUpdateInput): Promise<MatchPreferences> {
  return apiFetch<MatchPreferences>('/users/me/match-preferences', { method: 'PUT', body })
}
