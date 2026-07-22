import { apiFetch } from './client'
import { getPet } from './pets'
import type { Conversation, MatchSummary } from './types'

export function getMyMatches(): Promise<MatchSummary[]> {
  return apiFetch<MatchSummary[]>('/matches/my-matches')
}

/**
 * Loads the caller's matches and resolves each one into a Conversation —
 * pairing the match with whichever pet in it isn't one of `myPetIds`.
 */
export async function getConversations(myPetIds: string[]): Promise<Conversation[]> {
  const matches = await getMyMatches()
  const ownIds = new Set(myPetIds)

  const conversations = await Promise.all(
    matches.map(async (match) => {
      const yourPetId = ownIds.has(match.pet1_id) ? match.pet1_id : match.pet2_id
      const otherPetId = yourPetId === match.pet1_id ? match.pet2_id : match.pet1_id
      const otherPet = await getPet(otherPetId)

      return {
        matchId: match.id,
        yourPetId,
        otherPet,
        createdAt: match.created_at,
      } satisfies Conversation
    }),
  )

  return conversations.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}
