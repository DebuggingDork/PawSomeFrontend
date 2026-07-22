import { useState } from 'react'
import { Mail } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { resendVerification } from '@/lib/api/auth'

interface Props {
  email: string
  onSkip: () => void
}

export function EmailVerificationStep({ email, onSkip }: Props) {
  const [sent, setSent] = useState(false)
  const mutation = useMutation({
    mutationFn: () => resendVerification(email),
    onSuccess: () => setSent(true),
  })

  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff6b35] to-pink-500">
        <Mail className="h-6 w-6 text-white" />
      </div>
      <h3 className="mb-2 font-display text-xl font-bold text-white">Verify your email</h3>
      <p className="mb-6 text-sm text-neutral-400">
        We sent a verification link to <span className="text-neutral-200">{email}</span>. Click it to confirm
        it's really you.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || sent}
          className="rounded-xl bg-gradient-to-r from-[#ff6b35] to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#ff6b35]/30 transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {sent ? 'Email sent!' : mutation.isPending ? 'Sending…' : 'Resend email'}
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="rounded-xl border border-neutral-800 px-5 py-2.5 text-sm font-medium text-neutral-400 hover:text-white"
        >
          I'll do this later
        </button>
      </div>
    </div>
  )
}
