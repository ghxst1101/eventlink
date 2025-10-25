-- Create demo organizer profiles (these will be linked to real users when they sign up)
-- For now, we'll create placeholder profiles that can be claimed

-- Insert demo events with realistic data
do $$
declare
  gaming_cat_id uuid;
  streamer_cat_id uuid;
  music_cat_id uuid;
  tech_cat_id uuid;
  art_cat_id uuid;
  community_cat_id uuid;
  learning_cat_id uuid;
begin
  -- Get category IDs
  select id into gaming_cat_id from public.categories where slug = 'gaming';
  select id into streamer_cat_id from public.categories where slug = 'streamer-shows';
  select id into music_cat_id from public.categories where slug = 'music';
  select id into tech_cat_id from public.categories where slug = 'tech';
  select id into art_cat_id from public.categories where slug = 'art';
  select id into community_cat_id from public.categories where slug = 'community';
  select id into learning_cat_id from public.categories where slug = 'learning';

  -- Note: We'll need to update organizer_id with real user IDs after authentication is set up
  -- For now, we'll create events without organizer_id (will be added in a later migration)
end $$;

-- We'll add the actual event data after we have real user profiles from Discord OAuth
