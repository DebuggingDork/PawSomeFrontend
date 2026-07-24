import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, CheckCheck, SmilePlus, Trash2 } from 'lucide-react'
import type { ChatMessage } from '@/lib/api/types'

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢']

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
                ? 'rounded-br-md bg-gradient-to-br from-[#ff6b35] to-pink-500 text-white'
                : 'rounded-bl-md bg-neutral-800 text-neutral-100'
            }`}
          >
            {message.content}
          </div>

          {/* Hover actions: react, delete-if-mine-and-within-window */}
          <div className="relative flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => setPickerOpen((v) => !v)}
              aria-label="React"
              className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-800 hover:text-white"
            >
              <SmilePlus className="h-3.5 w-3.5" />
            </button>
            {isMine && canDelete && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Delete this message?')) onDelete?.()
                }}
                aria-label="Delete message"
                className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-800 hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
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
                    className="rounded-full p-1 text-base transition-transform hover:scale-125"
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
                    ? 'border-[#ff6b35] bg-[#ff6b35]/15'
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
          {isMine && showSeen && (
            <span className="text-[#ff8c5c]" title={message.is_read ? 'Seen' : 'Sent'}>
              {message.is_read ? <CheckCheck className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
