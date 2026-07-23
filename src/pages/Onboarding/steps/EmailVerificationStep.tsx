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
      <div className="mx-auto mb-6 flex items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-3 text-sm text-neutral-300">
        <Mail className="h-4 w-4 flex-shrink-0 text-[#ff6b35]" />
        <span className="truncate">{email}</span>
      </div>

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
