import { motion } from 'framer-motion'
import { Check, CheckCheck } from 'lucide-react'
import type { ChatMessage } from '@/lib/api/types'

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

interface ChatBubbleProps {
  message: ChatMessage
  isMine: boolean
  showSeen?: boolean
}

export function ChatBubble({ message, isMine, showSeen }: ChatBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex max-w-[75%] flex-col gap-1 ${isMine ? 'items-end' : 'items-start'}`}>
        <div
          className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isMine
              ? 'rounded-br-md bg-gradient-to-br from-[#ff6b35] to-pink-500 text-white'
              : 'rounded-bl-md bg-neutral-800 text-neutral-100'
          }`}
        >
          {message.content}
        </div>
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
