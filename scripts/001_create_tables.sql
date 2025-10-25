-- Create profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  discord_id text unique,
  username text not null,
  avatar_url text,
  bio text,
  created_at timestamptz default now()
);

-- Create categories table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  icon text,
  color text,
  created_at timestamptz default now()
);

-- Create events table
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  banner_url text,
  category_id uuid references public.categories(id) on delete set null,
  organizer_id uuid references public.profiles(id) on delete cascade not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  stream_url text,
  discord_invite_url text,
  discord_server_id text,
  max_attendees integer,
  is_live boolean default false,
  viewer_count integer default 0,
  tags text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create RSVPs table
create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text check (status in ('going', 'interested', 'not_going')) default 'going',
  created_at timestamptz default now(),
  unique(event_id, user_id)
);

-- Create chat_messages table for live event chat
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  message text not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.events enable row level security;
alter table public.rsvps enable row level security;
alter table public.chat_messages enable row level security;

-- Profiles policies
create policy "profiles_select_all"
  on public.profiles for select
  using (true);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Categories policies (public read, admin write)
create policy "categories_select_all"
  on public.categories for select
  using (true);

-- Events policies
create policy "events_select_all"
  on public.events for select
  using (true);

create policy "events_insert_authenticated"
  on public.events for insert
  with check (auth.uid() = organizer_id);

create policy "events_update_own"
  on public.events for update
  using (auth.uid() = organizer_id);

create policy "events_delete_own"
  on public.events for delete
  using (auth.uid() = organizer_id);

-- RSVPs policies
create policy "rsvps_select_all"
  on public.rsvps for select
  using (true);

create policy "rsvps_insert_own"
  on public.rsvps for insert
  with check (auth.uid() = user_id);

create policy "rsvps_update_own"
  on public.rsvps for update
  using (auth.uid() = user_id);

create policy "rsvps_delete_own"
  on public.rsvps for delete
  using (auth.uid() = user_id);

-- Chat messages policies
create policy "chat_messages_select_all"
  on public.chat_messages for select
  using (true);

create policy "chat_messages_insert_authenticated"
  on public.chat_messages for insert
  with check (auth.uid() = user_id);

create policy "chat_messages_delete_own"
  on public.chat_messages for delete
  using (auth.uid() = user_id);

-- Create indexes for performance
create index if not exists idx_events_start_time on public.events(start_time);
create index if not exists idx_events_category on public.events(category_id);
create index if not exists idx_events_organizer on public.events(organizer_id);
create index if not exists idx_events_is_live on public.events(is_live);
create index if not exists idx_rsvps_event on public.rsvps(event_id);
create index if not exists idx_rsvps_user on public.rsvps(user_id);
create index if not exists idx_chat_messages_event on public.chat_messages(event_id);
