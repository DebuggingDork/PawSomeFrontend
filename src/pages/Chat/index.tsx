import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Search, CalendarHeart, ArrowLeft } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/useAuthStore'
import { CONVERSATIONS_QUERY_KEY, getConversations, getPlaydates } from '@/lib/api/matches'
import type { Conversation } from '@/lib/api/types'
import { PetAvatar } from '@/components/chat/PetAvatar'
import { ChatBubble } from '@/components/chat/ChatBubble'
import { TypingIndicator } from '@/components/chat/TypingIndicator'
import { ConversationSidebar } from '@/components/chat/ConversationSidebar'
import { ChatSearchPanel } from '@/components/chat/ChatSearchPanel'
import { PlaydatePanel } from '@/components/chat/PlaydatePanel'
import { SignInPrompt } from '@/components/ui/SignInPrompt'
import { SafetyMenu } from '@/components/safety/SafetyMenu'
import { ChatIdlePanel } from '@/components/chat/ChatIdlePanel'
import { useChatConversation } from './useChatConversation'

const DELETE_WINDOW_MS = 15 * 60 * 1000


function ChatPage() {
  const { isAuthenticated, isHydrating, pets, user } = useAuthStore()
  const [searchParams] = useSearchParams()

  const [selected, setSelected] = useState<Conversation | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [playdatesOpen, setPlaydatesOpen] = useState(false)
  const [playdatesViewed, setPlaydatesViewed] = useState(false)

  const scrollRef = useRef<HTMLDivElement | null>(null)

  const {
    messages,
    messagesLoading,
    otherOnline,
    otherTyping,
    draft,
    handleDraftChange,
    handleSend,
    handleReact,
    handleRemoveReaction,
    handleDeleteMessage,
  } = useChatConversation(selected)

  // React Query rather than a one-shot effect, so the list has a cache key
  // something else can invalidate. The notification socket does exactly that on
  // NEW_MESSAGE (see NotificationsRuntime): before this, the sidebar was loaded
  // once per mount and nothing could refresh it, so a conversation that arrived
  // while you sat on this page stayed invisible until a reload.
  const conversationsQuery = useQuery({
    queryKey: CONVERSATIONS_QUERY_KEY,
    queryFn: getConversations,
    enabled: !isHydrating && isAuthenticated && pets.length > 0,
    // A refetch must not replace the object `selected` points at, or the chat
    // socket — keyed on that identity — would tear down and re-open on every
    // incoming message. `selected` stays its own state for that reason.
    staleTime: 10_000,
  })

  const conversations = conversationsQuery.data ?? []

  // Open the thread a `?match=` link explicitly asked for, once the list that
  // can resolve it has arrived.
  useEffect(() => {
    if (!conversationsQuery.data) return
    const requestedMatchId = searchParams.get('match')
    const requested = requestedMatchId
      ? conversationsQuery.data.find((c) => c.matchId === requestedMatchId)
      : undefined
    // Deliberately no `?? convos[0]`: landing on /chat must not put a real
    // conversation on screen by itself. Opening the page in a cafe or next
    // to a colleague would otherwise expose whichever thread happened to be
    // most recent, with no action taken to ask for it. A `?match=` link is
    // different — that is an explicit request for one specific thread, so
    // it still opens directly.
    setSelected((current) => current ?? requested ?? null)
  }, [conversationsQuery.data, searchParams])

  // Keep the thread scrolled to the latest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, otherTyping])

  // Close search/playdates whenever the conversation changes.
  useEffect(() => {
    setSearchOpen(false)
    setPlaydatesOpen(false)
    setPlaydatesViewed(false)
  }, [selected?.matchId])

  // Query playdates to check for pending responses
  const playdatesQuery = useQuery({
    queryKey: ['playdates', selected?.matchId],
    queryFn: () => getPlaydates(selected!.matchId),
    enabled: !!selected?.matchId,
    refetchInterval: 30_000, // Refresh every 30 seconds
  })

  const pendingPlaydatesCount =
    playdatesQuery.data?.items.filter((p) => p.is_mine_to_respond && p.status === 'pending').length ?? 0
  const hasUnviewedPendingPlaydates = !playdatesViewed && pendingPlaydatesCount > 0

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
  const yourPetName = pets.find((p) => p.id === selected?.yourPetId)?.name

  return (
    <div className="px-3 pb-4 pt-24 md:px-6 md:pt-28">
      {/* `dvh`, not `vh`. On a phone `vh` is measured against the viewport with
          the browser chrome retracted, so this box was ~60px taller than what
          you can see whenever the address bar is showing — and the thing that
          fell off the bottom was the composer, on the one screen people use
          every day. Paired with `interactive-widget=resizes-content` in the
          viewport meta, so the keyboard shortens this box instead of covering
          it. */}
      <div className="mx-auto flex h-[calc(100dvh-7.5rem)] max-w-6xl overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-900/40 shadow-2xl shadow-black/30">
        {/* One pane at a time on mobile, both side by side from md up. The
            sidebar is `w-full` below md, so leaving both mounted there left
            the thread squeezed to almost no width — a conversation opened on a
            phone was effectively invisible. */}
        <ConversationSidebar
          conversations={conversations}
          isLoading={isHydrating || conversationsQuery.isLoading}
          selectedMatchId={selected?.matchId ?? null}
          onSelect={setSelected}
          className={selected ? 'hidden md:flex' : 'flex'}
        />

        <div className={`min-w-0 flex-1 flex-col ${selected ? 'flex' : 'hidden md:flex'}`}>
          {!selected && <ChatIdlePanel />}

          {selected && (
            <>
              {/* Conversation header */}
              <div className="flex flex-shrink-0 items-center gap-3 border-b border-neutral-800/80 px-4 py-3.5 md:px-5">
                {/* Mobile only: the list is hidden while a thread is open, so
                    without this there is no way back to it. */}
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  aria-label="Back to conversations"
                  className="-ml-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white md:hidden"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <Link
                  to={`/pets/${selected.otherPet.id}`}
                  title={`View ${selected.otherPet.name}'s profile`}
                  className="flex-shrink-0 rounded-full ring-1 ring-transparent transition-all hover:ring-[#ff6b35]/60"
                >
                  <PetAvatar name={selected.otherPet.name} photoUrl={selected.otherPet.primary_photo_url} online={otherOnline} />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to={`/pets/${selected.otherPet.id}`} className="block w-fit max-w-full truncate font-semibold text-white hover:text-[#ff8c5c]">
                    {selected.otherPet.name}
                  </Link>
                  <p className="truncate text-xs text-neutral-500">
                    {otherOnline ? 'Online now' : selected.otherPet.breed}
                    {/* Whose conversation this is. Every message you send here
                        is from this pet, and with several pets there was
                        nothing on screen saying which. */}
                    {pets.length > 1 && yourPetName && (
                      <span className="text-neutral-600"> · as {yourPetName}</span>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPlaydatesOpen((v) => !v)
                    setSearchOpen(false)
                    setPlaydatesViewed(true)
                  }}
                  aria-label="Propose a playdate"
                  title="Propose a playdate"
                  className={`group relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                    playdatesOpen
                      ? 'bg-[#ff6b35] text-white shadow-[0_0_0_1px_rgba(255,107,53,0.4)]'
                      : 'bg-[#ff6b35]/10 text-[#ff9466] shadow-[0_0_14px_-2px_rgba(255,107,53,0.55)] hover:bg-[#ff6b35]/20 hover:text-white hover:shadow-[0_0_18px_0px_rgba(255,107,53,0.75)]'
                  }`}
                >
                  {!playdatesOpen && !hasUnviewedPendingPlaydates && (
                    <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#ff6b35]/25" />
                  )}
                  <CalendarHeart className="h-4 w-4" />
                  <span className="hidden sm:inline">Plan a playdate</span>
                  {hasUnviewedPendingPlaydates && (
                    <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-white ring-2 ring-neutral-900" />
                  )}
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
