import { useState } from 'react'
import { Link } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react'
import logoIcon from '@/assets/logo-256.png'
import * as authApi from '@/lib/api/auth'
import { ApiError } from '@/lib/api/client'
import { useLoaderStore } from '@/store/useLoaderStore'

type Step = 'email' | 'otp' | 'password' | 'done'

function ForgotPasswordPage() {
  const { startLoading, stopLoading } = useLoaderStore()

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    startLoading('Sending verification code...')
    
    try {
      await authApi.forgotPasswordOTP(email)
      setStep('otp')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(typeof err.detail === 'string' ? err.detail : 'Something went wrong. Please try again.')
      } else {
        setError('Could not reach the server. Please check your connection.')
      }
    } finally {
      setSubmitting(false)
      stopLoading()
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    startLoading('Verifying code...')
    
    try {
      await authApi.verifyPasswordResetOTP(email, otp)
      setStep('password')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(typeof err.detail === 'string' ? err.detail : 'Invalid code. Please try again.')
      } else {
        setError('Could not reach the server. Please check your connection.')
      }
    } finally {
      setSubmitting(false)
      stopLoading()
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    startLoading('Resetting your password...')
    
    try {
      await authApi.resetPasswordWithOTP(email, otp, password)
      setStep('done')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(typeof err.detail === 'string' ? err.detail : 'Something went wrong. Please try again.')
      } else {
        setError('Could not reach the server. Please check your connection.')
      }
    } finally {
      setSubmitting(false)
      stopLoading()
    }
  }

  const handleResendOTP = async () => {
    setError(null)
    setSubmitting(true)
    startLoading('Resending code...')
    
    try {
      await authApi.forgotPasswordOTP(email)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(typeof err.detail === 'string' ? err.detail : 'Failed to resend code.')
      }
    } finally {
      setSubmitting(false)
      stopLoading()
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/3 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-pink-500/10 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
          {/* Header */}
          <div className="mb-6 flex flex-col items-center text-center">
            {/* Brand mark — the real PawSome logo, given the same treatment as
                the auth page. A gradient tile with a stock paw glyph stood here,
                on the screens where the brand most needs to be recognisable. */}
            <div className="relative mb-4">
              <div className="absolute inset-0 -z-10 scale-125 rounded-full bg-brand/30 blur-xl" />
              <img src={logoIcon} alt="PawSome" className="h-14 w-14 drop-shadow-[0_4px_16px_rgba(255,107,53,0.4)]" />
            </div>
            <h2 className="font-display text-2xl font-bold text-white">
              {step === 'email' && 'Reset your password'}
              {step === 'otp' && 'Enter verification code'}
              {step === 'password' && 'Set new password'}
              {step === 'done' && 'All done!'}
            </h2>
            <p className="mt-1 text-sm text-neutral-400">
              {step === 'email' && "We'll send a verification code to your email"}
              {step === 'otp' && `Check your email at ${email}`}
              {step === 'password' && 'Choose a strong password'}
              {step === 'done' && 'Your password has been reset'}
            </p>
          </div>

          {/* Error message */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forms */}
          <AnimatePresence mode="wait">
            {step === 'email' && (
              <motion.form
                key="email"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSendOTP}
                className="space-y-4"
              >
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 py-3 pl-11 pr-4 text-white placeholder:text-neutral-400 transition-colors focus:border-brand focus:outline-none"
                    required
                    autoComplete="email"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={{ scale: submitting ? 1 : 1.01 }}
                  whileTap={{ scale: submitting ? 1 : 0.99 }}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand to-pink-500 py-3 font-semibold text-white shadow-lg shadow-brand/30 transition-shadow hover:shadow-xl hover:shadow-brand/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  ) : (
                    <>
                      Send Code
                      <ArrowRight className="h-4 w-4 transition-transform hoverable:group-hover:translate-x-0.5" />
                    </>
                  )}
                </motion.button>

                <Link
                  to="/auth"
                  className="flex items-center justify-center gap-2 text-sm text-neutral-400 transition-colors hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </Link>
              </motion.form>
            )}

            {step === 'otp' && (
              <motion.form
                key="otp"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleVerifyOTP}
                className="space-y-4"
              >
                <div>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 py-3 text-center text-2xl font-bold tracking-[0.5em] text-white placeholder:text-neutral-400 transition-colors focus:border-brand focus:outline-none"
                    required
                    maxLength={6}
                    autoComplete="one-time-code"
                  />
                  <p className="mt-2 text-center text-xs text-neutral-400">Enter the 6-digit code from your email</p>
                </div>

                <motion.button
                  type="submit"
                  disabled={submitting || otp.length !== 6}
                  whileHover={{ scale: submitting || otp.length !== 6 ? 1 : 1.01 }}
                  whileTap={{ scale: submitting || otp.length !== 6 ? 1 : 0.99 }}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand to-pink-500 py-3 font-semibold text-white shadow-lg shadow-brand/30 transition-shadow hover:shadow-xl hover:shadow-brand/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  ) : (
                    <>
                      Verify Code
                      <ArrowRight className="h-4 w-4 transition-transform hoverable:group-hover:translate-x-0.5" />
                    </>
                  )}
                </motion.button>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="flex items-center gap-1 text-neutral-400 transition-colors hover:text-white"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Change email
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={submitting}
                    className="text-brand transition-colors hover:text-brand-light disabled:opacity-50"
                  >
                    Resend code
                  </button>
                </div>
              </motion.form>
            )}

            {step === 'password' && (
              <motion.form
                key="password"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleResetPassword}
                className="space-y-4"
              >
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="New password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 py-3 pl-11 pr-11 text-white placeholder:text-neutral-400 transition-colors focus:border-brand focus:outline-none"
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-300"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 py-3 pl-11 pr-4 text-white placeholder:text-neutral-400 transition-colors focus:border-brand focus:outline-none"
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={{ scale: submitting ? 1 : 1.01 }}
                  whileTap={{ scale: submitting ? 1 : 0.99 }}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand to-pink-500 py-3 font-semibold text-white shadow-lg shadow-brand/30 transition-shadow hover:shadow-xl hover:shadow-brand/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  ) : (
                    <>
                      Reset Password
                      <ArrowRight className="h-4 w-4 transition-transform hoverable:group-hover:translate-x-0.5" />
                    </>
                  )}
                </motion.button>
              </motion.form>
            )}

            {step === 'done' && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 py-2 text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <p className="text-sm text-neutral-300">Your password has been reset successfully. You can now sign in with your new password.</p>
                <Link
                  to="/auth"
                  className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-shadow hover:shadow-xl hover:shadow-brand/40"
                >
                  Go to Sign In
                  <ArrowRight className="h-4 w-4 transition-transform hoverable:group-hover:translate-x-0.5" />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

export default ForgotPasswordPage
