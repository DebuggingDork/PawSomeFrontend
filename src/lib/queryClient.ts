import { QueryClient } from '@tanstack/react-query'
import { useDiscoverStore, DEFAULT_BROWSE_FILTERS } from '@/store/useDiscoverStore'

/** The app's single QueryClient.
 *
 * It lives here rather than inside main.tsx so non-React code — chiefly the auth
 * store — can reach it. Every cached entry is scoped to whoever was signed in when
 * it was fetched, so the moment the signed-in identity changes the cache has to be
 * thrown away; that happens in useAuthStore, which is not a component and so cannot
 * call useQueryClient(). */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data doesn't need to be re-fetched from scratch every time a route is revisited —
      // this was making page-to-page navigation feel slow for no reason.
      staleTime: 30_000,
      // The default of 3 retries with backoff turns a real failure (e.g. an expired
      // session) into several extra seconds of visible hanging before anything settles.
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

/** Marks that this tab has already steered the user towards onboarding once,
 * whether they were auto-redirected into it or chose "Skip for now" on their way
 * out. Set once, it stops the wizard being offered again for the rest of the
 * session.
 *
 * Per-tab, not per-account, so it must be cleared whenever the signed-in identity
 * changes — otherwise one user's skip silently swallows the next user's
 * onboarding. */
export const ONBOARDING_PROMPTED_KEY = 'onboarding-prompted'

/** Wipes every trace of the previous session from client-side caches.
 *
 * Called on sign-in, sign-up and sign-out. Without it the React Query cache survives
 * the identity change and the app renders the *previous* account: the navbar avatar,
 * the profile page and the onboarding status all read from ['users','me'] /
 * ['onboarding','status'] entries fetched for someone else, and only a full page
 * reload (which drops the in-memory cache) showed the real one. */
export function resetClientState() {
  queryClient.clear()
  sessionStorage.removeItem(ONBOARDING_PROMPTED_KEY)
  // Where the previous account had got to in Discover describes pets that account
  // was shown, keyed to its pet id. Carrying it into the next session on this tab
  // would restore one user's browsing position over another user's deck.
  useDiscoverStore.setState({
    deckKey: null,
    order: null,
    filters: DEFAULT_BROWSE_FILTERS,
    tab: 'discover',
  })
}
