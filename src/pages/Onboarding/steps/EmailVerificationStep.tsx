import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence, useAnimationControls, useReducedMotion } from 'framer-motion'
import { Mail, Check, RefreshCw, AlertTriangle, Inbox } from 'lucide-react'
import { sendVerificationCode, verifyCode } from '@/lib/api/auth'
import { getMyProfile } from '@/lib/api/users'
import { ApiError } from '@/lib/api/client'
import { PrimaryAction, StepError } from '../fields'

interface Props {
  email: string
  /** Called once, the moment the address is confirmed verified. */
  onVerified: () => void
}

const CODE_LENGTH = 6
const POLL_INTERVAL_MS = 8000
/** How long to wait before admitting the mail might have gone to spam. Shown on a
 * delay rather than upfront: leading with "check your spam folder" tells someone
 * the mail probably failed before they've even had a chance to receive it. */
const SPAM_HINT_DELAY_MS = 20000

const EASE_OUT = [0.16, 1, 0.3, 1] as const

/** The mailbox the codes actually come from. Naming it up front stops people
 * scanning for "PawSome" and missing it, which is most of the "I never got it". */
const SENDER = 'pawsome.breeding@gmail.com'

/** Six separate boxes rather than one text field: the segmentation makes the
 * expected length obvious without a hint, and each filled box is visible progress. */
function CodeInput({
  value,
  onChange,
  onComplete,
  invalid,
  disabled,
  focusSignal,
}: {
  value: string
  onChange: (next: string) => void
  onComplete: (code: string) => void
  invalid: boolean
  disabled: boolean
  /** Bumped by the parent to pull focus back to the first box after a bad code. */
  focusSignal: number
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (focusSignal > 0) refs.current[0]?.focus()
  }, [focusSignal])

  const commit = (next: string) => {
    onChange(next)
    if (next.length === CODE_LENGTH) onComplete(next)
  }

  const handleChange = (index: number, raw: string) => {
    // Handles both a single keystroke and a pasted code landing in one box.
    const digits = raw.replace(/\D/g, '')
    if (!digits) return

    const next = (value.slice(0, index) + digits + value.slice(index + digits.length)).slice(0, CODE_LENGTH)
    commit(next)
    refs.current[Math.min(index + digits.length, CODE_LENGTH - 1)]?.focus()
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      if (value[index]) {
        commit(value.slice(0, index) + value.slice(index + 1))
      } else if (index > 0) {
        // Backspacing an already-empty box should clear the one before it,
        // which is what people expect from a segmented input.
        commit(value.slice(0, index - 1) + value.slice(index))
        refs.current[index - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      refs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      refs.current[index + 1]?.focus()
    }
  }

  return (
    <div className="flex justify-between gap-1.5 sm:gap-2.5" role="group" aria-label="Verification code">
      {Array.from({ length: CODE_LENGTH }).map((_, i) => {
        const filled = !!value[i]
        return (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="text"
            inputMode="numeric"
            // iOS reads the code out of the SMS/mail and offers it above the
            // keyboard; `pattern` is what makes Android's autofill do the same.
            pattern="[0-9]*"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={CODE_LENGTH}
            value={value[i] ?? ''}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onFocus={(e) => e.target.select()}
            disabled={disabled}
            aria-label={`Digit ${i + 1}`}
            aria-invalid={invalid}
            // Six boxes have to share the width of a 320px screen, so they get
            // shorter and the digits smaller before the row is allowed to
            // overflow. The box is still 48px+ tall — a comfortable tap.
            className={`h-14 w-full min-w-0 rounded-xl border text-center font-display text-xl font-bold text-white caret-[#ff6b35] transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 sm:h-16 sm:rounded-2xl sm:text-2xl ${
              invalid
                ? 'border-red-500/60 bg-red-500/5 focus:border-red-500 focus:ring-red-500/25'
                : filled
                  ? // A filled box holds its brand tint, so at a glance the row shows
                    // how much is done without having to read the digits.
                    'border-[#ff6b35]/60 bg-[#ff6b35]/10 focus:border-[#ff6b35] focus:ring-[#ff6b35]/25'
                  : 'border-neutral-800 bg-neutral-900/60 focus:border-[#ff6b35] focus:ring-[#ff6b35]/25'
            }`}
          />
        )
      })}
    </div>
  )
}

export function EmailVerificationStep({ email, onVerified }: Props) {
  const shouldReduceMotion = useReducedMotion()
  const queryClient = useQueryClient()
  const shake = useAnimationControls()

  const [code, setCode] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const [notDelivered, setNotDelivered] = useState(false)
  const [showSpamHint, setShowSpamHint] = useState(false)
  const [focusSignal, setFocusSignal] = useState(0)
  const announcedRef = useRef(false)

  // Backs up the typed code: the link in the same email still works, possibly in
  // another tab, so this notices when the address gets verified some other way.
  const { data: profile } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: getMyProfile,
    refetchInterval: (query) => (query.state.data?.is_verified ? false : POLL_INTERVAL_MS),
  })
  const isVerified = !!profile?.is_verified

  useEffect(() => {
    if (!isVerified || announcedRef.current) return
    announcedRef.current = true
    onVerified()
  }, [isVerified, onVerified])

  useEffect(() => {
    if (cooldown <= 0) return
    const id = setTimeout(() => setCooldown((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [cooldown])

  useEffect(() => {
    const id = setTimeout(() => setShowSpamHint(true), SPAM_HINT_DELAY_MS)
    return () => clearTimeout(id)
  }, [])

  const sendMutation = useMutation({
    mutationFn: sendVerificationCode,
    onSuccess: (res) => {
      setCooldown(res.retry_after_seconds)
      setNotDelivered(!res.delivered)
    },
  })

  const verifyMutation = useMutation({
    mutationFn: verifyCode,
    onSuccess: () => {
      // Flips is_verified, which both completes this step and puts the blue check
      // on the live card preview.
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] })
      onVerified()
    },
    onError: () => {
      // Clear and hand focus back rather than leaving six wrong digits sitting
      // there for the user to delete one at a time.
      if (!shouldReduceMotion) {
        shake.start({ x: [0, -9, 9, -6, 6, 0], transition: { duration: 0.4, ease: 'easeOut' } })
      }
      setCode('')
      setFocusSignal((n) => n + 1)
    },
  })

  const verifyError =
    verifyMutation.error instanceof ApiError && typeof verifyMutation.error.detail === 'string'
      ? verifyMutation.error.detail
      : verifyMutation.isError
        ? 'Could not check that code. Try again.'
        : null

  if (isVerified) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-800 bg-emerald-950/40 px-4 py-4">
        <motion.span
          initial={shouldReduceMotion ? false : { scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.5, duration: 0.5 }}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500"
        >
          <Check className="h-4 w-4 text-white" strokeWidth={3} />
        </motion.span>
        <div>
          <p className="text-sm font-semibold text-emerald-300">Verified</p>
          <p className="text-xs text-emerald-400/70">That badge is yours. Moving on.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Destination */}
      <div className="flex items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/60 px-4 py-3.5">
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#ff6b35]/12">
          <Mail className="h-4 w-4 text-[#ff6b35]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-neutral-500">Code sent to</p>
          <p className="truncate text-sm font-medium text-neutral-100">{email}</p>
        </div>
      </div>

      <motion.div animate={shake}>
        <CodeInput
          value={code}
          onChange={(next) => {
            setCode(next)
            verifyMutation.reset()
          }}
          onComplete={(full) => verifyMutation.mutate(full)}
          invalid={!!verifyError}
          disabled={verifyMutation.isPending}
          focusSignal={focusSignal}
        />
      </motion.div>

      {verifyError && <StepError>{verifyError}</StepError>}

      {notDelivered && (
        <p className="flex items-start gap-2 text-sm text-amber-400">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          The server couldn't send that one. Try again in a moment.
        </p>
      )}

      {sendMutation.isError && <StepError>Couldn't send a new code. Try again in a moment.</StepError>}

      {/* No docked action bar on this step: it is the one screen short enough to
          fit a phone without scrolling, and a bar pinned to the bottom of a page
          that does not scroll is just a bar floating in the middle of it. */}
      <div className="space-y-2">
        <PrimaryAction
          type="button"
          onClick={() => verifyMutation.mutate(code)}
          disabled={code.length !== CODE_LENGTH}
          pending={verifyMutation.isPending}
          pendingLabel="Checking"
        >
          Verify email
        </PrimaryAction>

        <button
          type="button"
          onClick={() => sendMutation.mutate()}
          disabled={sendMutation.isPending || cooldown > 0}
          className="flex w-full touch-manipulation items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/60 py-3.5 text-sm font-medium text-neutral-200 transition-colors hover:border-neutral-700 hover:text-white disabled:cursor-not-allowed disabled:text-neutral-500 sm:py-3"
        >
          <RefreshCw className={`h-4 w-4 ${sendMutation.isPending ? 'animate-spin' : ''}`} />
          {cooldown > 0
            ? `Send a new code in ${cooldown}s`
            : sendMutation.isPending
              ? 'Sending'
              : 'Send a new code'}
        </button>
      </div>

      {/* Quiet footnotes, separated from the controls by a hairline so they read as
          reference rather than as another thing to act on. */}
      <div className="space-y-2.5 border-t border-neutral-900 pt-4">
        <p className="text-xs leading-relaxed text-neutral-500 [overflow-wrap:anywhere]">
          It comes from <span className="font-medium text-neutral-300">{SENDER}</span>. Yes, we hear
          it too.
        </p>

        <AnimatePresence>
          {showSpamHint && (
            <motion.p
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE_OUT }}
              className="flex items-start gap-2 text-xs leading-relaxed text-neutral-400"
            >
              <Inbox className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-neutral-500" />
              <span>
                Still nothing? Have a look in spam. New senders tend to get treated like strays.
              </span>
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
