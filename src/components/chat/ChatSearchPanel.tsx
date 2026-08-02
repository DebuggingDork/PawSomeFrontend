import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { searchMessages } from '@/lib/api/chat'
import type { ChatMessage } from '@/lib/api/types'

interface ChatSearchPanelProps {
  matchId: string
  onClose: () => void
  onJumpToMessage: (messageId: string) => void
}

export function ChatSearchPanel({ matchId, onClose, onJumpToMessage }: ChatSearchPanelProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ChatMessage[] | null>(null)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    setQuery('')
    setResults(null)
  }, [matchId])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    try {
      const result = await searchMessages(matchId, query.trim())
      setResults(result.results.map((r) => r.message))
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="flex-shrink-0 border-b border-neutral-800/80 p-3">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search this conversation..."
          className="flex-1 rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-white placeholder:text-neutral-400 focus:border-brand focus:outline-none"
        />
        <button
          type="submit"
          disabled={!query.trim() || searching}
          className="rounded-lg bg-neutral-800 px-3 py-2 text-sm text-white disabled:opacity-40"
        >
          {searching ? '...' : 'Search'}
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close search"
          className="rounded-lg p-2 text-neutral-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </form>

      {results && (
        <div className="thin-scrollbar lenis-prevent-scroll mt-2 max-h-48 space-y-1 overflow-y-auto">
          {results.length === 0 ? (
            <p className="px-1 py-2 text-sm text-neutral-400">No messages found.</p>
          ) : (
            results.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onJumpToMessage(m.id)}
                className="block w-full truncate rounded-lg px-2 py-1.5 text-left text-sm text-neutral-300 hover:bg-neutral-800"
              >
                {m.content}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
