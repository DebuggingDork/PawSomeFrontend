import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { MessageCircle, Heart } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { getConversations } from '@/lib/api/matches'
import { PetAvatar } from '@/components/chat/PetAvatar'
import { SignInPrompt } from '@/components/ui/SignInPrompt'
import { SafetyMenu } from '@/components/safety/SafetyMenu'

function timeAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (days <= 0) return 'Matched today'
  if (days === 1) return 'Matched yesterday'
  if (days < 30) return `Matched ${days}d ago`
  return `Matched ${new Date(iso).toLocaleDateString()}`
}

function MatchesPage() {
  const { isAuthenticated, isHydrating, pets } = useAuthStore()

  const conversationsQuery = useQuery({
    queryKey: ['matches', 'conversations', pets.map((p) => p.id)],
    queryFn: () => getConversations(pets.map((p) => p.id)),
    enabled: isAuthenticated && !isHydrating && pets.length > 0,
  })

  if (!isHydrating && !isAuthenticated) {
    return (
      <SignInPrompt
        title="Sign in to see your matches"
        message="Pets your pets have matched with will show up here."
      />
    )
  }

  const conversations = conversationsQuery.data ?? []
  const isLoading = isHydrating || conversationsQuery.isLoading

  return (
    <div className="mx-auto max-w-5xl px-6 pb-16 pt-24 md:pt-28">
      <h1 className="mb-1 font-display text-2xl font-bold text-white">Your Matches</h1>
      <p className="mb-8 text-neutral-400">Everyone you and your pets have matched with.</p>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-neutral-900/60" />
          ))}
        </div>
      )}

      {!isLoading && conversations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center text-neutral-500">
          <Heart className="mb-3 h-10 w-10" />
          <p className="mb-1 font-medium text-neutral-300">No matches yet</p>
          <p className="mb-5 text-sm">Swipe on some pets to start matching.</p>
          <Link
            to="/discover"
            className="rounded-full bg-gradient-to-r from-[#ff6b35] to-pink-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#ff6b35]/30 transition-transform hover:-translate-y-0.5"
          >
            Find matches
          </Link>
        </div>
      )}

      {!isLoading && conversations.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {conversations.map((conversation) => (
            <Link
              key={conversation.matchId}
              to={`/chat?match=${conversation.matchId}`}
              className="group relative flex flex-col rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-5 transition-colors hover:border-[#ff6b35]/60"
            >
              {conversation.otherPet.owner?.id && (
                <SafetyMenu
                  userId={conversation.otherPet.owner.id}
                  petId={conversation.otherPet.id}
                  otherName={conversation.otherPet.name}
                  className="absolute right-3 top-3"
                  onBlocked={() => conversationsQuery.refetch()}
                />
              )}
              <div className="mb-4 flex items-center gap-3">
                <PetAvatar name={conversation.otherPet.name} photoUrl={conversation.otherPet.primary_photo_url} size="lg" />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{conversation.otherPet.name}</p>
                  <p className="truncate text-xs text-neutral-500">{conversation.otherPet.breed}</p>
                </div>
              </div>
              <p className="mb-4 text-xs text-neutral-500">{timeAgo(conversation.createdAt)}</p>
              <div className="mt-auto flex items-center gap-1.5 text-sm font-semibold text-[#ff8c5c] group-hover:text-[#ff6b35]">
                <MessageCircle className="h-4 w-4" />
                Message
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default MatchesPage
