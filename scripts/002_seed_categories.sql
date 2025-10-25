-- Insert event categories
insert into public.categories (name, slug, description, icon, color) values
  ('Gaming', 'gaming', 'Gaming tournaments, playthroughs, and community events', '🎮', '#8b5cf6'),
  ('Streamer Shows', 'streamer-shows', 'Live shows, podcasts, and entertainment', '🎬', '#ec4899'),
  ('Music', 'music', 'Concerts, DJ sets, and music performances', '🎵', '#f59e0b'),
  ('Tech', 'tech', 'Tech talks, coding streams, and workshops', '💻', '#3b82f6'),
  ('Art', 'art', 'Art streams, creative sessions, and showcases', '🎨', '#10b981'),
  ('Community', 'community', 'Community hangouts and social events', '👥', '#06b6d4'),
  ('Learning', 'learning', 'Educational content and tutorials', '📚', '#6366f1'),
  ('Sports', 'sports', 'Sports watch parties and discussions', '⚽', '#ef4444')
on conflict (slug) do nothing;
