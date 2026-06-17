import { useState } from 'react'
import { useLoaderStore } from '@/store/useLoaderStore'

function AuthPage() {
  const { startLoading, stopLoading } = useLoaderStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    startLoading('Signing you in...')
    
    // Simulate API call
    setTimeout(() => {
      stopLoading()
      // Navigate to discover page after successful login
      // navigate('/discover')
    }, 2000)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-md">
        <h2 className="text-3xl font-bold mb-2 text-center">Sign In to PawSome</h2>
        <p className="text-neutral-400 text-center mb-8">
          Find the perfect breeding match for your pet.
        </p>
        
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg focus:outline-none focus:border-orange-500"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg focus:outline-none focus:border-orange-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}

export default AuthPage
