import { BrowserRouter, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import LandingPage from './pages/Landing'
import AuthPage from './pages/Auth'
import ResetPasswordPage from './pages/ResetPassword'
import VerifyEmailPage from './pages/VerifyEmail'
import DiscoverPage from './pages/Discover'
import CommunityPage from './pages/Community'
import AboutPage from './pages/About'
import PetProfilePage from './pages/PetProfile'
import OwnerProfilePage from './pages/OwnerProfile'
import NotFoundPage from './pages/NotFound'
import SessionExpiredPage from './pages/SessionExpired'
import MatchesPage from './pages/Matches'
import EventsPage from './pages/Events'
import ChatPage from './pages/Chat'
import ProfilePage from './pages/Profile'
import OnboardingPage from './pages/Onboarding'
import OfflinePage from './pages/Offline'
import ServerErrorPage from './pages/ServerError'
import MaintenancePage from './pages/Maintenance'
import { getOnboardingStatus } from './lib/api/onboarding'
import { ONBOARDING_DISMISSED_KEY } from './lib/queryClient'
import { onBackendReachable, onBackendUnreachable } from './lib/api/client'
import { getMyProfile } from './lib/api/users'
import { PetAvatar } from './components/chat/PetAvatar'
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
  NavbarButton,
} from './components/ui/resizable-navbar'
import { GlobalLoader } from './components/ui/GlobalLoader'
import { CursorClickEffect } from './components/ui/CursorClickEffect'
// 256px master-derived logo (icon.png is the 1254px original, kept as the source
// art). The full-size file was 828 KB shipped on every page load to render a
// 40px navbar mark — this one is 47 KB.
import logoIcon from './assets/logo-256.png'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import { Heart, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuthStore } from './store/useAuthStore'
import { NotificationBell } from './components/notifications/NotificationBell'
import { NotificationsRuntime } from './components/notifications/NotificationsRuntime'

/** Placeholder for the navbar's auth-dependent controls while session state is still
 * resolving, so we never guess "signed out" and then flash into "signed in" (or vice
 * versa) once hydrate() resolves. */
function NavAuthSkeleton() {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <div className="motion-safe:animate-pulse h-10 w-10 rounded-full bg-white/10" />
      <div className="motion-safe:animate-pulse h-10 w-10 rounded-full bg-white/10" />
    </div>
  )
}

/** Wraps routes that only make sense while signed out (i.e. /auth). Hitting Back
 * after signing in used to land the user right back on the sign-in form while the
 * navbar above it showed them signed in, with a "Sign In" button that would just
 * re-authenticate an already-live session. Signed-in visitors get sent home
 * instead — with `replace`, so Back doesn't bounce them straight back here. */
function GuestOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isHydrating } = useAuthStore()

  // Deciding before the session resolves would flash the form at a signed-in
  // user (or, worse, redirect a genuinely signed-out one). #root stays hidden
  // until hydration settles, so rendering nothing here costs no visible time.
  if (isHydrating) return null
  if (isAuthenticated) return <Navigate to="/" replace />

  return <>{children}</>
}

/** Redirects a freshly-authenticated user into /onboarding once per session until
 * required steps are done.
 *
 * Sign-up itself no longer relies on this: AuthPage routes new accounts straight to
 * /onboarding, because waiting on /onboarding/status here meant a new user landed on
 * Discover first and got pulled away a beat later. This still covers the other way
 * in, signing back into an account whose setup was never finished. */
function OnboardingGate() {
  const { isAuthenticated, isHydrating } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  const { data: status } = useQuery({
    queryKey: ['onboarding', 'status'],
    queryFn: getOnboardingStatus,
    enabled: isAuthenticated && !isHydrating,
    staleTime: 60_000,
  })

  useEffect(() => {
    // The query goes disabled on logout but its last cached result (from while the
    // user WAS signed in) sticks around, so this must re-check auth itself — it used
    // to only "work" because signing out happened to always land on /auth, one of the
    // excluded routes below. Signing out anywhere else would otherwise get hijacked
    // into /onboarding using a stale status for a session that no longer exists.
    if (!isAuthenticated) return
    if (!status?.should_show_wizard) return
    if (sessionStorage.getItem(ONBOARDING_DISMISSED_KEY) === '1') return
    if (location.pathname === '/onboarding' || location.pathname === '/auth') return
    navigate('/onboarding')
  }, [isAuthenticated, status, location.pathname, navigate])

  return null
}

/** Redirects to /session-expired the moment an active session dies mid-use
 * (see useAuthStore's onSessionExpired handler for how the flag gets set). */
function SessionExpiryWatcher() {
  const { sessionJustExpired, clearSessionExpiredFlag } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!sessionJustExpired) return
    clearSessionExpiredFlag()
    navigate('/session-expired')
  }, [sessionJustExpired, clearSessionExpiredFlag, navigate])

  return null
}

function App() {
  useSmoothScroll()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isAuthenticated, isHydrating, hydrate, logout } = useAuthStore()
  const isOnline = useOnlineStatus()
  const [backendUnreachable, setBackendUnreachable] = useState(false)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    onBackendUnreachable(() => setBackendUnreachable(true))
    onBackendReachable(() => setBackendUnreachable(false))
  }, [])

  const { data: myProfile, isLoading: isProfileLoading } = useQuery({
    // Must match the key every other consumer uses (Profile header, Account
    // tab, Onboarding). The navbar had its own ['my-profile'] entry for the
    // same endpoint, so uploading or removing a profile photo invalidated
    // ['users','me'] and left this copy stale — the photo updated on the
    // profile page while the navbar kept showing the old initial.
    queryKey: ['users', 'me'],
    queryFn: getMyProfile,
    enabled: isAuthenticated,
    staleTime: 60_000,
  })

  // While the session is still resolving we show only the links that are the same
  // either way, so the menu can only ever gain items once hydration lands — never
  // swap "About" out for "Discover/Matches/Chat" in front of the user.
  const navItems = [
    { name: 'Home', link: '/' },
    { name: 'Community', link: '/community' },
    // About is only useful as a pitch to visitors who haven't signed up yet.
    ...(isHydrating || isAuthenticated ? [] : [{ name: 'About', link: '/about' }]),
    { name: 'Events', link: '/events' },
    ...(!isHydrating && isAuthenticated
      ? [
          { name: 'Discover', link: '/discover' },
          { name: 'Matches', link: '/matches' },
          { name: 'Chat', link: '/chat' },
        ]
      : []),
  ]

  if (!isOnline) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white">
        <OfflinePage />
      </div>
    )
  }

  if (backendUnreachable) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white">
        <ServerErrorPage />
      </div>
    )
  }

  return (
    <BrowserRouter>
      {/* Global Loader - shows loading states from anywhere in the app */}
      <GlobalLoader />
      <CursorClickEffect />
      <OnboardingGate />
      <SessionExpiryWatcher />
      <NotificationsRuntime />
      
      <div className="min-h-screen w-full max-w-full overflow-x-clip bg-neutral-950 text-white">
        {/* Sticky Navigation Bar — full-bleed translucent glass */}
        <Navbar>
          {/* Desktop Navigation */}
          <NavBody>
            {/* Left: Logo — pinned to the true edge, not a centered column */}
            <Link to="/" className="flex items-center gap-2 justify-self-start">
              <img src={logoIcon} alt="PawSome" className="h-10 w-10 drop-shadow-lg" />
              <span
                className="text-2xl font-bold text-[#ff6b35] drop-shadow-sm"
                style={{ fontFamily: 'Pacifico, cursive' }}
              >
                PawSome
              </span>
            </Link>

            {/* Center: Nav Items */}
            <NavItems items={navItems} />

            {/* Right: notifications / profile / sign out — pinned to the true edge */}
            <div className="flex items-center gap-3 justify-self-end">
              {isHydrating ? (
                <NavAuthSkeleton />
              ) : isAuthenticated ? (
                <>
                  <NotificationBell />
                  {isProfileLoading ? (
                    // The photo comes from a separate /users/me call that isn't part of
                    // hydrate(), so it can still resolve after the navbar is already
                    // shown — a neutral placeholder here avoids the avatar visibly
                    // swapping from a guessed initial to the real photo a beat later.
                    <div className="h-9 w-9 rounded-full bg-white/10 motion-safe:animate-pulse" aria-hidden="true" />
                  ) : (
                    <Link
                      to="/profile"
                      title="Profile"
                      aria-label="Profile"
                      className="rounded-full ring-1 ring-transparent transition-all hover:ring-[#ff6b35]/50"
                    >
                      <PetAvatar name={myProfile?.full_name ?? 'You'} photoUrl={myProfile?.profile_photo_url} size="sm" />
                    </Link>
                  )}
                  <Link
                    to="/"
                    onClick={logout}
                    title="Sign out"
                    aria-label="Sign out"
                    className="flex h-10 w-10 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10 hover:text-[#ff6b35]"
                  >
                    <LogOut className="h-5 w-5" />
                  </Link>
                </>
              ) : (
                <>
                  <NavbarButton variant="secondary" as={Link} href="/auth">
                    Sign In
                  </NavbarButton>
                  <NavbarButton variant="gradient" as={Link} href="/discover">
                    <Heart className="mr-2 inline h-4 w-4" />
                    Find Matches
                  </NavbarButton>
                </>
              )}
            </div>
          </NavBody>

          {/* Mobile Navigation */}
          <MobileNav>
            <MobileNavHeader>
              <Link to="/" className="flex items-center gap-2">
                <img src={logoIcon} alt="PawSome" className="h-10 w-10 drop-shadow-lg" />
                {/* Wordmark drops off on narrow screens — the icon alone is enough
                    to identify the brand once space gets tight. */}
                <span
                  className="hidden min-[420px]:inline-block text-xl font-bold text-[#ff6b35]"
                  style={{ fontFamily: 'Pacifico, cursive' }}
                >
                  PawSome
                </span>
              </Link>
              <div className="flex items-center gap-1">
                {!isHydrating && isAuthenticated && <NotificationBell />}
                <MobileNavToggle
                  isOpen={isMobileMenuOpen}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                />
              </div>
            </MobileNavHeader>

            <MobileNavMenu
              isOpen={isMobileMenuOpen}
              onClose={() => setIsMobileMenuOpen(false)}
            >
              {navItems.map((item, idx) => (
                <Link
                  key={`mobile-link-${idx}`}
                  to={item.link}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="relative text-neutral-600 dark:text-neutral-300"
                >
                  <span className="block text-lg font-medium">{item.name}</span>
                </Link>
              ))}
              {isAuthenticated && (
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="relative text-neutral-600 dark:text-neutral-300"
                >
                  <span className="block text-lg font-medium">Profile</span>
                </Link>
              )}
              <div className="flex w-full flex-col gap-4">
                {isHydrating ? (
                  <>
                    <div className="motion-safe:animate-pulse h-11 w-full rounded-full bg-white/10" />
                    <div className="motion-safe:animate-pulse h-11 w-full rounded-full bg-white/10" />
                  </>
                ) : (
                  <>
                    <NavbarButton
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        if (isAuthenticated) logout()
                      }}
                      variant="secondary"
                      className="w-full"
                      as={Link}
                      href={isAuthenticated ? '/' : '/auth'}
                    >
                      {isAuthenticated ? (
                        <>
                          <LogOut className="mr-2 inline h-4 w-4" />
                          Sign Out
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </NavbarButton>
                    {/* Chat is already listed above as a nav link once signed in —
                        this CTA is only needed to give logged-out visitors a next step. */}
                    {!isAuthenticated && (
                      <NavbarButton
                        onClick={() => setIsMobileMenuOpen(false)}
                        variant="gradient"
                        className="w-full"
                        as={Link}
                        href="/discover"
                      >
                        <Heart className="mr-2 inline h-4 w-4" />
                        Find Matches
                      </NavbarButton>
                    )}
                  </>
                )}
              </div>
            </MobileNavMenu>
          </MobileNav>
        </Navbar>

        {/* Main Content Area */}
        <main className="w-full">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/auth"
              element={
                <GuestOnlyRoute>
                  <AuthPage />
                </GuestOnlyRoute>
              }
            />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/pets/:petId" element={<PetProfilePage />} />
            <Route path="/owners/:userId" element={<OwnerProfilePage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/session-expired" element={<SessionExpiredPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
