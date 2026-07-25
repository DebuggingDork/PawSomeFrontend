import { clearTokens, getAccessToken, getAccessTokenExpiryMs, getRefreshToken, onTokensChanged, setTokens } from './tokens'

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'

type SessionExpiredListener = () => void
const sessionExpiredListeners: SessionExpiredListener[] = []

/** Fired when the refresh token itself turns out to be dead — the caller (useAuthStore)
 * uses this to flip isAuthenticated immediately instead of leaving stale UI state around
 * until the next hard reload notices via hydrate(). */
export function onSessionExpired(cb: SessionExpiredListener): void {
  sessionExpiredListeners.push(cb)
}

function notifySessionExpired(): void {
  sessionExpiredListeners.forEach((cb) => cb())
}

type ConnectivityListener = () => void
const backendUnreachableListeners: ConnectivityListener[] = []
const backendReachableListeners: ConnectivityListener[] = []

/** Fired when a request fails at the network level (not just a 4xx/5xx response)
 * while the browser itself reports being online — i.e. the internet is fine but
 * our API isn't answering. Distinct from useOnlineStatus, which only tracks the
 * browser's own connectivity. */
export function onBackendUnreachable(cb: ConnectivityListener): void {
  backendUnreachableListeners.push(cb)
}

/** Fired after any request that actually reaches the server (any HTTP status),
 * so the UI can clear a previously-shown "server unreachable" state. */
export function onBackendReachable(cb: ConnectivityListener): void {
  backendReachableListeners.push(cb)
}

// Require a couple of consecutive network-level failures before declaring the
// backend unreachable — a single flaky request (e.g. one background poll)
// shouldn't take over the whole app with a full-page error.
const UNREACHABLE_THRESHOLD = 2
let consecutiveFailures = 0

function notifyBackendUnreachable(): void {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return // useOnlineStatus already covers this case

  consecutiveFailures += 1
  if (consecutiveFailures >= UNREACHABLE_THRESHOLD) {
    backendUnreachableListeners.forEach((cb) => cb())
  }
}

function notifyBackendReachable(): void {
  consecutiveFailures = 0
  backendReachableListeners.forEach((cb) => cb())
}

export class ApiError extends Error {
  status: number
  detail: unknown

  constructor(status: number, detail: unknown) {
    super(typeof detail === 'string' ? detail : `Request failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

let refreshPromise: Promise<string | null> | null = null

/** Exchanges the refresh token for a new pair. Coalesces concurrent 401s into one call. */
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) {
          // The server itself rejected the refresh token — the session is actually dead.
          clearTokens()
          notifySessionExpired()
          return null
        }
        const data = await res.json()
        setTokens(data.access_token, data.refresh_token)
        return data.access_token as string
      })
      .catch(() => {
        // fetch() itself threw — offline, backend unreachable, or the request got
        // aborted (e.g. a navigation firing mid-flight). That's not proof the refresh
        // token is invalid, so don't destroy it: a transient blip shouldn't sign
        // someone out. Whatever triggered this call just fails for now and can retry.
        return null
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

const PROACTIVE_REFRESH_MARGIN_MS = 60_000
let proactiveRefreshTimer: ReturnType<typeof setTimeout> | null = null

/** Refreshes ~60s before the access token actually expires, so a normal browsing
 * session never hits a reactive 401 in the first place. Rescheduled on every
 * token change (login, rotation, or logout — where it just clears the timer). */
function scheduleProactiveRefresh(): void {
  if (proactiveRefreshTimer) {
    clearTimeout(proactiveRefreshTimer)
    proactiveRefreshTimer = null
  }

  const expiryMs = getAccessTokenExpiryMs()
  if (expiryMs == null) return

  const delay = expiryMs - Date.now() - PROACTIVE_REFRESH_MARGIN_MS
  if (delay <= 0) {
    void refreshAccessToken()
    return
  }
  proactiveRefreshTimer = setTimeout(() => void refreshAccessToken(), delay)
}

onTokensChanged(scheduleProactiveRefresh)
scheduleProactiveRefresh()

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  /** Skip the Authorization header (e.g. login/register). */
  auth?: boolean
}

/** JSON fetch wrapper: attaches the bearer token, retries once after a silent refresh on 401. */
export async function apiFetch<T>(
  path: string,
  { body, auth = true, headers, ...rest }: RequestOptions = {},
): Promise<T> {
  const doFetch = async (): Promise<Response> => {
    const finalHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(headers as Record<string, string> | undefined),
    }

    if (auth) {
      const token = getAccessToken()
      if (token) finalHeaders.Authorization = `Bearer ${token}`
    }

    return fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  }

  const trackedFetch = async (): Promise<Response> => {
    try {
      const response = await doFetch()
      notifyBackendReachable()
      return response
    } catch (err) {
      notifyBackendUnreachable()
      throw err
    }
  }

  let res = await trackedFetch()

  if (res.status === 401 && auth && getRefreshToken()) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      res = await trackedFetch()
    }
    // else: refreshAccessToken() already cleared tokens and fired onSessionExpired
  }

  if (!res.ok) {
    let detail: unknown = null
    try {
      detail = (await res.json()).detail
    } catch {
      // response had no JSON body
    }
    throw new ApiError(res.status, detail ?? res.statusText)
  }

  if (res.status === 204) return undefined as T

  return (await res.json()) as T
}
