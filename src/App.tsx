import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router'
import LandingPage from './pages/Landing'
import AuthPage from './pages/Auth'
import RegisterPage from './pages/Register'
import UserDetailsPage from './pages/Onboarding/UserDetails'
import PetDetailsPage from './pages/Onboarding/PetDetails'
import DashboardPage from './pages/Dashboard'
import DiscoverPage from './pages/Discover'
import MatchesPage from './pages/Matches'
import ChatPage from './pages/Chat'
import ProfilePage from './pages/Profile'
import MyPetsPage from './pages/MyPets'
import VerifyEmailPage from './pages/VerifyEmail'
import UserProfilePage from './pages/UserProfile'
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
import { Heart } from 'lucide-react'
import { useState } from 'react'

const HIDE_LANDING_NAV = ['/dashboard', '/auth', '/register', '/onboarding', '/profile', '/my-pets', '/discover', '/matches', '/chat']

function AppLayout() {
  useSmoothScroll()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const hideLandingNav = HIDE_LANDING_NAV.some((p) => location.pathname.startsWith(p))

  const navItems = [
    { name: 'Home', link: '/' },
    { name: 'Discover', link: '/discover' },
    { name: 'Matches', link: '/matches' },
    { name: 'Chat', link: '/chat' },
  ]

  return (
    <>
      <GlobalLoader />

      <div className="min-h-screen bg-neutral-950 text-white">
        {!hideLandingNav && (
          <Navbar>
            {/* Desktop Navigation */}
            <NavBody>
              <Link to="/" className="flex items-center gap-2">
                <img src={logoIcon} alt="PawSome" className="h-10 w-10 drop-shadow-lg" />
                <span
                  className="text-2xl font-bold bg-gradient-to-r from-[#ff6b35] via-[#ff8c5c] to-[#ff6b35] bg-clip-text text-transparent drop-shadow-sm"
                  style={{ fontFamily: 'Pacifico, cursive' }}
                >
                  PawSome
                </span>
              </Link>

              <NavItems items={navItems} />

              <div className="flex items-center gap-3">
                <NavbarButton variant="secondary" as={Link} href="/auth">
                  Sign In
                </NavbarButton>
                <NavbarButton variant="gradient" as={Link} href="/discover">
                  <Heart className="mr-2 inline h-4 w-4" />
                  Find Matches
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
                <MobileNavToggle
                  isOpen={isMobileMenuOpen}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                />
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
                    onClick={() => setIsMobileMenuOpen(false)}
                    variant="secondary"
                    className="w-full"
                    as={Link}
                    href="/auth"
                  >
                    Sign In
                  </NavbarButton>
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
                </div>
              </MobileNavMenu>
            </MobileNav>
          </Navbar>
        )}

        <main className="w-full">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/onboarding/profile" element={<UserDetailsPage />} />
            <Route path="/onboarding/pets" element={<PetDetailsPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/chat/:matchId" element={<ChatPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/my-pets" element={<MyPetsPage />} />
            <Route path="/messages" element={<Navigate to="/matches" replace />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/users/:userId" element={<UserProfilePage />} />
          </Routes>
        </main>
      </div>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

export default App
