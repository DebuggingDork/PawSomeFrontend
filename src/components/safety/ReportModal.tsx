import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { X, Flag, Check } from 'lucide-react'
import { createReport } from '@/lib/api/reports'
import { ApiError } from '@/lib/api/client'
import type { ReportReason } from '@/lib/api/types'

const REASONS: { value: ReportReason; label: string }[] = [
  { value: 'inappropriate_content', label: 'Inappropriate content' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'fake_profile', label: 'Fake profile' },
  { value: 'spam', label: 'Spam' },
  { value: 'other', label: 'Other' },
]

interface ReportModalProps {
  reportedUserId: string
  reportedPetId?: string
  onClose: () => void
}

export function ReportModal({ reportedUserId, reportedPetId, onClose }: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason>('inappropriate_content')
  const [description, setDescription] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      createReport({ reported_user_id: reportedUserId, reported_pet_id: reportedPetId, reason, description }),
  })

  const rateLimited = mutation.error instanceof ApiError && mutation.error.status === 429

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-white">
            <Flag className="h-4 w-4 text-red-400" /> Report
          </h2>
          <button onClick={onClose} aria-label="Close" className="text-neutral-500 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {mutation.isSuccess ? (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <Check className="h-6 w-6" />
            </div>
            <p className="font-medium text-white">Thanks — we'll review this.</p>
            <button onClick={onClose} className="mt-4 text-sm text-neutral-400 hover:text-white">
              Close
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              mutation.mutate()
            }}
            className="space-y-4"
          >
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as ReportReason)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2.5 text-sm text-white focus:border-red-400 focus:outline-none"
              >
                {REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">Details</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                minLength={10}
                maxLength={2000}
                required
                placeholder="What happened? (minimum 10 characters)"
                className="w-full resize-none rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:border-red-400 focus:outline-none"
              />
            </div>

            {mutation.isError && (
              <p className="text-sm text-red-400">
                {rateLimited ? "You've hit today's report limit — try again tomorrow." : 'Could not submit that report — try again.'}
              </p>
            )}

            <button
              type="submit"
              disabled={mutation.isPending || description.trim().length < 10}
              className="w-full rounded-xl bg-red-500/90 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {mutation.isPending ? 'Submitting…' : 'Submit report'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}
