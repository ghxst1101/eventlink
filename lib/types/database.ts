export interface Profile {
  id: string
  discord_id: string | null
  username: string
  avatar_url: string | null
  bio: string | null
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  created_at: string
}

export interface Event {
  id: string
  title: string
  description: string
  banner_url: string | null
  category_id: string | null
  organizer_id: string
  organization_id: string | null
  start_time: string
  end_time: string
  stream_url: string | null
  discord_invite_url: string | null
  discord_server_id: string | null
  max_attendees: number | null
  is_live: boolean
  viewer_count: number
  tags: string[] | null
  visibility: "public" | "private" | "unlisted"
  join_code: string | null
  qr_code_url: string | null
  allow_spectators: boolean
  require_auth_to_chat: boolean
  require_auth_to_join: boolean
  custom_game_url: string | null
  custom_game_embed: string | null
  enable_leaderboard: boolean
  enable_achievements: boolean
  enable_voice_chat: boolean
  branding_color: string | null
  created_at: string
  updated_at: string
}

export interface RSVP {
  id: string
  event_id: string
  user_id: string
  status: "going" | "interested" | "not_going"
  created_at: string
}

export interface ChatMessage {
  id: string
  event_id: string
  user_id: string
  message: string
  created_at: string
}

export interface EventWithDetails extends Event {
  category: Category | null
  organizer: Profile
  rsvp_count: number
  user_rsvp?: RSVP | null
}

export interface Organization {
  id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  owner_id: string
  created_at: string
}

export interface OrganizationMember {
  id: string
  organization_id: string
  user_id: string
  role: "owner" | "admin" | "member"
  created_at: string
}

export interface GameSession {
  id: string
  event_id: string
  game_type: string
  status: "waiting" | "active" | "completed"
  settings: Record<string, any>
  current_round: number
  max_rounds: number
  created_at: string
  started_at: string | null
  ended_at: string | null
}

export interface GameParticipant {
  id: string
  session_id: string
  user_id: string | null
  nickname: string
  score: number
  is_spectator: boolean
  joined_at: string
}

export interface GameResponse {
  id: string
  session_id: string
  participant_id: string
  round: number
  response_data: Record<string, any>
  points_earned: number
  created_at: string
}

export interface Moderator {
  id: string
  event_id: string
  user_id: string
  permissions: string[]
  created_at: string
}

export interface EventAnalytics {
  event_id: string
  total_views: number
  peak_viewers: number
  total_participants: number
  total_messages: number
  average_session_duration: number
  updated_at: string
}
