import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './tokens'

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'

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
        if (!res.ok) return null
        const data = await res.json()
        setTokens(data.access_token, data.refresh_token)
        return data.access_token as string
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

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

  let res = await doFetch()

  if (res.status === 401 && auth && getRefreshToken()) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      res = await doFetch()
    } else {
      clearTokens()
    }
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
