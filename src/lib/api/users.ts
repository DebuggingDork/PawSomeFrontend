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
