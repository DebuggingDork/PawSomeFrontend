import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, PawPrint, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'
import * as authApi from '@/lib/api/auth'
import { ApiError } from '@/lib/api/client'
import { useLoaderStore } from '@/store/useLoaderStore'

function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { startLoading, stopLoading } = useLoaderStore()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!token) {
      setError('This reset link is missing its token. Please request a new one.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    startLoading('Resetting your password...')
    try {
      await authApi.resetPassword(token, password)
      setDone(true)
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
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff6b35] to-pink-500 shadow-lg shadow-[#ff6b35]/30">
              <PawPrint className="h-7 w-7 text-white" fill="white" />
            </div>
            <h2 className="font-display text-2xl font-bold text-white">Set a new password</h2>
            <p className="mt-1 text-sm text-neutral-400">Choose a new password for your account.</p>
          </div>

          {!token && !done && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>
                This link is missing a reset token. Request a new one from the{' '}
                <Link to="/auth" className="font-medium underline">
                  sign-in page
                </Link>
                .
              </span>
            </div>
          )}

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {done ? (
            <div className="flex flex-col items-center gap-4 py-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="text-sm text-neutral-300">Your password has been reset. You can now sign in.</p>
              <button
                type="button"
                onClick={() => navigate('/auth')}
                className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff6b35] to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#ff6b35]/30 transition-shadow hover:shadow-xl hover:shadow-[#ff6b35]/40"
              >
                Go to Sign In
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 py-3 pl-11 pr-11 text-white placeholder:text-neutral-500 transition-colors focus:border-[#ff6b35] focus:outline-none"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  disabled={!token}
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

              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 py-3 pl-11 pr-4 text-white placeholder:text-neutral-500 transition-colors focus:border-[#ff6b35] focus:outline-none"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  disabled={!token}
                />
              </div>

              <motion.button
                type="submit"
                disabled={submitting || !token}
                whileHover={{ scale: submitting || !token ? 1 : 1.01 }}
                whileTap={{ scale: submitting || !token ? 1 : 0.99 }}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff6b35] to-pink-500 py-3 font-semibold text-white shadow-lg shadow-[#ff6b35]/30 transition-shadow hover:shadow-xl hover:shadow-[#ff6b35]/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                ) : (
                  <>
                    Reset Password
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </motion.button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default ResetPasswordPage
