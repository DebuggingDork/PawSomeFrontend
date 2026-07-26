import { apiFetch } from './client'
import type { SendCodeResponse, TokenResponse, UserResponse } from './types'

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

export function verifyEmail(token: string): Promise<UserResponse> {
  return apiFetch<UserResponse>('/auth/verify-email', {
    method: 'POST',
    auth: false,
    body: { token },
  })
}

export function resendVerification(email: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/auth/resend-verification', {
    method: 'POST',
    auth: false,
    body: { email },
  })
}

/** Mails a fresh 6-digit code to the signed-in user. Authenticated rather than
 * email-keyed so it can't be pointed at an address the caller doesn't own. */
export function sendVerificationCode(): Promise<SendCodeResponse> {
  return apiFetch<SendCodeResponse>('/auth/send-verification-code', { method: 'POST' })
}

export function verifyCode(code: string): Promise<UserResponse> {
  return apiFetch<UserResponse>('/auth/verify-code', {
    method: 'POST',
    body: { code },
  })
}

export function forgotPassword(email: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    auth: false,
    body: { email },
  })
}

export function forgotPasswordOTP(email: string): Promise<SendCodeResponse> {
  return apiFetch<SendCodeResponse>('/auth/forgot-password-otp', {
    method: 'POST',
    auth: false,
    body: { email },
  })
}

export function verifyPasswordResetOTP(email: string, code: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/auth/verify-password-reset-otp', {
    method: 'POST',
    auth: false,
    body: { email, code },
  })
}

export function resetPasswordWithOTP(email: string, code: string, newPassword: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/auth/reset-password-with-otp', {
    method: 'POST',
    auth: false,
    body: { email, code, new_password: newPassword },
  })
}

export function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    auth: false,
    body: { token, new_password: newPassword },
  })
}
