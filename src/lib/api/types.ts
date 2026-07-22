// Mirrors the FastAPI response schemas in backend/app/schemas/*.py

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface UserResponse {
  id: string
  email: string
  full_name?: string | null
  is_verified: boolean
}

export interface PetPhoto {
  id: string
  photo_url: string
  is_primary: boolean
}

export interface Pet {
  id: string
  user_id?: string
  name: string
  species: string
  breed: string
  age_months: number
  gender: string
  bio?: string | null
  is_active: boolean
  primary_photo_url?: string | null
  photos?: PetPhoto[]
}

export interface MatchSummary {
  id: string
  pet1_id: string
  pet2_id: string
  created_at: string
}

export interface ChatReaction {
  id: string
  message_id: string
  user_id: string
  emoji: string
  created_at: string
}

export interface ChatMessage {
  id: string
  match_id: string
  sender_pet_id: string
  content: string
  msg_type: string
  created_at: string
  is_read: boolean
  reactions: ChatReaction[]
}

export interface ChatHistoryResponse {
  messages: ChatMessage[]
  total: number
  has_more: boolean
  unread_count: number
}

export interface ChatStatus {
  match_id: string
  other_pet_id: string
  is_online: boolean
  message_count: number
}

/** A match enriched with the other pet's public profile, for display in the UI. */
export interface Conversation {
  matchId: string
  yourPetId: string
  otherPet: Pet
  createdAt: string
}

export type ChatSocketEvent =
  | { type: 'message'; data: ChatMessage }
  | { type: 'typing'; data: { pet_id: string; is_typing: boolean } }
  | { type: 'read'; data: { pet_id: string; message_id: string; read_at: string } }
