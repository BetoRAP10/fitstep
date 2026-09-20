-- Crea el perfil dentro de la misma transacción de Auth. Esto funciona tanto
-- con confirmación de correo activada como desactivada, sin requerir una
-- sesión del usuario todavía.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, sex, age, height_cm, weight_kg, daily_goal)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), 'Usuario'),
    coalesce(new.raw_user_meta_data ->> 'sex', 'unspecified'),
    coalesce((new.raw_user_meta_data ->> 'age')::integer, 25),
    coalesce((new.raw_user_meta_data ->> 'height_cm')::integer, 170),
    coalesce((new.raw_user_meta_data ->> 'weight_kg')::integer, 70),
    coalesce((new.raw_user_meta_data ->> 'daily_goal')::integer, 8000)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- La app no escribe la tabla directamente. La RPC mantiene los campos en un
-- rango físico razonable y evita que otro usuario pueda suplantar una fila.
alter table public.daily_stats
  add constraint daily_stats_nonnegative check (
    steps_walk >= 0 and steps_run >= 0 and
    seconds_walk >= 0 and seconds_run >= 0 and
    kcal_met >= 0 and kcal_stride >= 0
  );

revoke insert, update on public.daily_stats from anon, authenticated;

create or replace function public.submit_daily_stats(
  p_date date,
  p_steps_walk integer,
  p_steps_run integer,
  p_seconds_walk integer,
  p_seconds_run integer,
  p_kcal_met numeric,
  p_kcal_stride numeric,
  p_activity text
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;
  if p_date not between current_date - 1 and current_date then
    raise exception 'invalid activity date';
  end if;
  if p_steps_walk < 0 or p_steps_run < 0 or p_steps_walk + p_steps_run > 200000
    or p_seconds_walk < 0 or p_seconds_run < 0 or p_seconds_walk + p_seconds_run > 86400
    or p_kcal_met < 0 or p_kcal_met > 5000 or p_kcal_stride < 0 or p_kcal_stride > 5000
    or p_activity not in ('still', 'walking', 'running') then
    raise exception 'invalid activity values';
  end if;

  insert into public.daily_stats (
    user_id, date, steps_walk, steps_run, seconds_walk, seconds_run,
    kcal_met, kcal_stride, activity, updated_at
  ) values (
    auth.uid(), p_date, p_steps_walk, p_steps_run, p_seconds_walk, p_seconds_run,
    p_kcal_met, p_kcal_stride, p_activity, now()
  )
  on conflict (user_id, date) do update set
    steps_walk = excluded.steps_walk,
    steps_run = excluded.steps_run,
    seconds_walk = excluded.seconds_walk,
    seconds_run = excluded.seconds_run,
    kcal_met = excluded.kcal_met,
    kcal_stride = excluded.kcal_stride,
    activity = excluded.activity,
    updated_at = excluded.updated_at;
end;
$$;

revoke all on function public.submit_daily_stats(date, integer, integer, integer, integer, numeric, numeric, text) from public;
grant execute on function public.submit_daily_stats(date, integer, integer, integer, integer, numeric, numeric, text) to authenticated;
