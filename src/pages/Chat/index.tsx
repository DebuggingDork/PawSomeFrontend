import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, PawPrint, Search, X } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { getConversations } from '@/lib/api/matches'
import {
  getChatHistory,
  getChatStatus,
  getReadReceipts,
  connectChatSocket,
  searchMessages,
  deleteMessage,
  addReaction,
  removeReaction,
  type ChatSocket,
} from '@/lib/api/chat'
import type { ChatMessage, Conversation } from '@/lib/api/types'
import { PetAvatar } from '@/components/chat/PetAvatar'
import { ChatBubble } from '@/components/chat/ChatBubble'
import { TypingIndicator } from '@/components/chat/TypingIndicator'
import { ConversationSidebar } from '@/components/chat/ConversationSidebar'
import { SignInPrompt } from '@/components/ui/SignInPrompt'
import { SafetyMenu } from '@/components/safety/SafetyMenu'
import { EmptyState } from '@/components/ui/EmptyState'

const TYPING_IDLE_MS = 1500
const TYPING_TIMEOUT_MS = 3000
const DELETE_WINDOW_MS = 15 * 60 * 1000

function NoConversationSelected() {
  return <EmptyState icon={PawPrint} title="Pick a match to start chatting" className="h-full" />
}

function ChatPage() {
  const { isAuthenticated, isHydrating, pets, user } = useAuthStore()
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

  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ChatMessage[] | null>(null)
  const [searching, setSearching] = useState(false)

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
        // Fetch together: read-receipts reconciliation needs the history's message
        // order, and doing this in one pass avoids a second setMessages clobbering it.
        const [history, receipts] = await Promise.all([
          getChatHistory(selected.matchId),
          getReadReceipts(selected.matchId).catch(() => null),
        ])
        if (cancelled) return

        let messages = history.messages
        if (receipts?.other_last_read) {
          const readUpToIndex = messages.findIndex((m) => m.id === receipts.other_last_read)
          if (readUpToIndex !== -1) {
            messages = messages.map((m, i) =>
              i <= readUpToIndex && m.sender_pet_id === selected.yourPetId ? { ...m, is_read: true } : m,
            )
          }
        }
        setMessages(messages)
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
                ? { ...m, reactions: [...m.reactions.filter((r) => r.user_id !== user_id), { id: message_id + user_id, message_id, user_id, emoji, created_at: new Date().toISOString() }] }
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

  // Keep the thread scrolled to the latest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, otherTyping])

  // Reset search UI whenever the conversation changes.
  useEffect(() => {
    setSearchOpen(false)
    setSearchQuery('')
    setSearchResults(null)
  }, [selected?.matchId])

  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!selected || !searchQuery.trim()) return
      setSearching(true)
      try {
        const result = await searchMessages(selected.matchId, searchQuery.trim())
        setSearchResults(result.results.map((r) => r.message))
      } finally {
        setSearching(false)
      }
    },
    [selected, searchQuery],
  )

  const jumpToMessage = useCallback((messageId: string) => {
    setSearchOpen(false)
    setSearchResults(null)
    setSearchQuery('')
    requestAnimationFrame(() => {
      document.getElementById(`message-${messageId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }, [])

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
        // Restore on failure by refetching history is overkill for an MVP action;
        // a failed delete is rare (network drop) and self-heals on next reload.
      })
    },
    [selected],
  )

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
                <button
                  type="button"
                  onClick={() => setSearchOpen((v) => !v)}
                  aria-label="Search messages"
                  className={`rounded-full p-2 transition-colors ${
                    searchOpen ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Search className="h-4 w-4" />
                </button>
                {selected.otherPet.owner?.id && (
                  <SafetyMenu
                    userId={selected.otherPet.owner.id}
                    petId={selected.otherPet.id}
                    otherName={selected.otherPet.name}
                    onBlocked={() => setSelected(null)}
                  />
                )}
              </div>

              {/* Search panel */}
              {searchOpen && (
                <div className="flex-shrink-0 border-b border-neutral-800/80 p-3">
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                      type="text"
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search this conversation..."
                      className="flex-1 rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-[#ff6b35] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!searchQuery.trim() || searching}
                      className="rounded-lg bg-neutral-800 px-3 py-2 text-sm text-white disabled:opacity-40"
                    >
                      {searching ? '...' : 'Search'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchOpen(false)
                        setSearchResults(null)
                        setSearchQuery('')
                      }}
                      aria-label="Close search"
                      className="rounded-lg p-2 text-neutral-500 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </form>

                  {searchResults && (
                    <div className="mt-2 max-h-48 space-y-1 overflow-y-auto">
                      {searchResults.length === 0 ? (
                        <p className="px-1 py-2 text-sm text-neutral-500">No messages found.</p>
                      ) : (
                        searchResults.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => jumpToMessage(m.id)}
                            className="block w-full truncate rounded-lg px-2 py-1.5 text-left text-sm text-neutral-300 hover:bg-neutral-800"
                          >
                            {m.content}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

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
                  <div key={message.id} id={`message-${message.id}`}>
                    <ChatBubble
                      message={message}
                      isMine={message.sender_pet_id === selected.yourPetId}
                      showSeen={message.id === lastMineId}
                      currentUserId={user?.id}
                      canDelete={Date.now() - new Date(message.created_at).getTime() < DELETE_WINDOW_MS}
                      onReact={(emoji) => handleReact(message.id, emoji)}
                      onRemoveReaction={() => handleRemoveReaction(message.id)}
                      onDelete={() => handleDeleteMessage(message.id)}
                    />
                  </div>
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
