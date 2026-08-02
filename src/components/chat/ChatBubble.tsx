import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, Check, CheckCheck, Clock, SmilePlus, Trash2 } from 'lucide-react'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import type { ChatMessage } from '@/lib/api/types'

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢']

// Set once someone ticks "Don't ask again" on the delete popover. A browser
// confirm() is a jarring full-stop dialog for something this low-stakes and
// reversible-in-spirit (you're only ever deleting your own message); this
// remembers the choice so it never has to interrupt them again.
const SKIP_DELETE_CONFIRM_KEY = 'pawsome:skip-delete-message-confirm'

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

interface ChatBubbleProps {
  message: ChatMessage
  isMine: boolean
  showSeen?: boolean
  currentUserId?: string
  canDelete?: boolean
  onReact?: (emoji: string) => void
  onRemoveReaction?: () => void
  onDelete?: () => void
}

export function ChatBubble({
  message,
  isMine,
  showSeen,
  currentUserId,
  canDelete,
  onReact,
  onRemoveReaction,
  onDelete,
}: ChatBubbleProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [dontAskAgain, setDontAskAgain] = useState(false)
  const confirmRef = useRef<HTMLDivElement | null>(null)

  useOnClickOutside(confirmRef, () => setConfirmOpen(false))

  const reactions = message.reactions ?? []
  const myReaction = currentUserId ? reactions.find((r) => r.user_id === currentUserId) : undefined
  const grouped = reactions.reduce<Record<string, number>>((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] ?? 0) + 1
    return acc
  }, {})

  const handlePick = (emoji: string) => {
    setPickerOpen(false)
    if (myReaction?.emoji === emoji) onRemoveReaction?.()
    else onReact?.(emoji)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`group flex ${isMine ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex max-w-[75%] flex-col gap-1 ${isMine ? 'items-end' : 'items-start'}`}>
        <div className={`flex items-center gap-1.5 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
          <div
            className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              isMine
                ? 'rounded-br-md bg-gradient-to-br from-brand to-pink-500 text-white'
                : 'rounded-bl-md bg-neutral-800 text-neutral-100'
            }`}
          >
            {message.content}
          </div>

          {/* Hover actions: react, delete-if-mine-and-within-window.
              Forced opaque while either popover is open — group-hover only
              holds while the pointer sits inside the bubble row's own box, and
              both popovers render below it, so without this they'd fade out
              from under the cursor the moment someone moves toward the popover
              to actually click something in it. */}
          <div
            className={`relative flex items-center gap-0.5 transition-opacity group-hover:opacity-100 ${
              pickerOpen || confirmOpen ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <button
              type="button"
              onClick={() => setPickerOpen((v) => !v)}
              aria-label="React"
              className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-800 hover:text-white"
            >
              <SmilePlus className="h-3.5 w-3.5" />
            </button>
            {isMine && canDelete && (
              <div ref={confirmRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    if (localStorage.getItem(SKIP_DELETE_CONFIRM_KEY) === '1') onDelete?.()
                    else setConfirmOpen(true)
                  }}
                  aria-label="Delete message"
                  className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-800 hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>

                <AnimatePresence>
                  {confirmOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96, y: -4 }}
                      transition={{ duration: 0.14, ease: 'easeOut' }}
                      style={{ transformOrigin: 'top right' }}
                      className={`absolute top-full z-20 mt-1.5 w-56 rounded-xl border border-neutral-700 bg-neutral-900 p-3 text-left shadow-xl ${
                        isMine ? 'right-0' : 'left-0'
                      }`}
                    >
                      <p className="text-xs font-medium text-neutral-200">Delete this message?</p>
                      <label className="mt-2 flex items-center gap-1.5 text-[11px] text-neutral-400">
                        <input
                          type="checkbox"
                          checked={dontAskAgain}
                          onChange={(e) => setDontAskAgain(e.target.checked)}
                          className="h-3 w-3 rounded border-neutral-600 bg-neutral-800 accent-brand"
                        />
                        Don't ask again
                      </label>
                      <div className="mt-2.5 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmOpen(false)}
                          className="rounded-full px-2.5 py-1 text-xs font-medium text-neutral-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (dontAskAgain) localStorage.setItem(SKIP_DELETE_CONFIRM_KEY, '1')
                            setConfirmOpen(false)
                            onDelete?.()
                          }}
                          className="rounded-full bg-red-500/15 px-2.5 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/25"
                        >
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {pickerOpen && (
              <div
                className={`absolute top-full z-10 mt-1 flex gap-1 rounded-full border border-neutral-700 bg-neutral-900 px-2 py-1.5 shadow-xl ${
                  isMine ? 'right-0' : 'left-0'
                }`}
              >
                {QUICK_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handlePick(emoji)}
                    className="rounded-full p-1 text-base transition-transform hoverable:hover:scale-125"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {Object.keys(grouped).length > 0 && (
          <div className="flex flex-wrap gap-1 px-1">
            {Object.entries(grouped).map(([emoji, count]) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handlePick(emoji)}
                className={`rounded-full border px-1.5 py-0.5 text-xs ${
                  myReaction?.emoji === emoji
                    ? 'border-brand bg-brand/15'
                    : 'border-neutral-700 bg-neutral-900/60 text-neutral-300'
                }`}
              >
                {emoji} {count}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1 px-1 text-[11px] text-neutral-500">
          <span>{formatTime(message.created_at)}</span>
          {/* Delivery state, in the order it actually happens: still in flight,
              gave up waiting, delivered, then seen. Without the first two a
              message drawn optimistically was indistinguishable from one the
              server had confirmed. */}
          {isMine && message.failed && (
            <span className="flex items-center gap-1 text-rose-400" title="Not delivered yet — retrying">
              <AlertCircle className="h-3.5 w-3.5" />
              Not sent
            </span>
          )}
          {isMine && message.pending && !message.failed && (
            <Clock className="h-3.5 w-3.5 text-neutral-500" aria-label="Sending" />
          )}
          {isMine && showSeen && !message.pending && !message.failed && (
            <span className="text-brand-light" title={message.is_read ? 'Seen' : 'Sent'}>
              {message.is_read ? <CheckCheck className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
