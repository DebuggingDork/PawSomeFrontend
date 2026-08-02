import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react'
import logoIcon from '@/assets/logo-256.png'
import { verifyEmail } from '@/lib/api/auth'
import { ApiError } from '@/lib/api/client'

type Status = 'verifying' | 'success' | 'error' | 'missing-token'

function VerifyEmailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<Status>(token ? 'verifying' : 'missing-token')
  const [error, setError] = useState<string | null>(null)
  const ranRef = useRef(false)

  useEffect(() => {
    if (!token || ranRef.current) return
    ranRef.current = true

    verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error')
        if (err instanceof ApiError) {
          setError(typeof err.detail === 'string' ? err.detail : 'Invalid or expired verification link.')
        } else {
          setError('Could not reach the server. Is the backend running?')
        }
      })
  }, [token])

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
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
          <div className="mb-6 flex flex-col items-center text-center">
            {/* Brand mark — the real PawSome logo, given the same treatment as
                the auth page. A gradient tile with a stock paw glyph stood here,
                on the screens where the brand most needs to be recognisable. */}
            <div className="relative mb-4">
              <div className="absolute inset-0 -z-10 scale-125 rounded-full bg-brand/30 blur-xl" />
              <img src={logoIcon} alt="PawSome" width={56} height={56} decoding="async" className="h-14 w-14 drop-shadow-[0_4px_16px_rgba(255,107,53,0.4)]" />
            </div>
            <h2 className="font-display text-2xl font-bold text-white">Verify your email</h2>
          </div>

          {status === 'verifying' && (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-brand" />
              <p className="text-sm text-neutral-400">Confirming your email address…</p>
            </div>
          )}

          {status === 'missing-token' && (
            <div className="flex flex-col items-center gap-4 py-2 text-center">
              <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>
                  This link is missing a verification token. Request a new one from your{' '}
                  <Link to="/onboarding" className="font-medium underline">
                    onboarding steps
                  </Link>
                  .
                </span>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-4 py-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                <AlertCircle className="h-6 w-6" />
              </div>
              <p className="text-sm text-neutral-300">{error}</p>
              <button
                type="button"
                onClick={() => navigate('/onboarding')}
                className="rounded-xl border border-neutral-800 px-5 py-2.5 text-sm font-medium text-neutral-300 hover:border-brand hover:text-white"
              >
                Resend verification email
              </button>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center gap-4 py-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="text-sm text-neutral-300">Your email is verified. Welcome to PawSome!</p>
              <button
                type="button"
                onClick={() => navigate('/discover')}
                className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-shadow hover:shadow-xl hover:shadow-brand/40"
              >
                Start discovering pets
                <ArrowRight className="h-4 w-4 transition-transform hoverable:group-hover:translate-x-0.5" />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default VerifyEmailPage
