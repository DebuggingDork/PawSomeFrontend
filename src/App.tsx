import { BrowserRouter, Routes, Route, Link } from 'react-router'
import LandingPage from './pages/Landing'
import AuthPage from './pages/Auth'
import DiscoverPage from './pages/Discover'
import MatchesPage from './pages/Matches'
import ChatPage from './pages/Chat'
import ProfilePage from './pages/Profile'
import NavbarTestPage from './pages/NavbarTest'
import { StickyNav } from './components/animations/StickyNav'
import logoIcon from './assets/icon.png'
import { useSmoothScroll } from './hooks/useSmoothScroll'

function App() {
  useSmoothScroll()

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
        {/* Navigation Bar */}
        <StickyNav>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-3 group"
            >
              <img src={logoIcon} alt="PawSome" className="h-12 w-12 drop-shadow-lg" />
              <span className="text-2xl font-medium text-white drop-shadow-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
                PawSome
              </span>
            </Link>
            <nav className="flex items-center space-x-8">
              <Link
                to="/"
                className="text-sm font-medium text-[#ff6b35] hover:text-[#ff8c5c] transition-colors drop-shadow-md"
              >
                Home
              </Link>
              <Link
                to="/discover"
                className="text-sm font-semibold text-white/90 hover:text-[#ff6b35] transition-colors drop-shadow-md"
              >
                Discover
              </Link>
              <Link
                to="/matches"
                className="text-sm font-semibold text-white/90 hover:text-[#ff6b35] transition-colors drop-shadow-md"
              >
                Matches
              </Link>
              <Link
                to="/chat"
                className="text-sm font-semibold text-white/90 hover:text-[#ff6b35] transition-colors drop-shadow-md"
              >
                Chat
              </Link>
              <Link
                to="/profile"
                className="text-sm font-semibold text-white/90 hover:text-[#ff6b35] transition-colors drop-shadow-md"
              >
                Profile
              </Link>
              <Link
                to="/auth"
                className="px-6 py-2 text-sm font-semibold text-white hover:text-[#ff6b35] bg-white/10 hover:bg-white/20 border border-white/40 hover:border-[#ff6b35]/50 rounded-full transition-all backdrop-blur-sm shadow-lg"
              >
                Sign In
              </Link>
            </nav>
          </div>
        </StickyNav>

        {/* Main Content Area */}
        <main className="flex-grow flex flex-col w-full">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/navbar-test" element={<NavbarTestPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
