import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import LandingPage from './pages/Landing'
import AuthPage from './pages/Auth'
import DiscoverPage from './pages/Discover'
import MatchesPage from './pages/Matches'
import ChatPage from './pages/Chat'
import ProfilePage from './pages/Profile'
import OnboardingPage from './pages/Onboarding'
import { getOnboardingStatus } from './lib/api/onboarding'
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
import logoIcon from './assets/icon.png'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { Heart, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuthStore } from './store/useAuthStore'
import { NotificationBell } from './components/notifications/NotificationBell'

/** Redirects a freshly-authenticated user into /onboarding once per session until required steps are done. */
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
    if (!status?.should_show_wizard) return
    if (sessionStorage.getItem('onboarding-dismissed') === '1') return
    if (location.pathname === '/onboarding' || location.pathname === '/auth') return
    navigate('/onboarding')
  }, [status, location.pathname, navigate])

  return null
}

function App() {
  useSmoothScroll()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isAuthenticated, hydrate, logout } = useAuthStore()

  useEffect(() => {
    hydrate()
  }, [hydrate])

  const navItems = [
    { name: 'Home', link: '/' },
    { name: 'Discover', link: '/discover' },
    { name: 'Matches', link: '/matches' },
    { name: 'Chat', link: '/chat' },
  ]

  return (
    <BrowserRouter>
      {/* Global Loader - shows loading states from anywhere in the app */}
      <GlobalLoader />
      <OnboardingGate />
      
      <div className="min-h-screen bg-neutral-950 text-white">
        {/* Resizable Glassmorphic Navigation Bar - Fixed overlay */}
        <Navbar>
          {/* Desktop Navigation */}
          <NavBody>
            {/* Left: Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img src={logoIcon} alt="PawSome" className="h-10 w-10 drop-shadow-lg" />
              <span
                className="text-2xl font-bold bg-gradient-to-r from-[#ff6b35] via-[#ff8c5c] to-[#ff6b35] bg-clip-text text-transparent drop-shadow-sm"
                style={{ fontFamily: 'Pacifico, cursive' }}
              >
                PawSome
              </span>
            </Link>

            {/* Center: Nav Items */}
            <NavItems items={navItems} />

            {/* Right: Buttons */}
            <div className="flex items-center gap-3">
              {isAuthenticated && <NotificationBell />}
              {isAuthenticated ? (
                <NavbarButton variant="secondary" onClick={logout} as={Link} href="/auth">
                  <LogOut className="mr-2 inline h-4 w-4" />
                  Sign Out
                </NavbarButton>
              ) : (
                <NavbarButton variant="secondary" as={Link} href="/auth">
                  Sign In
                </NavbarButton>
              )}
              <NavbarButton variant="gradient" as={Link} href={isAuthenticated ? '/chat' : '/discover'}>
                <Heart className="mr-2 inline h-4 w-4" />
                {isAuthenticated ? 'My Chats' : 'Find Matches'}
              </NavbarButton>
            </div>
          </NavBody>

          {/* Mobile Navigation */}
          <MobileNav>
            <MobileNavHeader>
              <Link to="/" className="flex items-center gap-2">
                <img src={logoIcon} alt="PawSome" className="h-10 w-10 drop-shadow-lg" />
                <span
                  className="text-xl font-bold bg-gradient-to-r from-[#ff6b35] via-[#ff8c5c] to-[#ff6b35] bg-clip-text text-transparent"
                  style={{ fontFamily: 'Pacifico, cursive' }}
                >
                  PawSome
                </span>
              </Link>
              <div className="flex items-center gap-1">
                {isAuthenticated && <NotificationBell />}
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
              <div className="flex w-full flex-col gap-4">
                <NavbarButton
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    if (isAuthenticated) logout()
                  }}
                  variant="secondary"
                  className="w-full"
                  as={Link}
                  href="/auth"
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
                <NavbarButton
                  onClick={() => setIsMobileMenuOpen(false)}
                  variant="gradient"
                  className="w-full"
                  as={Link}
                  href={isAuthenticated ? '/chat' : '/discover'}
                >
                  <Heart className="mr-2 inline h-4 w-4" />
                  {isAuthenticated ? 'My Chats' : 'Find Matches'}
                </NavbarButton>
              </div>
            </MobileNavMenu>
          </MobileNav>
        </Navbar>

        {/* Main Content Area */}
        <main className="w-full">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
