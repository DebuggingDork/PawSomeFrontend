import { BrowserRouter, Routes, Route, Link } from 'react-router'
import LandingPage from './pages/Landing'
import AuthPage from './pages/Auth'
import DiscoverPage from './pages/Discover'
import MatchesPage from './pages/Matches'
import ChatPage from './pages/Chat'
import ProfilePage from './pages/Profile'
import { StickyNav } from './components/animations/StickyNav'
function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
        {/* Navigation Bar */}
        <StickyNav>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link
              to="/"
              className="text-xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent"
            >
              PawSome
            </Link>
            <nav className="flex space-x-6">
              <Link
                to="/"
                className="text-sm font-medium text-neutral-300 hover:text-white transition-colors"
              >
                Home
              </Link>
              <Link
                to="/discover"
                className="text-sm font-medium text-neutral-300 hover:text-white transition-colors"
              >
                Discover
              </Link>
              <Link
                to="/matches"
                className="text-sm font-medium text-neutral-300 hover:text-white transition-colors"
              >
                Matches
              </Link>
              <Link
                to="/chat"
                className="text-sm font-medium text-neutral-300 hover:text-white transition-colors"
              >
                Chat
              </Link>
              <Link
                to="/profile"
                className="text-sm font-medium text-neutral-300 hover:text-white transition-colors"
              >
                Profile
              </Link>
              <Link
                to="/auth"
                className="text-sm font-medium text-neutral-300 hover:text-white transition-colors"
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
