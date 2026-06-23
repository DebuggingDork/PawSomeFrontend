const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL as string;

function getTokens() {
  return {
    access: localStorage.getItem("pawsome_access_token"),
    refresh: localStorage.getItem("pawsome_refresh_token"),
  };
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem("pawsome_access_token", access);
  localStorage.setItem("pawsome_refresh_token", refresh);
}

export function clearTokens() {
  localStorage.removeItem("pawsome_access_token");
  localStorage.removeItem("pawsome_refresh_token");
}

async function refreshAccessToken(): Promise<string | null> {
  const { refresh } = getTokens();
  if (!refresh) return null;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    });

    if (!res.ok) {
      clearTokens();
      return null;
    }

    const data = await res.json();
    setTokens(data.access_token, data.refresh_token);
    return data.access_token;
  } catch {
    return null;
  }
}

interface RequestOptions extends RequestInit {
  auth?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, headers = {}, ...rest } = options;
  const { access } = getTokens();

  const buildHeaders = (token: string | null): HeadersInit => ({
    "Content-Type": "application/json",
    ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
    ...(headers as Record<string, string>),
  });

  let res = await fetch(`${BASE_URL}${path}`, {
    headers: buildHeaders(access),
    ...rest,
  });

  if (res.status === 401 && auth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await fetch(`${BASE_URL}${path}`, {
        headers: buildHeaders(newToken),
        ...rest,
      });
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    const detail = err.detail;
    const message = Array.isArray(detail)
      ? detail.map((e: { loc?: string[]; msg: string }) =>
          `${e.loc?.slice(1).join(".") ?? "field"}: ${e.msg}`
        ).join(" | ")
      : (typeof detail === "string" ? detail : "Request failed");
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { method: "GET", ...options }),

  post: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body), ...options }),

  patch: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body), ...options }),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { method: "DELETE", ...options }),

  uploadToR2: (uploadUrl: string, file: File) =>
    fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    }),
};
