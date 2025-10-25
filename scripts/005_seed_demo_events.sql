-- First, we need to create a demo organizer profile
-- This will be a system user that can be used for demo events

do $$
declare
  demo_user_id uuid := '00000000-0000-0000-0000-000000000001';
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

  -- Create demo organizer profile (if it doesn't exist)
  insert into public.profiles (id, username, avatar_url, bio)
  values (
    demo_user_id,
    'EventLink Demo',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
    'Official EventLink demo account showcasing platform features'
  )
  on conflict (id) do nothing;

  -- Insert demo events
  -- Live Gaming Tournament
  insert into public.events (
    title,
    description,
    banner_url,
    category_id,
    organizer_id,
    start_time,
    end_time,
    stream_url,
    discord_invite_url,
    max_attendees,
    is_live,
    viewer_count,
    tags
  ) values (
    'Valorant Champions Tournament - Grand Finals',
    'Watch the best Valorant teams compete for the championship title! Epic gameplay, amazing plays, and a $50,000 prize pool. Join us for the most exciting esports event of the year!',
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1280&h=720&fit=crop',
    gaming_cat_id,
    demo_user_id,
    now() - interval '1 hour',
    now() + interval '3 hours',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://discord.gg/valorant',
    500,
    true,
    1247,
    array['valorant', 'esports', 'tournament', 'competitive']
  );

  -- Live Music Performance
  insert into public.events (
    title,
    description,
    banner_url,
    category_id,
    organizer_id,
    start_time,
    end_time,
    stream_url,
    discord_invite_url,
    is_live,
    viewer_count,
    tags
  ) values (
    'Electronic Dreams - Live DJ Set',
    'Join us for an incredible electronic music experience! DJ Nexus brings you the hottest tracks and exclusive remixes. Perfect vibes for your Friday night!',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1280&h=720&fit=crop',
    music_cat_id,
    demo_user_id,
    now() - interval '30 minutes',
    now() + interval '2 hours',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://discord.gg/music',
    true,
    856,
    array['edm', 'electronic', 'dj', 'live-music']
  );

  -- Upcoming Coding Workshop
  insert into public.events (
    title,
    description,
    banner_url,
    category_id,
    organizer_id,
    start_time,
    end_time,
    discord_invite_url,
    max_attendees,
    tags
  ) values (
    'Build a Full-Stack App with Next.js 16',
    'Learn how to build modern web applications with Next.js 16, React 19, and Supabase. We''ll cover server components, server actions, real-time features, and deployment. Perfect for intermediate developers!',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1280&h=720&fit=crop',
    tech_cat_id,
    demo_user_id,
    now() + interval '2 days',
    now() + interval '2 days 3 hours',
    'https://discord.gg/nextjs',
    100,
    array['nextjs', 'react', 'coding', 'workshop', 'tutorial']
  );

  -- Upcoming Art Stream
  insert into public.events (
    title,
    description,
    banner_url,
    category_id,
    organizer_id,
    start_time,
    end_time,
    discord_invite_url,
    tags
  ) values (
    'Digital Painting Masterclass - Fantasy Characters',
    'Watch as I create a fantasy character from scratch! I''ll share my process, tips, and techniques for digital painting. Great for artists of all skill levels. Bring your questions!',
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1280&h=720&fit=crop',
    art_cat_id,
    demo_user_id,
    now() + interval '1 day',
    now() + interval '1 day 4 hours',
    'https://discord.gg/art',
    array['digital-art', 'painting', 'tutorial', 'fantasy']
  );

  -- Upcoming Community Hangout
  insert into public.events (
    title,
    description,
    banner_url,
    category_id,
    organizer_id,
    start_time,
    end_time,
    discord_invite_url,
    max_attendees,
    tags
  ) values (
    'Friday Night Gaming Hangout',
    'Join our community for a chill Friday night! We''ll be playing various games, chatting, and having a great time. Everyone is welcome! Bring your favorite games and let''s have fun together.',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1280&h=720&fit=crop',
    community_cat_id,
    demo_user_id,
    now() + interval '3 days',
    now() + interval '3 days 5 hours',
    'https://discord.gg/community',
    50,
    array['gaming', 'community', 'hangout', 'casual']
  );

  -- Upcoming Streamer Show
  insert into public.events (
    title,
    description,
    banner_url,
    category_id,
    organizer_id,
    start_time,
    end_time,
    stream_url,
    discord_invite_url,
    tags
  ) values (
    'The Late Night Show with StreamerX',
    'Your favorite late-night entertainment! Interviews with special guests, hilarious segments, viewer interactions, and surprise giveaways. Don''t miss this week''s episode!',
    'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=1280&h=720&fit=crop',
    streamer_cat_id,
    demo_user_id,
    now() + interval '4 days',
    now() + interval '4 days 2 hours',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://discord.gg/streamer',
    array['entertainment', 'talk-show', 'comedy', 'interactive']
  );

  -- Upcoming Learning Session
  insert into public.events (
    title,
    description,
    banner_url,
    category_id,
    organizer_id,
    start_time,
    end_time,
    discord_invite_url,
    max_attendees,
    tags
  ) values (
    'Introduction to Machine Learning - Beginner Friendly',
    'Start your ML journey! We''ll cover the basics of machine learning, explore popular algorithms, and build your first ML model together. No prior experience required!',
    'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1280&h=720&fit=crop',
    learning_cat_id,
    demo_user_id,
    now() + interval '5 days',
    now() + interval '5 days 3 hours',
    'https://discord.gg/learning',
    75,
    array['machine-learning', 'ai', 'tutorial', 'beginner']
  );

  -- Another Gaming Event
  insert into public.events (
    title,
    description,
    banner_url,
    category_id,
    organizer_id,
    start_time,
    end_time,
    discord_invite_url,
    max_attendees,
    tags
  ) values (
    'Minecraft Build Competition - Medieval Theme',
    'Show off your building skills! Create the most impressive medieval structure in 3 hours. Prizes for top 3 builders. All skill levels welcome!',
    'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1280&h=720&fit=crop',
    gaming_cat_id,
    demo_user_id,
    now() + interval '6 days',
    now() + interval '6 days 3 hours',
    'https://discord.gg/minecraft',
    30,
    array['minecraft', 'building', 'competition', 'creative']
  );

end $$;
