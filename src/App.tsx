import { BrowserRouter, Routes, Route, Link } from 'react-router'
import LandingPage from './pages/Landing'
import AuthPage from './pages/Auth'
import DiscoverPage from './pages/Discover'
import MatchesPage from './pages/Matches'
import ChatPage from './pages/Chat'
import ProfilePage from './pages/Profile'
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
import logoIcon from './assets/icon.png'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { Heart } from 'lucide-react'
import { useState } from 'react'

function App() {
  useSmoothScroll()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { name: 'Home', link: '/' },
    { name: 'Discover', link: '/discover' },
    { name: 'Matches', link: '/matches' },
    { name: 'Chat', link: '/chat' },
  ]

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-neutral-950 text-white">
        {/* Main Content Area with Navbar Overlay */}
        <main className="relative w-full">
          {/* Resizable Glassmorphic Navigation Bar - Overlays content */}
          <Navbar>
            {/* Desktop Navigation */}
            <NavBody>
              <Link to="/" className="relative z-20 flex items-center gap-2 px-2 py-1">
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

          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
