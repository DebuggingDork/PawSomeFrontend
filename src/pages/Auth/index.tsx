import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Footprints,
  ShieldCheck,
  Trees,
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

/**
 * The one bright room in a dark app.
 *
 * Everywhere else PawSome runs on near-black, which suits browsing photographs
 * of other people's dogs. It suited this page badly: the form was a translucent
 * pane floating on a dimmed photo, so the fields, the copy and the photograph
 * were all competing at roughly the same low brightness and none of them won.
 * Signing in is a two-field errand, and the page now looks like the hour people
 * actually walk their dogs in. The logo's three hues (coral, rose, amber) light
 * the surface; the form sits on plain warm white so the task is unmistakable.
 */

const REASONS = [
  {
    icon: Footprints,
    title: 'Ten minutes away',
    copy: 'The dogs on your side of town come first, before anyone you would need a car to reach.',
  },
  {
    icon: ShieldCheck,
    title: 'Checked before it goes live',
    copy: 'Profiles are reviewed on the way in, so nobody turns up as a surprise.',
  },
  {
    icon: Trees,
    title: 'It finishes outdoors',
    copy: 'Agree on a park and an hour, then put the phone back in your pocket.',
  },
]

/** Deep enough that white sits on it at 4.5:1. The bright coral is for glow and icons. */
const ACTION_GRADIENT = 'bg-gradient-to-r from-[#d2400e] via-[#cb2f36] to-[#c2185b]'
/** Coral is unreadable as text on white; this is the same hue taken down to 4.7:1. */
const LINK = 'text-[#d2400e]'

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
      setError('The two passwords are not the same yet.')
      return
    }

    setSubmitting(true)

    if (isForgot) {
      startLoading('Sending your link...')
      try {
        await authApi.forgotPassword(email)
        setResetSent(true)
      } catch (err) {
        if (err instanceof ApiError) {
          setError(typeof err.detail === 'string' ? err.detail : 'That did not go through. Try once more.')
        } else {
          setError('We could not reach PawSome. Check your connection and try again.')
        }
      } finally {
        setSubmitting(false)
        stopLoading()
      }
      return
    }

    startLoading(isSignUp ? 'Setting you up...' : 'Opening your account...')

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
        setError(typeof err.detail === 'string' ? err.detail : 'That did not go through. Try once more.')
      } else {
        setError('We could not reach PawSome. Check your connection and try again.')
      }
    } finally {
      setSubmitting(false)
      stopLoading()
    }
  }

  const heading = isForgot ? 'Locked out?' : isSignUp ? 'Get your dog on the map' : 'Good to see you again'
  const subheading = isForgot
    ? 'Give us the address you signed up with and a fresh link goes out straight away.'
    : isSignUp
      ? 'About a minute of typing. Photos and the fun part come after.'
      : 'Two fields and you are back where you left off.'

  const rise = shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 } }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#fff2e8]">
      {/* Three washes, one per hue in the logo. Kept as soft radials rather than
          a linear ramp so the light has a direction to it. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(125%_95%_at_86%_-12%,rgba(255,107,53,0.44)_0%,rgba(255,107,53,0)_58%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(100%_85%_at_-10%_112%,rgba(236,72,153,0.30)_0%,rgba(236,72,153,0)_62%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(75%_65%_at_52%_118%,rgba(251,191,36,0.34)_0%,rgba(251,191,36,0)_66%)]" />
      </div>

      {/* The global navbar is white-on-translucent-black and expects a dark page
          under it. On this one it gets a short warm eave to sit on, which also
          reads as the top edge of the light. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#2b1008]/80 via-[#2b1008]/28 to-transparent"
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pb-10 pt-24 lg:flex-row lg:items-stretch lg:gap-16 lg:px-10 lg:pb-12 lg:pt-28">
        {/* ── Left: why anyone is filling this in (lg+) ────────────────────── */}
        <div className="hidden min-h-0 w-full flex-1 flex-col lg:flex">
          <Link to="/" className="flex w-fit items-center gap-2.5">
            <img src={logoIcon} alt="" className="h-10 w-10" />
            <span className="text-2xl font-bold text-[#d2400e]" style={{ fontFamily: 'Pacifico, cursive' }}>
              PawSome
            </span>
          </Link>

          <motion.h1
            {...rise}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-9 max-w-lg text-pretty font-display text-[clamp(2.1rem,3.4vw,3.15rem)] font-bold leading-[1.08] tracking-[-0.03em] text-[#33150c]"
            style={{ textWrap: 'balance' }}
          >
            The park is full of dogs yours <span className="text-[#c2185b]">has not met yet</span>
          </motion.h1>

          <ul className="mt-8 space-y-5">
            {REASONS.map((r, i) => {
              const Icon = r.icon
              return (
                <motion.li
                  key={r.title}
                  {...(shouldReduceMotion
                    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
                    : { initial: { opacity: 0, x: -14 }, animate: { opacity: 1, x: 0 } })}
                  transition={{ duration: 0.5, delay: 0.12 + i * 0.09, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-start gap-3.5"
                >
                  <span className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-white/70 text-[#d2400e] ring-1 ring-[#f6cdb8]">
                    <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#33150c]">{r.title}</p>
                    <p className="mt-0.5 max-w-[46ch] text-sm leading-relaxed text-[#7a4a35]">{r.copy}</p>
                  </div>
                </motion.li>
              )
            })}
          </ul>

          {/* Shown as a photograph, not dimmed into a backdrop. It is the only
              picture on the page, so it gets to be bright. */}
          <div className="relative mt-9 min-h-0 flex-1 overflow-hidden rounded-[1.75rem] shadow-[0_28px_60px_-28px_rgba(150,60,20,0.5)] ring-1 ring-[#f6cdb8]">
            <img
              src={siteImages.duskRun}
              alt="Two dogs running side by side across grass in low evening sun"
              className={`h-full w-full object-cover ${shouldReduceMotion ? '' : 'animate-slow-pan'}`}
            />
          </div>

          <p className="mt-4 text-sm text-[#7a4a35]">
            Add your dog once. Everything after that happens on a pavement somewhere.
          </p>
        </div>

        {/* ── Right: the form ─────────────────────────────────────────────── */}
        <div className="flex w-full flex-1 items-center justify-center lg:max-w-[29rem]">
          <motion.div
            {...(shouldReduceMotion
              ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
              : { initial: { opacity: 0, y: 22 }, animate: { opacity: 1, y: 0 } })}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            {/* Compact brand line for the breakpoints where the left column is gone. */}
            <Link to="/" className="mb-6 flex w-fit items-center gap-2.5 lg:hidden">
              <img src={logoIcon} alt="" className="h-9 w-9" />
              <span className="text-xl font-bold text-[#d2400e]" style={{ fontFamily: 'Pacifico, cursive' }}>
                PawSome
              </span>
            </Link>

            <div className="rounded-[1.75rem] bg-[#fffdfb] p-7 shadow-[0_30px_70px_-32px_rgba(150,60,20,0.55)] ring-1 ring-[#f7d5c3] sm:p-8">
              <h2 className="font-display text-[1.6rem] font-bold leading-tight tracking-[-0.02em] text-[#33150c]">
                {heading}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-[#7a4a35]">{subheading}</p>

              {!isForgot && (
                <div className="mt-6">
                  <PillTabs
                    tone="light"
                    layoutId="auth-mode-pill"
                    active={mode}
                    onChange={(m) => switchMode(m)}
                    tabs={[
                      { key: 'signin', label: 'Sign in' },
                      { key: 'signup', label: 'New here' },
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
                    className="mt-5 flex items-start gap-2 overflow-hidden rounded-xl bg-[#fff0ec] px-3.5 py-3 text-sm text-[#a1230f] ring-1 ring-[#f6bfae]"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {isForgot && resetSent ? (
                <div className="mt-6 flex flex-col items-center gap-4 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e9f8f2] text-[#0f766e]">
                    <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <p className="text-sm leading-relaxed text-[#5c3524]">
                    If <span className="font-semibold text-[#33150c]">{email}</span> is registered here, the link is
                    already on its way. Worth a look in spam if it takes more than a minute.
                  </p>
                  <button
                    type="button"
                    onClick={() => switchMode('signin')}
                    className={`text-sm font-semibold ${LINK} underline-offset-4 hover:underline`}
                  >
                    Back to sign in
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="auth-email" className="mb-1.5 block text-sm font-semibold text-[#4a2617]">
                      Email
                    </label>
                    <div className="relative">
                      <Mail
                        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b9846c]"
                        aria-hidden="true"
                      />
                      <input
                        id="auth-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-[#f0d3c2] bg-white py-3 pl-11 pr-4 text-[#33150c] transition-[border-color,box-shadow] placeholder:text-[#8a6353] focus:border-[#d2400e] focus:outline-none focus:ring-4 focus:ring-[#ff6b35]/20"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {!isForgot && (
                    <div>
                      <label htmlFor="auth-password" className="mb-1.5 block text-sm font-semibold text-[#4a2617]">
                        Password
                      </label>
                      <div className="relative">
                        <Lock
                          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b9846c]"
                          aria-hidden="true"
                        />
                        <input
                          id="auth-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder={isSignUp ? 'At least 8 characters' : 'Your password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full rounded-xl border border-[#f0d3c2] bg-white py-3 pl-11 pr-11 text-[#33150c] transition-[border-color,box-shadow] placeholder:text-[#8a6353] focus:border-[#d2400e] focus:outline-none focus:ring-4 focus:ring-[#ff6b35]/20"
                          required
                          minLength={8}
                          autoComplete={isSignUp ? 'new-password' : 'current-password'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#8a6353] transition-colors hover:text-[#d2400e]"
                          tabIndex={-1}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {isSignUp && (
                    <div>
                      <label htmlFor="auth-confirm" className="mb-1.5 block text-sm font-semibold text-[#4a2617]">
                        Repeat password
                      </label>
                      <div className="relative">
                        <Lock
                          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b9846c]"
                          aria-hidden="true"
                        />
                        <input
                          id="auth-confirm"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Type it once more"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`w-full rounded-xl border bg-white py-3 pl-11 pr-11 text-[#33150c] transition-[border-color,box-shadow] placeholder:text-[#8a6353] focus:outline-none focus:ring-4 ${
                            passwordsMismatch
                              ? 'border-[#d94a2b] focus:border-[#a1230f] focus:ring-[#d94a2b]/20'
                              : 'border-[#f0d3c2] focus:border-[#d2400e] focus:ring-[#ff6b35]/20'
                          }`}
                          required
                          minLength={8}
                          autoComplete="new-password"
                          aria-invalid={passwordsMismatch}
                          aria-describedby={passwordsMismatch ? 'auth-confirm-error' : undefined}
                        />
                        {/* Confirmed match is worth showing — it's the one moment the
                            user can't verify for themselves behind the dots. */}
                        {!passwordsMismatch && confirmPassword.length > 0 && (
                          <CheckCircle2
                            className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0f766e]"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                      {passwordsMismatch && (
                        <p id="auth-confirm-error" className="mt-1.5 text-xs font-medium text-[#a1230f]">
                          These two are not the same yet.
                        </p>
                      )}
                    </div>
                  )}

                  {mode === 'signin' && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => navigate('/forgot-password')}
                        className="text-xs font-semibold text-[#7a4a35] underline-offset-4 transition-colors hover:text-[#d2400e] hover:underline"
                      >
                        Cannot remember it?
                      </button>
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={submitting || passwordsMismatch}
                    whileHover={{ scale: submitting || passwordsMismatch || shouldReduceMotion ? 1 : 1.01 }}
                    whileTap={{ scale: submitting || passwordsMismatch || shouldReduceMotion ? 1 : 0.985 }}
                    transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
                    className={`group flex w-full items-center justify-center gap-2 rounded-xl ${ACTION_GRADIENT} py-3.5 font-semibold text-white shadow-[0_12px_28px_-10px_rgba(194,24,91,0.6)] transition-shadow hover:shadow-[0_16px_34px_-10px_rgba(194,24,91,0.7)] disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none`}
                  >
                    {submitting ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    ) : (
                      <>
                        {isForgot ? 'Email me a link' : isSignUp ? 'Create my account' : 'Sign in'}
                        <ArrowRight
                          className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none"
                          aria-hidden="true"
                        />
                      </>
                    )}
                  </motion.button>

                  {isForgot && (
                    <button
                      type="button"
                      onClick={() => switchMode('signin')}
                      className="w-full text-center text-sm font-semibold text-[#7a4a35] underline-offset-4 transition-colors hover:text-[#d2400e] hover:underline"
                    >
                      Back to sign in
                    </button>
                  )}
                </form>
              )}
            </div>

            {/* These were plain text before. Asking someone to agree to terms while
                giving them no way to read them is not a real agreement. */}
            <p className="mt-5 text-center text-xs leading-relaxed text-[#7a4a35]">
              Carrying on means you are happy with our{' '}
              <Link to="/terms" className={`${LINK} font-medium underline underline-offset-2`}>
                Terms of Use
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className={`${LINK} font-medium underline underline-offset-2`}>
                Privacy Policy
              </Link>
              .
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
