-- CineTrack Supabase Schema for Multi-User Isolation

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);


-- 2. User Movies Watchlist Table
create table if not exists public.user_movies (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  tmdb_id integer not null,
  title text not null,
  poster_path text,
  release_date text,
  runtime integer default 120,
  status text check (status in ('plan_to_watch', 'watching', 'completed', 'dropped')) not null,
  rating numeric(3, 1) check (rating >= 0 and rating <= 10),
  review text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, tmdb_id)
);

-- Enable RLS for user_movies
alter table public.user_movies enable row level security;

create policy "Users can view their own movie logs" on public.user_movies
  for select using (auth.uid() = user_id);

create policy "Users can insert their own movie logs" on public.user_movies
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own movie logs" on public.user_movies
  for update using (auth.uid() = user_id);

create policy "Users can delete their own movie logs" on public.user_movies
  for delete using (auth.uid() = user_id);


-- 3. Custom Collections Table
create table if not exists public.collections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  is_public boolean default true not null,
  posters text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for collections
alter table public.collections enable row level security;

create policy "Public collections are viewable by everyone, private only by owner" on public.collections
  for select using (is_public or auth.uid() = user_id);

create policy "Users can create collections" on public.collections
  for insert with check (auth.uid() = user_id);

create policy "Users can update own collections" on public.collections
  for update using (auth.uid() = user_id);

create policy "Users can delete own collections" on public.collections
  for delete using (auth.uid() = user_id);


-- Automatically create profile on auth signup trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
