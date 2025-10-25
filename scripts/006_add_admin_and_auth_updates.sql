-- Add admin role and email to profiles
alter table public.profiles add column if not exists role text default 'user' check (role in ('user', 'admin'));
alter table public.profiles add column if not exists email text;

-- Create index on email for faster lookups
create index if not exists idx_profiles_email on public.profiles(email);

-- Update RLS policies for admin access
create policy "admin_full_access_categories"
  on public.categories for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "admin_full_access_events"
  on public.events for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Create games table for built-in games
create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  thumbnail_url text,
  category text not null check (category in ('arcade', 'casino', 'racing', 'puzzle')),
  is_active boolean default true,
  play_count integer default 0,
  created_at timestamptz default now()
);

-- Create game_scores table for leaderboards
create table if not exists public.game_scores (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references public.games(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  score integer not null,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Enable RLS on games tables
alter table public.games enable row level security;
alter table public.game_scores enable row level security;

-- Games policies
create policy "games_select_all"
  on public.games for select
  using (is_active = true);

create policy "admin_full_access_games"
  on public.games for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Game scores policies
create policy "game_scores_select_all"
  on public.game_scores for select
  using (true);

create policy "game_scores_insert_authenticated"
  on public.game_scores for insert
  with check (auth.uid() = user_id);

-- Create indexes
create index if not exists idx_games_category on public.games(category);
create index if not exists idx_games_slug on public.games(slug);
create index if not exists idx_game_scores_game on public.game_scores(game_id);
create index if not exists idx_game_scores_user on public.game_scores(user_id);
create index if not exists idx_game_scores_score on public.game_scores(score desc);

-- Function to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, email, avatar_url, discord_id, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'provider_id',
    case 
    -- Using hardcoded email for now but probably bad idea for you to use this method
      when new.email = 'ENTER_ADMIN_EMAIL_HERE' then 'admin'
      else 'user'
    end
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if it exists and recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
