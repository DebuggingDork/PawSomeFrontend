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
  url: string
  is_primary: boolean
  sort_order: number
}

export interface PetOwner {
  id: string
  full_name: string | null
  occupation: string | null
  profile_photo_url: string | null
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
  lat?: number
  lng?: number
  primary_photo_url?: string | null
  photos?: PetPhoto[]
  owner?: PetOwner
  created_at?: string
  updated_at?: string
}

export interface PetCreateInput {
  name: string
  species: string
  breed: string
  age_months: number
  gender: 'male' | 'female'
  bio?: string
  lat: number
  lng: number
}

export type PetUpdateInput = Partial<PetCreateInput>

export interface PresignResponse {
  upload_url: string
  object_key: string
  expires_in: number
}

// --- Onboarding ---

export type OnboardingStep =
  | 'email_verification'
  | 'profile_basics'
  | 'profile_photo'
  | 'pet_profile'
  | 'pet_photos'
  | 'preferences'
  | 'complete'

export interface OnboardingStepStatus {
  step: OnboardingStep
  title: string
  description: string
  completed: boolean
  required: boolean
  action_url: string | null
  action_text: string | null
}

export interface OnboardingStatus {
  current_step: OnboardingStep
  total_steps: number
  completed_steps: number
  completion_percentage: number
  is_complete: boolean
  steps: OnboardingStepStatus[]
  can_start_swiping: boolean
  should_show_wizard: boolean
}

// --- Users / profile ---

export interface UserProfile {
  id: string
  full_name: string | null
  occupation: string | null
  bio: string | null
  profile_photo_url: string | null
  address?: string | null
  email?: string
  is_verified?: boolean
  latitude?: number | null
  longitude?: number | null
}

export interface UserProfileUpdateInput {
  full_name?: string
  occupation?: string
  bio?: string
  address?: string
  latitude?: number
  longitude?: number
}

export interface ProfileCompletionStatus {
  completion_percentage: number
  is_complete: boolean
  completed_fields: string[]
  missing_fields: string[]
  suggestions: string[]
  profile_fields_complete: number
  pet_profile_complete: number
  total_pets: number
  active_pets: number
}

// Request field is preferred_match_radius_km; the response calls it preferred_radius_km.
export interface MatchPreferencesUpdateInput {
  preferred_match_radius_km?: number
  preferred_species?: string
  preferred_age_min?: number
  preferred_age_max?: number
  preferred_gender?: string
  breed_preferences?: string[]
}

export interface MatchPreferences {
  id: string
  user_id: string
  preferred_species: string | null
  preferred_age_min: number | null
  preferred_age_max: number | null
  preferred_gender: string | null
  preferred_radius_km: number | null
  breed_preferences: string[] | null
  updated_at: string
}

// --- Achievements ---

export type AchievementType =
  | 'profile_photo'
  | 'full_name'
  | 'pet_created'
  | 'pet_photo'
  | 'first_match'
  | 'five_matches'
  | 'first_message'
  | 'profile_complete'
  | 'verified_email'

export interface AchievementBadge {
  type: AchievementType
  name: string
  description: string
  icon: string
  earned: boolean
  earned_at: string | null
}

export interface AchievementSummary {
  total_earned: number
  total_available: number
  completion_percentage: number
  badges: AchievementBadge[]
  recent_achievements: { id: string; achievement_type: AchievementType; earned_at: string }[]
}

// --- Browse / swipe / notifications ---

export interface BrowseCandidate {
  pet: Pet
  distance_km: number
  calculated_at: string
}

export interface BrowsePetsResponse {
  candidates: BrowseCandidate[]
  total: number
  filters_applied: Record<string, unknown>
}

export interface BrowseFilters {
  species?: string
  age_min?: number
  age_max?: number
  gender?: string
  radius?: number
  limit?: number
}

export interface SwipeInput {
  pet_id: string
  target_pet_id: string
  action: 'like' | 'skip'
}

export interface SwipeResult {
  id: string
  swiper_pet_id: string
  target_pet_id: string
  action: string
  is_match: boolean
  match_id: string | null
  created_at: string
}

export interface UndoSwipeResult {
  message: string
  swipe_id: string
  action_taken: 'swipe_reverted' | 'match_deleted'
}

export interface LikesReceivedResponse {
  pets: Pet[]
  total: number
}

export interface NotificationWithDetails {
  id: string
  notification_type: 'new_match' | 'new_like'
  message: string
  is_read: boolean
  created_at: string
  read_at: string | null
  your_pet: { id: string; name: string; primary_photo_url: string | null }
  other_pet: { id: string; name: string; primary_photo_url: string | null }
  match_id: string | null
}

export interface DailySwipeStats {
  date: string
  likes: number
  skips: number
}

export interface TopBreed {
  breed: string
  count: number
}

export interface SwipeStatistics {
  pet_id: string
  total_likes: number
  total_skips: number
  like_to_skip_ratio: number
  matches_created: number
  avg_response_time_minutes: number | null
  last_30_days: DailySwipeStats[]
  top_breeds_liked: TopBreed[]
}

// --- Favorites / blocks / reports ---

export interface Favorite {
  id: string
  target_pet: Pet
  created_at: string
}

export interface BlockedUser {
  id: string
  full_name: string | null
  profile_photo_url: string | null
}

export interface Block {
  id: string
  blocked_user: BlockedUser
  created_at: string
}

export type ReportReason = 'inappropriate_content' | 'harassment' | 'fake_profile' | 'spam' | 'other'

export interface ReportInput {
  reported_user_id: string
  reported_pet_id?: string
  reason: ReportReason
  description: string
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
