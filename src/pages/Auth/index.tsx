import { useState } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  CalendarHeart,
} from 'lucide-react'
import { useLoaderStore } from '@/store/useLoaderStore'
import { useAuthStore } from '@/store/useAuthStore'
import * as authApi from '@/lib/api/auth'
import * as petsApi from '@/lib/api/pets'
import { setTokens } from '@/lib/api/tokens'
import { ApiError } from '@/lib/api/client'
import { PillTabs } from '@/components/ui/PillTabs'
import { POST_LOGIN_ROUTE } from '@/lib/routes'
import logoIcon from '@/assets/logo-256.png'
import { siteImages } from '@/lib/siteImages'

type Mode = 'signin' | 'signup' | 'forgot'

const PANEL_FEATURES = [
  { icon: MapPin, title: 'Matches near you', copy: 'Discover pets and parents in your neighborhood.' },
  { icon: ShieldCheck, title: 'Verified & safe', copy: 'Every profile is checked so you can relax.' },
  { icon: CalendarHeart, title: 'Real playdates', copy: 'Turn a match into a walk in the park — literally.' },
]

function AuthPage() {
  const navigate = useNavigate()
  const { startLoading, stopLoading } = useLoaderStore()
  const login = useAuthStore((s) => s.login)
  const shouldReduceMotion = useReducedMotion()

  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const isSignUp = mode === 'signup'
  const isForgot = mode === 'forgot'

  // Only complain once there's something to compare against — nagging while the
  // second field is still being typed is noise, not help.
  const passwordsMismatch = isSignUp && confirmPassword.length > 0 && confirmPassword !== password

  const switchMode = (m: Mode) => {
    setMode(m)
    setError(null)
    setResetSent(false)
    setConfirmPassword('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (isSignUp && password !== confirmPassword) {
      setError("Those passwords don't match. Please re-enter them.")
      return
    }

    setSubmitting(true)

    if (isForgot) {
      startLoading('Sending reset link...')
      try {
        await authApi.forgotPassword(email)
        setResetSent(true)
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
      return
    }

    startLoading(isSignUp ? 'Creating your account...' : 'Signing you in...')

    try {
      const tokens = isSignUp
        ? await authApi.register(email, password)
        : await authApi.login(email, password)
      setTokens(tokens.access_token, tokens.refresh_token)

      const [user, pets] = await Promise.all([authApi.me(), petsApi.listMyPets()])
      // Clears the previous session's query cache before anything can render with it.
      login(user, pets)

      // A brand-new account has no name, no photo and no pet, so onboarding is the
      // only screen that makes sense next. We route there explicitly instead of
      // leaving it to OnboardingGate: the gate has to wait on /onboarding/status
      // before it can decide, which meant a new user landed on Discover first and
      // got yanked away a moment later.
      //
      // Everyone else goes to Discover. Signing in used to drop anyone with a pet
      // into /chat, which opens on an empty "pick a match" pane unless they
      // already have conversations. Discover is the thing you came back to do.
      //
      // `replace` so the sign-in screen drops out of the history stack entirely —
      // pressing Back from the app should go wherever the user came from, not
      // return them to a login form for the session they just started.
      navigate(isSignUp ? '/onboarding' : POST_LOGIN_ROUTE, { replace: true })
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
    <div className="relative flex min-h-screen overflow-hidden bg-neutral-950">
      {/* One continuous photo behind the whole page instead of a hard split
          between a brand panel and a form panel — the form reads as a glass
          surface floating on top of it, not a separately-designed block. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <img
          src={siteImages.heroDog}
          alt=""
          className={`h-full w-full object-cover ${shouldReduceMotion ? '' : 'animate-slow-pan'}`}
        />
        {/* Deepens left-to-right so the glass card on the right has real
            contrast to sit on, while the brand copy on the left keeps more
            of the photo visible. */}
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/50 via-neutral-950/75 to-neutral-950/95" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-neutral-950/40" />
      </div>

      {/* ── Left: brand copy over the photo (large screens only) ────────────── */}
      <div className="relative z-10 hidden w-1/2 flex-col justify-between p-12 pt-28 lg:flex">
        {/* Logo + wordmark */}
        <div className="flex items-center gap-3">
          <img src={logoIcon} alt="PawSome" className="h-11 w-11 drop-shadow-lg" />
          <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Pacifico, cursive' }}>
            PawSome
          </span>
        </div>

        {/* Tagline + features */}
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="mb-8 max-w-md text-4xl font-medium leading-[1.15] text-white"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Where good dogs find <span className="italic text-[#ff6b35]">great friends</span>
          </motion.h1>

          <div className="space-y-4">
            {PANEL_FEATURES.map((f, i) => {
              const Icon = f.icon
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.1, ease: [0.23, 1, 0.32, 1] }}
                  className="flex items-center gap-3"
                >
                  <Icon className="h-5 w-5 flex-shrink-0 text-[#ff6b35]" />
                  <div>
                    <p className="text-sm font-semibold text-white">{f.title}</p>
                    <p className="text-xs text-neutral-300">{f.copy}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Trust line */}
        <p className="text-sm font-medium text-neutral-300">
          🐾 Join 10,000+ pet parents already matching nearby.
        </p>
      </div>

      {/* ── Right: glass form panel ──────────────────────────────────────────── */}
      <div className="relative z-10 flex w-full items-center justify-center p-6 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
          className="w-full max-w-md"
        >
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 shadow-2xl shadow-black/50 backdrop-blur-2xl">
            {/* Brand mark — the real PawSome logo */}
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 -z-10 scale-125 rounded-full bg-[#ff6b35]/30 blur-xl" />
                <img src={logoIcon} alt="PawSome" className="h-16 w-16 drop-shadow-[0_4px_16px_rgba(255,107,53,0.4)]" />
              </div>
              <h2 className="font-display text-2xl font-bold text-white">
                {isForgot ? 'Reset your password' : isSignUp ? 'Join PawSome' : 'Welcome back'}
              </h2>
              <p className="mt-1 text-sm text-neutral-400">
                {isForgot
                  ? "Enter your email and we'll send you a link to reset it."
                  : isSignUp
                    ? 'Create an account to find your pet a perfect match.'
                    : 'Sign in to continue the search for a match.'}
              </p>
            </div>

            {/* Mode switcher */}
            {!isForgot && (
              <div className="mb-6 flex justify-center">
                <PillTabs
                  layoutId="auth-mode-pill"
                  active={mode}
                  onChange={(m) => switchMode(m)}
                  tabs={[
                    { key: 'signin', label: 'Sign In' },
                    { key: 'signup', label: 'Create Account' },
                  ]}
                />
              </div>
            )}

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

            {isForgot && resetSent ? (
              <div className="flex flex-col items-center gap-4 py-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <p className="text-sm text-neutral-300">
                  If an account exists for <span className="font-medium text-white">{email}</span>, a password reset
                  link is on its way. Check your inbox.
                </p>
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="text-sm font-medium text-[#ff6b35] hover:text-[#ff8c5c]"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-white/5 py-3 pl-11 pr-4 text-white placeholder:text-neutral-400 backdrop-blur-sm transition-colors focus:border-[#ff6b35] focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/30"
                    required
                    autoComplete="email"
                  />
                </div>

                {!isForgot && (
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-white/5 py-3 pl-11 pr-11 text-white placeholder:text-neutral-400 backdrop-blur-sm transition-colors focus:border-[#ff6b35] focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/30"
                      required
                      minLength={8}
                      autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                )}

                {isSignUp && (
                  <div>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full rounded-xl border bg-white/5 py-3 pl-11 pr-11 text-white placeholder:text-neutral-400 backdrop-blur-sm transition-colors focus:bg-white/10 focus:outline-none focus:ring-2 ${
                          passwordsMismatch
                            ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/30'
                            : 'border-white/15 focus:border-[#ff6b35] focus:ring-[#ff6b35]/30'
                        }`}
                        required
                        minLength={8}
                        autoComplete="new-password"
                        aria-invalid={passwordsMismatch}
                        aria-describedby={passwordsMismatch ? 'confirm-password-error' : undefined}
                      />
                      {/* Confirmed match is worth showing — it's the one moment the
                          user can't verify for themselves behind the dots. */}
                      {!passwordsMismatch && confirmPassword.length > 0 && (
                        <CheckCircle2 className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400" />
                      )}
                    </div>
                    {passwordsMismatch && (
                      <p id="confirm-password-error" className="mt-1.5 pl-1 text-xs text-red-400">
                        Passwords don't match.
                      </p>
                    )}
                  </div>
                )}

                {mode === 'signin' && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => navigate('/forgot-password')}
                      className="text-xs font-medium text-neutral-400 hover:text-[#ff6b35]"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={submitting || passwordsMismatch}
                  whileHover={{ scale: submitting || passwordsMismatch ? 1 : 1.01 }}
                  whileTap={{ scale: submitting || passwordsMismatch ? 1 : 0.98 }}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff6b35] to-pink-500 py-3 font-semibold text-white shadow-lg shadow-[#ff6b35]/30 transition-shadow hover:shadow-xl hover:shadow-[#ff6b35]/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  ) : (
                    <>
                      {isForgot ? 'Send Reset Link' : isSignUp ? 'Create Account' : 'Sign In'}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </motion.button>

                {isForgot && (
                  <button
                    type="button"
                    onClick={() => switchMode('signin')}
                    className="w-full text-center text-sm font-medium text-neutral-400 hover:text-white"
                  >
                    Back to Sign In
                  </button>
                )}
              </form>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-neutral-400">
            By continuing you agree to PawSome's Terms of Use and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default AuthPage
