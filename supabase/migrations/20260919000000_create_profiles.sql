create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  sex text not null check (sex in ('male', 'female', 'unspecified')),
  age integer not null check (age between 10 and 100),
  height_cm integer not null check (height_cm between 120 and 230),
  weight_kg integer not null check (weight_kg between 30 and 250),
  daily_goal integer not null default 8000,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);
