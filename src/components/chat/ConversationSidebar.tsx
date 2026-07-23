import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Search, Heart } from 'lucide-react'
import { PetAvatar } from './PetAvatar'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Conversation } from '@/lib/api/types'

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diffMs / 86_400_000)
  if (days <= 0) return 'Matched today'
  if (days === 1) return 'Matched yesterday'
  if (days < 30) return `Matched ${days}d ago`
  return `Matched ${new Date(iso).toLocaleDateString()}`
}

interface ConversationSidebarProps {
  conversations: Conversation[]
  isLoading: boolean
  selectedMatchId: string | null
  onSelect: (conversation: Conversation) => void
}

export function ConversationSidebar({
  conversations,
  isLoading,
  selectedMatchId,
  onSelect,
}: ConversationSidebarProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return conversations
    return conversations.filter(
      (c) => c.otherPet.name.toLowerCase().includes(q) || c.otherPet.breed.toLowerCase().includes(q),
    )
  }, [conversations, query])

  return (
    <div className="flex h-full w-full flex-col border-r border-neutral-800/80 md:w-80 lg:w-96">
      <div className="flex-shrink-0 border-b border-neutral-800/80 p-4">
        <h1 className="mb-3 font-display text-xl font-bold text-white">Messages</h1>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search matches..."
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950/60 py-2 pl-9 pr-3 text-sm text-white placeholder:text-neutral-500 focus:border-[#ff6b35] focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="space-y-1 p-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex animate-pulse items-center gap-3 rounded-xl px-3 py-3">
                <div className="h-12 w-12 rounded-full bg-neutral-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-2/3 rounded bg-neutral-800" />
                  <div className="h-2.5 w-1/2 rounded bg-neutral-800/70" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && conversations.length === 0 && (
          <EmptyState
            icon={Heart}
            title="No matches yet"
            description="Swipe on some pets to start a conversation."
            className="h-full px-6"
            action={
              <Link
                to="/discover"
                className="rounded-full bg-gradient-to-r from-[#ff6b35] to-pink-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[#ff6b35]/30 transition-transform hover:-translate-y-0.5"
              >
                Find matches
              </Link>
            }
          />
        )}

        {!isLoading && conversations.length > 0 && filtered.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-neutral-500">No matches found for "{query}".</p>
        )}

        <ul className="p-2">
          {filtered.map((conversation) => {
            const isSelected = conversation.matchId === selectedMatchId
            return (
              <li key={conversation.matchId}>
                <button
                  type="button"
                  onClick={() => onSelect(conversation)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                    isSelected ? 'bg-neutral-800/80' : 'hover:bg-neutral-900'
                  }`}
                >
                  <PetAvatar name={conversation.otherPet.name} photoUrl={conversation.otherPet.primary_photo_url} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-semibold text-white">{conversation.otherPet.name}</p>
                    </div>
                    <p className="truncate text-xs text-neutral-500">
                      {conversation.otherPet.breed} · {timeAgo(conversation.createdAt)}
                    </p>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
