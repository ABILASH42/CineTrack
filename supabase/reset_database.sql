-- ==========================================
-- CINETRACK CLEAN DATABASE RESET SCRIPT
-- ==========================================

-- 1. Drop existing tables and triggers cleanly
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;
drop table if exists public.collection_items cascade;
drop table if exists public.collections cascade;
drop table if exists public.user_movies cascade;
drop table if exists public.profiles cascade;

-- 2. Create Profiles Table (Linked to Auth users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);


-- 3. Create User Movies Watchlist Table
create table public.user_movies (
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

alter table public.user_movies enable row level security;

create policy "Users can view their own movie logs" on public.user_movies
  for select using (auth.uid() = user_id);

create policy "Users can insert their own movie logs" on public.user_movies
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own movie logs" on public.user_movies
  for update using (auth.uid() = user_id);

create policy "Users can delete their own movie logs" on public.user_movies
  for delete using (auth.uid() = user_id);


-- 4. Create Custom Collections Table
create table public.collections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  is_public boolean default true not null,
  posters text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.collections enable row level security;

create policy "Users can view own or public collections" on public.collections
  for select using (is_public or auth.uid() = user_id);

create policy "Users can create own collections" on public.collections
  for insert with check (auth.uid() = user_id);

create policy "Users can update own collections" on public.collections
  for update using (auth.uid() = user_id);

create policy "Users can delete own collections" on public.collections
  for delete using (auth.uid() = user_id);


-- 5. Automatic Profile Provisioning Trigger
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
