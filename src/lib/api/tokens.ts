/**
 * Access/refresh tokens live outside React state so the fetch client can read
 * and rotate them without importing the zustand store (which depends on the
 * client itself for hydration). localStorage is the single source of truth;
 * useAuthStore mirrors it for render purposes.
 */

const ACCESS_TOKEN_KEY = 'pawsome.accessToken'
const REFRESH_TOKEN_KEY = 'pawsome.refreshToken'

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}
