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
  is_verified?: boolean
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
  address?: string | null
  pincode?: string | null
  primary_photo_url?: string | null
  photos?: PetPhoto[]
  owner?: PetOwner | null
  created_at?: string
  updated_at?: string
  is_vaccinated: boolean
  vaccination_date?: string | null
  is_neutered: boolean
  is_trained: boolean
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
  address?: string
  pincode?: string
  is_vaccinated?: boolean
  vaccination_date?: string | null
  is_neutered?: boolean
  is_trained?: boolean
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

export interface PetSummary {
  id: string
  name: string
  species: string
  breed: string
  primary_photo_url: string | null
}

export interface UserProfile {
  id: string
  full_name: string | null
  occupation: string | null
  bio: string | null
  profile_photo_url: string | null
  address?: string | null
  pincode?: string | null
  email?: string
  is_verified?: boolean
  latitude?: number | null
  longitude?: number | null
  pets: PetSummary[]
}

export interface UserProfileUpdateInput {
  full_name?: string
  occupation?: string
  bio?: string
  address?: string
  pincode?: string
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

export interface MatchPreferencesUpdateInput {
  preferred_radius_km?: number
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
  compatibility_score?: number | null
}

export interface BrowsePetsResponse {
  candidates: BrowseCandidate[]
  total: number
  filters_applied: Record<string, unknown>
}

export interface BrowseFilters {
  species?: string
  breed?: string
  age_min?: number
  age_max?: number
  gender?: string
  radius?: number
  is_vaccinated?: boolean
  is_neutered?: boolean
  is_trained?: boolean
  limit?: number
}

export interface SwipeInput {
  pet_id: string
  target_pet_id: string
  action: 'like' | 'skip' | 'super_like'
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

export type NotificationType =
  | 'new_match'
  | 'new_like'
  | 'new_message'
  | 'playdate_proposed'
  | 'playdate_response'

export interface NotificationWithDetails {
  id: string
  notification_type: NotificationType
  message: string
  is_read: boolean
  is_super: boolean
  created_at: string
  read_at: string | null
  your_pet: { id: string; name: string; primary_photo_url: string | null }
  other_pet: { id: string; name: string; primary_photo_url: string | null }
  match_id: string | null
}

/** Lighter payload pushed over the live notifications WebSocket — just enough
 * to show a toast immediately; the full row (with your_pet) comes from a
 * REST refetch triggered alongside it. */
export interface NotificationPushEvent {
  type: 'notification'
  data: {
    id: string
    notification_type: NotificationType
    message: string
    is_read: boolean
    is_super: boolean
    created_at: string
    match_id: string | null
    other_pet: { id: string; name: string; primary_photo_url: string | null }
  }
}

export interface SuperWoofStatus {
  remaining: number
  limit: number
  window_seconds: number
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

export interface SwipeHistoryItem {
  swipe_id: string
  action: 'like' | 'skip'
  created_at: string
  target_pet: Pet & { owner?: PetOwner }
}

export interface SwipeHistoryResponse {
  swipes: SwipeHistoryItem[]
  total: number
  limit: number
  offset: number
}

export interface SwipeHistoryFilters {
  action?: 'like' | 'skip'
  breed?: string
  date_from?: string
  date_to?: string
  limit?: number
  offset?: number
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

export interface ReadReceipts {
  match_id: string
  your_last_read: string | null
  other_last_read: string | null
  unread_count: number
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
  | { type: 'reaction'; data: { message_id: string; user_id: string; emoji: string } }
  | { type: 'reaction_removed'; data: { message_id: string; user_id: string } }
  | { type: 'message_deleted'; data: { message_id: string } }

export interface ChatSearchResponse {
  results: { message: ChatMessage; relevance_score: number }[]
  total: number
  query: string
}

// --- Playdates ---

export type PlaydateStatus = 'pending' | 'accepted' | 'declined' | 'cancelled'

export interface PlaydatePetInfo {
  id: string
  name: string
  primary_photo_url: string | null
}

export interface Playdate {
  id: string
  match_id: string
  scheduled_at: string
  location_name: string
  latitude: number
  longitude: number
  address: string | null
  pincode: string | null
  note: string | null
  status: PlaydateStatus
  proposed_by_pet: PlaydatePetInfo
  proposed_to_pet: PlaydatePetInfo
  is_mine_to_respond: boolean
  created_at: string
  responded_at: string | null
}

export interface PlaydateListResponse {
  items: Playdate[]
  total: number
}

export interface PlaydateCreateInput {
  scheduled_at: string
  location_name: string
  latitude: number
  longitude: number
  address?: string
  pincode?: string
  note?: string
}

// --- Events ---

export interface EventCreatorInfo {
  id: string
  full_name: string | null
  profile_photo_url: string | null
}

export interface CommunityEvent {
  id: string
  title: string
  description: string | null
  location_name: string
  latitude: number
  longitude: number
  address: string | null
  pincode: string | null
  event_time: string
  species: string | null
  creator: EventCreatorInfo
  attendee_count: number
  is_cancelled: boolean
  your_rsvp_status: 'going' | 'interested' | null
  created_at: string
}

export interface EventListResponse {
  items: CommunityEvent[]
  total: number
  limit: number
  offset: number
}

export interface EventCreateInput {
  title: string
  description?: string
  location_name: string
  latitude: number
  longitude: number
  address?: string
  pincode?: string
  event_time: string
  species?: string
}

export interface EventRSVPInput {
  pet_id?: string
  status: 'going' | 'interested'
}

export interface EventRSVPResult {
  id: string
  event_id: string
  status: string
  pet_id: string | null
  created_at: string
}

export interface EventAttendee {
  user_id: string
  full_name: string | null
  profile_photo_url: string | null
  status: string
  pet: { id: string; name: string; species: string; primary_photo_url: string | null } | null
}

export interface EventAttendeesResponse {
  items: EventAttendee[]
  total: number
}
