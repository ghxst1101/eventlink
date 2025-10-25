-- Major expansion: Organizations, Game Sessions, Join Codes, Moderators, Custom Games
-- This adds all the infrastructure for the CrowdParty-style features

-- Add organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add organization members
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Add game sessions table for live game instances
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  join_code TEXT UNIQUE NOT NULL,
  is_public BOOLEAN DEFAULT true,
  max_players INTEGER DEFAULT 50,
  current_players INTEGER DEFAULT 0,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'finished')),
  settings JSONB DEFAULT '{}',
  state JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ
);

-- Add game participants
CREATE TABLE IF NOT EXISTS game_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  nickname TEXT NOT NULL,
  avatar_color TEXT DEFAULT '#6366f1',
  score INTEGER DEFAULT 0,
  is_spectator BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW()
);

-- Add moderators table
CREATE TABLE IF NOT EXISTS event_moderators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  permissions JSONB DEFAULT '{"can_kick": true, "can_mute": true, "can_manage_chat": true}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Add custom games table
CREATE TABLE IF NOT EXISTS custom_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  game_type TEXT NOT NULL CHECK (game_type IN ('embedded', 'iframe', 'custom')),
  game_url TEXT,
  game_config JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  play_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add event analytics
CREATE TABLE IF NOT EXISTS event_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  unique_visitors INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  peak_concurrent INTEGER DEFAULT 0,
  total_participants INTEGER DEFAULT 0,
  avg_session_duration INTEGER DEFAULT 0,
  metrics JSONB DEFAULT '{}',
  UNIQUE(event_id, date)
);

-- Add spectator tracking
CREATE TABLE IF NOT EXISTS spectators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_ping TIMESTAMPTZ DEFAULT NOW()
);

-- Update events table with new fields
ALTER TABLE events ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE events ADD COLUMN IF NOT EXISTS allow_spectators BOOLEAN DEFAULT true;
ALTER TABLE events ADD COLUMN IF NOT EXISTS require_approval BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS max_participants INTEGER DEFAULT 100;
ALTER TABLE events ADD COLUMN IF NOT EXISTS custom_game_id UUID REFERENCES custom_games(id) ON DELETE SET NULL;
ALTER TABLE events ADD COLUMN IF NOT EXISTS embed_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS game_settings JSONB DEFAULT '{}';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_game_sessions_join_code ON game_sessions(join_code);
CREATE INDEX IF NOT EXISTS idx_game_sessions_event ON game_sessions(event_id);
CREATE INDEX IF NOT EXISTS idx_game_participants_session ON game_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organization_members_org ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_event_moderators_event ON event_moderators(event_id);
CREATE INDEX IF NOT EXISTS idx_custom_games_creator ON custom_games(creator_id);
CREATE INDEX IF NOT EXISTS idx_spectators_event ON spectators(event_id);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE spectators ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "Organizations are viewable by everyone"
  ON organizations FOR SELECT
  USING (true);

CREATE POLICY "Users can create organizations"
  ON organizations FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Organization owners can update their organizations"
  ON organizations FOR UPDATE
  USING (auth.uid() = owner_id);

-- RLS Policies for organization members
CREATE POLICY "Organization members are viewable by everyone"
  ON organization_members FOR SELECT
  USING (true);

CREATE POLICY "Organization owners can manage members"
  ON organization_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE id = organization_members.organization_id
      AND owner_id = auth.uid()
    )
  );

-- RLS Policies for game sessions
CREATE POLICY "Public game sessions are viewable by everyone"
  ON game_sessions FOR SELECT
  USING (is_public = true OR auth.uid() IN (
    SELECT organizer_id FROM events WHERE id = game_sessions.event_id
  ));

CREATE POLICY "Event organizers can manage game sessions"
  ON game_sessions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE id = game_sessions.event_id
      AND organizer_id = auth.uid()
    )
  );

-- RLS Policies for game participants
CREATE POLICY "Game participants are viewable by session members"
  ON game_participants FOR SELECT
  USING (true);

CREATE POLICY "Users can join games"
  ON game_participants FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own participation"
  ON game_participants FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for moderators
CREATE POLICY "Event moderators are viewable by event organizers"
  ON event_moderators FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE id = event_moderators.event_id
      AND organizer_id = auth.uid()
    )
  );

CREATE POLICY "Event organizers can manage moderators"
  ON event_moderators FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE id = event_moderators.event_id
      AND organizer_id = auth.uid()
    )
  );

-- RLS Policies for custom games
CREATE POLICY "Public custom games are viewable by everyone"
  ON custom_games FOR SELECT
  USING (is_public = true OR auth.uid() = creator_id);

CREATE POLICY "Users can create custom games"
  ON custom_games FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their custom games"
  ON custom_games FOR UPDATE
  USING (auth.uid() = creator_id);

-- RLS Policies for analytics
CREATE POLICY "Event organizers can view analytics"
  ON event_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE id = event_analytics.event_id
      AND organizer_id = auth.uid()
    )
  );

-- RLS Policies for spectators
CREATE POLICY "Spectators are viewable by event organizers"
  ON spectators FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE id = spectators.event_id
      AND organizer_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can become a spectator"
  ON spectators FOR INSERT
  WITH CHECK (true);

-- Function to generate unique join codes
CREATE OR REPLACE FUNCTION generate_join_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to update participant count
CREATE OR REPLACE FUNCTION update_session_player_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE game_sessions
  SET current_players = (
    SELECT COUNT(*) FROM game_participants
    WHERE session_id = COALESCE(NEW.session_id, OLD.session_id)
    AND is_spectator = false
  )
  WHERE id = COALESCE(NEW.session_id, OLD.session_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_player_count_trigger
AFTER INSERT OR DELETE ON game_participants
FOR EACH ROW
EXECUTE FUNCTION update_session_player_count();
