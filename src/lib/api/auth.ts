import { apiFetch } from './client'
import type { TokenResponse, UserResponse } from './types'

export function login(email: string, password: string): Promise<TokenResponse> {
  return apiFetch<TokenResponse>('/auth/login', {
    method: 'POST',
    auth: false,
    body: { email, password },
  })
}

export function register(email: string, password: string): Promise<TokenResponse> {
  return apiFetch<TokenResponse>('/auth/register', {
    method: 'POST',
    auth: false,
    body: { email, password },
  })
}

export function me(): Promise<UserResponse> {
  return apiFetch<UserResponse>('/auth/me')
}

export function logout(refreshToken: string): Promise<void> {
  return apiFetch<void>('/auth/logout', {
    method: 'POST',
    body: { refresh_token: refreshToken },
  })
}

export function resendVerification(email: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/auth/resend-verification', {
    method: 'POST',
    auth: false,
    body: { email },
  })
}

export function forgotPassword(email: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    auth: false,
    body: { email },
  })
}

export function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    auth: false,
    body: { token, new_password: newPassword },
  })
}
