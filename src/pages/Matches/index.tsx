import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { MessageCircle, Heart } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { getConversations } from '@/lib/api/matches'
import { PetAvatar } from '@/components/chat/PetAvatar'
import { SignInPrompt } from '@/components/ui/SignInPrompt'
import { SafetyMenu } from '@/components/safety/SafetyMenu'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'

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
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      )}

      {!isLoading && conversations.length === 0 && (
        <EmptyState
          size="lg"
          icon={Heart}
          title="No matches yet"
          description="Swipe on some pets to start matching."
          action={
            <Link
              to="/discover"
              className="rounded-full bg-gradient-to-r from-[#ff6b35] to-pink-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#ff6b35]/30 transition-transform hover:-translate-y-0.5"
            >
              Find matches
            </Link>
          }
        />
      )}

      {!isLoading && conversations.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {conversations.map((conversation) => (
            <div
              key={conversation.matchId}
              className="group relative flex min-h-[180px] flex-col rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-5 shadow-black/20 transition-all hover:border-[#ff6b35]/60 hover:shadow-xl"
            >
              <div className="mb-4 flex items-start gap-4">
                <PetAvatar name={conversation.otherPet.name} photoUrl={conversation.otherPet.primary_photo_url} size="xl" />
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                  <h3 className="truncate text-lg font-semibold text-white">{conversation.otherPet.name}</h3>
                  <p className="truncate text-sm text-neutral-400">{conversation.otherPet.breed}</p>
                  <p className="mt-1 text-xs text-neutral-500">{timeAgo(conversation.createdAt)}</p>
                </div>
                {conversation.otherPet.owner?.id && (
                  <SafetyMenu
                    userId={conversation.otherPet.owner.id}
                    petId={conversation.otherPet.id}
                    matchId={conversation.matchId}
                    otherName={conversation.otherPet.name}
                    className="flex-shrink-0"
                    onBlocked={() => conversationsQuery.refetch()}
                    onUnmatched={() => conversationsQuery.refetch()}
                  />
                )}
              </div>

              <Link
                to={`/chat?match=${conversation.matchId}`}
                className="mt-auto flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#ff6b35] to-pink-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#ff6b35]/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#ff6b35]/30"
              >
                <MessageCircle className="h-4 w-4" />
                Send Message
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MatchesPage
