/**
 * Access/refresh tokens live outside React state so the fetch client can read
 * and rotate them without importing the zustand store (which depends on the
 * client itself for hydration). localStorage is the single source of truth;
 * useAuthStore mirrors it for render purposes.
 */

const ACCESS_TOKEN_KEY = 'pawsome.accessToken'
const REFRESH_TOKEN_KEY = 'pawsome.refreshToken'

type TokenListener = () => void
const listeners: TokenListener[] = []

/** Notified after every setTokens/clearTokens call, regardless of caller (login page, refresh flow, logout). */
export function onTokensChanged(cb: TokenListener): void {
  listeners.push(cb)
}

function notifyChanged(): void {
  listeners.forEach((cb) => cb())
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  notifyChanged()
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  notifyChanged()
}

/** Decodes the access token's `exp` claim (ms since epoch) without verifying the signature —
 * only used client-side to schedule a proactive refresh, never for trust decisions. */
export function getAccessTokenExpiryMs(): number | null {
  const token = getAccessToken()
  if (!token) return null

  try {
    const payload = token.split('.')[1]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    const { exp } = JSON.parse(json) as { exp?: number }
    return typeof exp === 'number' ? exp * 1000 : null
  } catch {
    return null
  }
}
