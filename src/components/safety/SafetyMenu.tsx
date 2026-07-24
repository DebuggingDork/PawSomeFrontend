import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { MoreVertical, Flag, ShieldOff, UserX } from 'lucide-react'
import { createBlock } from '@/lib/api/blocks'
import { unmatch as unmatchApi } from '@/lib/api/matches'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { ReportModal } from './ReportModal'

interface SafetyMenuProps {
  userId: string
  petId?: string
  /** When present, an "Unmatch" option is shown alongside Report/Block. */
  matchId?: string
  otherName: string
  onBlocked?: () => void
  onUnmatched?: () => void
  className?: string
}

/** "..." menu shared by Discover cards, Matches cards, and the Chat header for Report/Block/Unmatch. */
export function SafetyMenu({ userId, petId, matchId, otherName, onBlocked, onUnmatched, className = '' }: SafetyMenuProps) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [confirmingBlock, setConfirmingBlock] = useState(false)
  const [confirmingUnmatch, setConfirmingUnmatch] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useOnClickOutside(menuRef, () => {
    setOpen(false)
    setConfirmingBlock(false)
    setConfirmingUnmatch(false)
  })

  const blockMutation = useMutation({
    mutationFn: () => createBlock(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] })
      setOpen(false)
      setConfirmingBlock(false)
      onBlocked?.()
    },
  })

  const unmatchMutation = useMutation({
    mutationFn: () => unmatchApi(matchId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] })
      setOpen(false)
      setConfirmingUnmatch(false)
      onUnmatched?.()
    },
  })

  return (
    <div ref={menuRef} className={`relative ${className}`}>
      <button
        onPointerDownCapture={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          setOpen((v) => !v)
        }}
        aria-label="Safety options"
        className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-9 z-20 w-48 overflow-hidden rounded-xl border border-white/10 bg-neutral-900 shadow-xl"
        >
          {!confirmingBlock && !confirmingUnmatch ? (
            <>
              <button
                onClick={() => {
                  setOpen(false)
                  setShowReport(true)
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-neutral-200 hover:bg-neutral-800"
              >
                <Flag className="h-4 w-4" /> Report
              </button>
              {matchId && (
                <button
                  onClick={() => setConfirmingUnmatch(true)}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-neutral-200 hover:bg-neutral-800"
                >
                  <UserX className="h-4 w-4" /> Unmatch
                </button>
              )}
              <button
                onClick={() => setConfirmingBlock(true)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-400 hover:bg-neutral-800"
              >
                <ShieldOff className="h-4 w-4" /> Block {otherName}
              </button>
            </>
          ) : confirmingBlock ? (
            <div className="p-3">
              <p className="mb-2 text-xs text-neutral-400">
                Blocking {otherName} removes every match you share with them. This can't be easily undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => blockMutation.mutate()}
                  disabled={blockMutation.isPending}
                  className="flex-1 rounded-lg bg-red-500/90 py-1.5 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-50"
                >
                  {blockMutation.isPending ? 'Blocking…' : 'Confirm block'}
                </button>
                <button
                  onClick={() => setConfirmingBlock(false)}
                  className="rounded-lg px-3 py-1.5 text-xs text-neutral-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3">
              <p className="mb-2 text-xs text-neutral-400">
                Unmatch with {otherName}? This removes the match and conversation for both of you.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => unmatchMutation.mutate()}
                  disabled={unmatchMutation.isPending}
                  className="flex-1 rounded-lg bg-neutral-700 py-1.5 text-xs font-semibold text-white hover:bg-neutral-600 disabled:opacity-50"
                >
                  {unmatchMutation.isPending ? 'Unmatching…' : 'Confirm unmatch'}
                </button>
                <button
                  onClick={() => setConfirmingUnmatch(false)}
                  className="rounded-lg px-3 py-1.5 text-xs text-neutral-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showReport && (
        <ReportModal reportedUserId={userId} reportedPetId={petId} onClose={() => setShowReport(false)} />
      )}
    </div>
  )
}
