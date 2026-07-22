import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, PawPrint } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { getConversations } from '@/lib/api/matches'
import { getChatHistory, getChatStatus, connectChatSocket, type ChatSocket } from '@/lib/api/chat'
import type { ChatMessage, Conversation } from '@/lib/api/types'
import { PetAvatar } from '@/components/chat/PetAvatar'
import { ChatBubble } from '@/components/chat/ChatBubble'
import { TypingIndicator } from '@/components/chat/TypingIndicator'
import { ConversationSidebar } from '@/components/chat/ConversationSidebar'
import { SignInPrompt } from '@/components/ui/SignInPrompt'

const TYPING_IDLE_MS = 1500
const TYPING_TIMEOUT_MS = 3000

function NoConversationSelected() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-neutral-500">
      <PawPrint className="h-10 w-10" />
      <p className="font-medium">Pick a match to start chatting</p>
    </div>
  )
}

function ChatPage() {
  const { isAuthenticated, isHydrating, pets } = useAuthStore()
  const [searchParams] = useSearchParams()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [conversationsLoading, setConversationsLoading] = useState(true)
  const [selected, setSelected] = useState<Conversation | null>(null)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [otherOnline, setOtherOnline] = useState(false)
  const [otherTyping, setOtherTyping] = useState(false)
  const [draft, setDraft] = useState('')
  const [connected, setConnected] = useState(false)

  const socketRef = useRef<ChatSocket | null>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const remoteTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  // Load the pet-owner's matches once we know who they and their pets are.
  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (isHydrating || !isAuthenticated || pets.length === 0) {
        if (!cancelled) setConversationsLoading(false)
        return
      }

      setConversationsLoading(true)
      try {
        const convos = await getConversations(pets.map((p) => p.id))
        if (cancelled) return
        setConversations(convos)
        const requestedMatchId = searchParams.get('match')
        const requested = requestedMatchId ? convos.find((c) => c.matchId === requestedMatchId) : undefined
        setSelected((current) => current ?? requested ?? convos[0] ?? null)
      } finally {
        if (!cancelled) setConversationsLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [isHydrating, isAuthenticated, pets])

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
        const history = await getChatHistory(selected.matchId)
        if (!cancelled) setMessages(history.messages)
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

  // Keep the thread scrolled to the latest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, otherTyping])

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

  if (!isHydrating && !isAuthenticated) {
    return (
      <SignInPrompt
        title="Sign in to see your chats"
        message="Your conversations with matched pet owners live here once you're signed in."
      />
    )
  }

  const lastMineId = [...messages].reverse().find((m) => m.sender_pet_id === selected?.yourPetId)?.id

  return (
    <div className="px-3 pb-4 pt-24 md:px-6 md:pt-28">
      <div className="mx-auto flex h-[calc(100vh-7.5rem)] max-w-6xl overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-900/40 shadow-2xl shadow-black/30 backdrop-blur-sm">
        <ConversationSidebar
          conversations={conversations}
          isLoading={isHydrating || conversationsLoading}
          selectedMatchId={selected?.matchId ?? null}
          onSelect={setSelected}
        />

        <div className="flex flex-1 flex-col">
          {!selected && <NoConversationSelected />}

          {selected && (
            <>
              {/* Conversation header */}
              <div className="flex flex-shrink-0 items-center gap-3 border-b border-neutral-800/80 px-5 py-3.5">
                <PetAvatar name={selected.otherPet.name} photoUrl={selected.otherPet.primary_photo_url} online={otherOnline} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">{selected.otherPet.name}</p>
                  <p className="truncate text-xs text-neutral-500">
                    {otherOnline ? 'Online now' : selected.otherPet.breed}
                  </p>
                </div>
                {!connected && (
                  <span className="rounded-full bg-neutral-800 px-2.5 py-1 text-[11px] text-neutral-400">
                    Connecting…
                  </span>
                )}
              </div>

              {/* Message thread */}
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                {messagesLoading && (
                  <div className="flex h-full items-center justify-center text-sm text-neutral-500">
                    Loading conversation…
                  </div>
                )}

                {!messagesLoading && messages.length === 0 && (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-neutral-500">
                    <PetAvatar name={selected.otherPet.name} photoUrl={selected.otherPet.primary_photo_url} size="lg" />
                    <p className="font-medium text-neutral-300">You matched with {selected.otherPet.name}!</p>
                    <p className="text-sm">Say hello 👋</p>
                  </div>
                )}

                {messages.map((message) => (
                  <ChatBubble
                    key={message.id}
                    message={message}
                    isMine={message.sender_pet_id === selected.yourPetId}
                    showSeen={message.id === lastMineId}
                  />
                ))}

                <AnimatePresence>
                  {otherTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                    >
                      <TypingIndicator />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Composer */}
              <form onSubmit={handleSend} className="flex flex-shrink-0 gap-2 border-t border-neutral-800/80 p-4">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => handleDraftChange(e.target.value)}
                  placeholder={`Message ${selected.otherPet.name}...`}
                  className="flex-1 rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:border-[#ff6b35] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!draft.trim()}
                  className="flex items-center justify-center rounded-xl bg-gradient-to-r from-[#ff6b35] to-pink-500 px-5 text-white shadow-lg shadow-[#ff6b35]/30 transition-all hover:shadow-xl hover:shadow-[#ff6b35]/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatPage
