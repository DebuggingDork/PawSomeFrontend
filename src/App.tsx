import { BrowserRouter, Routes, Route, Link } from 'react-router'
import LandingPage from './pages/Landing'
import AuthPage from './pages/Auth'
import DiscoverPage from './pages/Discover'
import MatchesPage from './pages/Matches'
import ChatPage from './pages/Chat'
import ProfilePage from './pages/Profile'
import pawsomeLogo from './assets/pawsomeLogo.svg'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans">
        {/* Navigation Bar */}
        <header className="border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img
                src={pawsomeLogo}
                alt="PawSome Logo"
                className="w-8 h-8 invert"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
                PawSome
              </span>
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
                className="px-4 py-2 text-sm font-semibold bg-pink-500 hover:bg-pink-600 text-white rounded-xl transition-all shadow-lg shadow-pink-500/10 cursor-pointer"
              >
                Sign In
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-grow">
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
