import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, PawPrint, Search, Calendar } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { getConversations } from '@/lib/api/matches'
import type { Conversation } from '@/lib/api/types'
import { PetAvatar } from '@/components/chat/PetAvatar'
import { ChatBubble } from '@/components/chat/ChatBubble'
import { TypingIndicator } from '@/components/chat/TypingIndicator'
import { ConversationSidebar } from '@/components/chat/ConversationSidebar'
import { ChatSearchPanel } from '@/components/chat/ChatSearchPanel'
import { PlaydatePanel } from '@/components/chat/PlaydatePanel'
import { SignInPrompt } from '@/components/ui/SignInPrompt'
import { SafetyMenu } from '@/components/safety/SafetyMenu'
import { EmptyState } from '@/components/ui/EmptyState'
import { useChatConversation } from './useChatConversation'

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
  const [searchOpen, setSearchOpen] = useState(false)
  const [playdatesOpen, setPlaydatesOpen] = useState(false)

  const scrollRef = useRef<HTMLDivElement | null>(null)

  const {
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
  } = useChatConversation(selected)

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

  // Keep the thread scrolled to the latest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, otherTyping])

  // Close search/playdates whenever the conversation changes.
  useEffect(() => {
    setSearchOpen(false)
    setPlaydatesOpen(false)
  }, [selected?.matchId])

  const jumpToMessage = (messageId: string) => {
    setSearchOpen(false)
    requestAnimationFrame(() => {
      document.getElementById(`message-${messageId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }

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
      <div className="mx-auto flex h-[calc(100vh-7.5rem)] max-w-6xl overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-900/40 shadow-2xl shadow-black/30">
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
                  onClick={() => {
                    setPlaydatesOpen((v) => !v)
                    setSearchOpen(false)
                  }}
                  aria-label="Schedule playdate"
                  title="Playdates"
                  className={`rounded-full p-2 transition-colors ${
                    playdatesOpen ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen((v) => !v)
                    setPlaydatesOpen(false)
                  }}
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
                    matchId={selected.matchId}
                    otherName={selected.otherPet.name}
                    onBlocked={() => setSelected(null)}
                    onUnmatched={() => setSelected(null)}
                  />
                )}
              </div>

              {searchOpen && (
                <ChatSearchPanel
                  matchId={selected.matchId}
                  onClose={() => setSearchOpen(false)}
                  onJumpToMessage={jumpToMessage}
                />
              )}

              {playdatesOpen && (
                <PlaydatePanel
                  matchId={selected.matchId}
                  yourPetId={selected.yourPetId}
                  otherPetName={selected.otherPet.name}
                  onClose={() => setPlaydatesOpen(false)}
                />
              )}

              {/* Message thread */}
              <div
                ref={scrollRef}
                className="thin-scrollbar lenis-prevent-scroll flex-1 space-y-3 overflow-y-auto px-5 py-4"
              >
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
