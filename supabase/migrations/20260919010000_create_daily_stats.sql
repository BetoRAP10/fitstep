create table if not exists public.daily_stats (
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  steps_walk integer not null default 0,
  steps_run integer not null default 0,
  seconds_walk integer not null default 0,
  seconds_run integer not null default 0,
  kcal_met numeric not null default 0,
  kcal_stride numeric not null default 0,
  activity text not null default 'still' check (activity in ('still', 'walking', 'running')),
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

alter table public.daily_stats enable row level security;

create policy "Users can view their own daily stats"
  on public.daily_stats for select
  using (auth.uid() = user_id);

create policy "Users can insert their own daily stats"
  on public.daily_stats for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own daily stats"
  on public.daily_stats for update
  using (auth.uid() = user_id);

-- Vista pública para el ranking: solo nombre, calorías, actividad y fecha.
-- Peso, estatura, edad, sexo y correo nunca salen del perfil propio: esta
-- vista corre con los permisos de quien la creó, no con los de quien la
-- consulta, así que puede exponer datos agregados sin heredar las políticas
-- restrictivas de las tablas base.
create or replace view public.ranking_public as
select
  d.user_id,
  p.display_name,
  d.date,
  d.kcal_met as kcal,
  d.activity,
  d.updated_at
from public.daily_stats d
join public.profiles p on p.id = d.user_id;

grant select on public.ranking_public to anon, authenticated;
