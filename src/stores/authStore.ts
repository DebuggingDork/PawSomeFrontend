import { create } from "zustand";
import { api, setTokens, clearTokens } from "@/lib/api";

interface AuthUser {
  id: string;
  email: string;
  is_verified: boolean;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;

  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: localStorage.getItem("pawsome_access_token"),
  isAuthenticated: !!localStorage.getItem("pawsome_access_token"),

  loadFromStorage: () => {
    const token = localStorage.getItem("pawsome_access_token");
    set({ accessToken: token, isAuthenticated: !!token });
  },

  register: async (email, password) => {
    const data = await api.post<{
      access_token: string;
      refresh_token: string;
    }>("/auth/register", { email, password }, { auth: false });

    setTokens(data.access_token, data.refresh_token);
    set({ accessToken: data.access_token, isAuthenticated: true });
  },

  login: async (email, password) => {
    const data = await api.post<{
      access_token: string;
      refresh_token: string;
    }>("/auth/login", { email, password }, { auth: false });

    setTokens(data.access_token, data.refresh_token);
    set({ accessToken: data.access_token, isAuthenticated: true });

    const user = await api.get<AuthUser>("/auth/me");
    set({ user });
  },

  logout: async () => {
    const refresh = localStorage.getItem("pawsome_refresh_token");
    if (refresh) {
      await api.post("/auth/logout", { refresh_token: refresh }).catch(() => {});
    }
    clearTokens();
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
}));
