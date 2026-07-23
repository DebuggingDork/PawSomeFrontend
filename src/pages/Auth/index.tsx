import { useState } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, PawPrint, AlertCircle, ArrowRight } from 'lucide-react'
import { useLoaderStore } from '@/store/useLoaderStore'
import { useAuthStore } from '@/store/useAuthStore'
import * as authApi from '@/lib/api/auth'
import * as petsApi from '@/lib/api/pets'
import { setTokens } from '@/lib/api/tokens'
import { ApiError } from '@/lib/api/client'
import { PillTabs } from '@/components/ui/PillTabs'

type Mode = 'signin' | 'signup'

function AuthPage() {
  const navigate = useNavigate()
  const { startLoading, stopLoading } = useLoaderStore()
  const login = useAuthStore((s) => s.login)

  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isSignUp = mode === 'signup'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    startLoading(isSignUp ? 'Creating your account...' : 'Signing you in...')

    try {
      const tokens = isSignUp
        ? await authApi.register(email, password)
        : await authApi.login(email, password)
      setTokens(tokens.access_token, tokens.refresh_token)

      const [user, pets] = await Promise.all([authApi.me(), petsApi.listMyPets()])
      login(user, pets)

      navigate(pets.length > 0 ? '/chat' : '/discover')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(typeof err.detail === 'string' ? err.detail : 'Something went wrong. Please try again.')
      } else {
        setError('Could not reach the server. Is the backend running?')
      }
    } finally {
      setSubmitting(false)
      stopLoading()
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/3 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff6b35]/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-pink-500/10 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
          {/* Brand mark */}
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff6b35] to-pink-500 shadow-lg shadow-[#ff6b35]/30">
              <PawPrint className="h-7 w-7 text-white" fill="white" />
            </div>
            <h2 className="font-display text-2xl font-bold text-white">
              {isSignUp ? 'Join PawSome' : 'Welcome back'}
            </h2>
            <p className="mt-1 text-sm text-neutral-400">
              {isSignUp
                ? 'Create an account to find your pet a perfect match.'
                : 'Sign in to continue the search for a match.'}
            </p>
          </div>

          {/* Mode switcher */}
          <div className="mb-6 flex justify-center">
            <PillTabs
              layoutId="auth-mode-pill"
              active={mode}
              onChange={(m) => {
                setMode(m)
                setError(null)
              }}
              tabs={[
                { key: 'signin', label: 'Sign In' },
                { key: 'signup', label: 'Create Account' },
              ]}
            />
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 flex items-start gap-2 overflow-hidden rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 py-3 pl-11 pr-4 text-white placeholder:text-neutral-500 transition-colors focus:border-[#ff6b35] focus:outline-none"
                required
                autoComplete="email"
              />
            </div>

            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 py-3 pl-11 pr-11 text-white placeholder:text-neutral-500 transition-colors focus:border-[#ff6b35] focus:outline-none"
                required
                minLength={8}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: submitting ? 1 : 1.01 }}
              whileTap={{ scale: submitting ? 1 : 0.99 }}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff6b35] to-pink-500 py-3 font-semibold text-white shadow-lg shadow-[#ff6b35]/30 transition-shadow hover:shadow-xl hover:shadow-[#ff6b35]/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </motion.button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-neutral-500">
          By continuing you agree to PawSome's Terms of Use and Privacy Policy.
        </p>
      </motion.div>
    </div>
  )
}

export default AuthPage
