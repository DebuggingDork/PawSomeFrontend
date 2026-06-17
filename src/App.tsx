import { BrowserRouter, Routes, Route, Link } from 'react-router'
import LandingPage from './pages/Landing'
import AuthPage from './pages/Auth'
import DiscoverPage from './pages/Discover'
import MatchesPage from './pages/Matches'
import ChatPage from './pages/Chat'
import ProfilePage from './pages/Profile'
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
              className="flex items-center gap-3"
            >
              <img src={logoIcon} alt="PawSome" className="h-12 w-12" />
              <span className="text-2xl font-medium text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                PawSome
              </span>
            </Link>
            <nav className="flex items-center space-x-8">
              <Link
                to="/"
                className="text-sm font-medium text-[#ff6b35] hover:text-[#ff5722] transition-colors"
              >
                Home
              </Link>
              <Link
                to="/discover"
                className="text-sm font-medium text-white hover:text-[#ff6b35] transition-colors"
              >
                Discover
              </Link>
              <Link
                to="/matches"
                className="text-sm font-medium text-white hover:text-[#ff6b35] transition-colors"
              >
                Matches
              </Link>
              <Link
                to="/chat"
                className="text-sm font-medium text-white hover:text-[#ff6b35] transition-colors"
              >
                Chat
              </Link>
              <Link
                to="/profile"
                className="text-sm font-medium text-white hover:text-[#ff6b35] transition-colors"
              >
                Profile
              </Link>
              <Link
                to="/auth"
                className="px-6 py-2 text-sm font-medium text-white hover:text-[#ff6b35] border border-white/30 hover:border-[#ff6b35] rounded-full transition-colors"
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
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
