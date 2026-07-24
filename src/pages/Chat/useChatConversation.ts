import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getChatHistory,
  getChatStatus,
  getReadReceipts,
  connectChatSocket,
  deleteMessage,
  addReaction,
  removeReaction,
  type ChatSocket,
} from '@/lib/api/chat'
import type { ChatMessage, Conversation } from '@/lib/api/types'

const TYPING_IDLE_MS = 1500
const TYPING_TIMEOUT_MS = 3000

/** Owns everything about the currently-selected conversation: history load,
 * the live WebSocket (messages/typing/read/reactions/delete), and the
 * actions a message thread needs to send. The list of all conversations is
 * a separate concern and stays in the page component. */
export function useChatConversation(selected: Conversation | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [otherOnline, setOtherOnline] = useState(false)
  const [otherTyping, setOtherTyping] = useState(false)
  const [draft, setDraft] = useState('')
  const [connected, setConnected] = useState(false)

  const socketRef = useRef<ChatSocket | null>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const remoteTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load history + open the live socket whenever the selected match changes.
  useEffect(() => {
    if (!selected) return

    let cancelled = false

    const loadHistory = async () => {
      setMessagesLoading(true)
      setMessages([])
      setOtherTyping(false)
      setConnected(false)
      try {
        // Fetch together: read-receipts reconciliation needs the history's message
        // order, and doing this in one pass avoids a second setMessages clobbering it.
        const [history, receipts] = await Promise.all([
          getChatHistory(selected.matchId),
          getReadReceipts(selected.matchId).catch(() => null),
        ])
        if (cancelled) return

        let msgs = history.messages
        if (receipts?.other_last_read) {
          const readUpToIndex = msgs.findIndex((m) => m.id === receipts.other_last_read)
          if (readUpToIndex !== -1) {
            msgs = msgs.map((m, i) =>
              i <= readUpToIndex && m.sender_pet_id === selected.yourPetId ? { ...m, is_read: true } : m,
            )
          }
        }
        setMessages(msgs)
      } finally {
        if (!cancelled) setMessagesLoading(false)
      }
    }
    loadHistory()

    getChatStatus(selected.matchId)
      .then((status) => !cancelled && setOtherOnline(status.is_online))
      .catch(() => {})

    const socket = connectChatSocket(selected.matchId, {
      onOpen: () => !cancelled && setConnected(true),
      onClose: () => !cancelled && setConnected(false),
      onEvent: (event) => {
        if (cancelled) return

        if (event.type === 'message') {
          setMessages((prev) => (prev.some((m) => m.id === event.data.id) ? prev : [...prev, event.data]))
          if (event.data.sender_pet_id !== selected.yourPetId) {
            socket.sendRead(event.data.id)
          }
        } else if (event.type === 'typing') {
          if (event.data.pet_id !== selected.otherPet.id) return
          setOtherTyping(event.data.is_typing)
          if (remoteTypingTimeoutRef.current) clearTimeout(remoteTypingTimeoutRef.current)
          if (event.data.is_typing) {
            remoteTypingTimeoutRef.current = setTimeout(() => setOtherTyping(false), TYPING_TIMEOUT_MS)
          }
        } else if (event.type === 'read') {
          if (event.data.pet_id !== selected.otherPet.id) return
          setMessages((prev) =>
            prev.map((m) => (m.sender_pet_id === selected.yourPetId ? { ...m, is_read: true } : m)),
          )
        } else if (event.type === 'reaction') {
          const { message_id, user_id, emoji } = event.data
          setMessages((prev) =>
            prev.map((m) =>
              m.id === message_id
                ? {
                    ...m,
                    reactions: [
                      ...m.reactions.filter((r) => r.user_id !== user_id),
                      { id: message_id + user_id, message_id, user_id, emoji, created_at: new Date().toISOString() },
                    ],
                  }
                : m,
            ),
          )
        } else if (event.type === 'reaction_removed') {
          const { message_id, user_id } = event.data
          setMessages((prev) =>
            prev.map((m) =>
              m.id === message_id ? { ...m, reactions: m.reactions.filter((r) => r.user_id !== user_id) } : m,
            ),
          )
        } else if (event.type === 'message_deleted') {
          const { message_id } = event.data
          setMessages((prev) => prev.filter((m) => m.id !== message_id))
        }
      },
    })

    socketRef.current = socket

    return () => {
      cancelled = true
      socket.close()
      socketRef.current = null
      if (remoteTypingTimeoutRef.current) clearTimeout(remoteTypingTimeoutRef.current)
    }
  }, [selected])

  const handleDraftChange = useCallback((value: string) => {
    setDraft(value)
    const socket = socketRef.current
    if (!socket) return

    socket.sendTyping(true)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => socket.sendTyping(false), TYPING_IDLE_MS)
  }, [])

  const handleSend = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const content = draft.trim()
      const socket = socketRef.current
      if (!content || !socket) return

      socket.sendMessage(content)
      socket.sendTyping(false)
      setDraft('')
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    },
    [draft],
  )

  const handleReact = useCallback(
    (messageId: string, emoji: string) => {
      if (!selected) return
      addReaction(selected.matchId, messageId, emoji).catch(() => {})
    },
    [selected],
  )

  const handleRemoveReaction = useCallback(
    (messageId: string) => {
      if (!selected) return
      removeReaction(selected.matchId, messageId).catch(() => {})
    },
    [selected],
  )

  const handleDeleteMessage = useCallback(
    (messageId: string) => {
      if (!selected) return
      setMessages((prev) => prev.filter((m) => m.id !== messageId))
      deleteMessage(selected.matchId, messageId).catch(() => {
        // A failed delete is rare (network drop) and self-heals on next reload;
        // not worth the complexity of reconciling optimistic state on failure.
      })
    },
    [selected],
  )

  return {
    messages,
    messagesLoading,
    otherOnline,
    otherTyping,
    connected,
    draft,
    handleDraftChange,
    handleSend,
    handleReact,
    handleRemoveReaction,
    handleDeleteMessage,
  }
}
