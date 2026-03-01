create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  handle text not null,
  display_name text not null,
  avatar text not null,
  bio text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_handle_unique on public.profiles (lower(handle));

create table if not exists public.roasters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null,
  ethos text not null,
  equipment text not null,
  logo text not null,
  website text,
  created_by uuid not null references public.profiles (id),
  status text not null default 'active' check (status in ('active', 'hidden', 'removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  coffee_name text not null,
  coffee_url text,
  roaster_id uuid not null references public.roasters (id) on delete restrict,
  brew_method text not null,
  coffee_weight numeric(6,1) not null,
  water_weight numeric(6,1) not null,
  ratio text not null,
  country text,
  varietal text,
  process text,
  taste_notes text not null,
  flavor_profiles text[] not null default '{}',
  rating numeric(2,1) not null,
  ai_advice text,
  color text not null,
  likes_count integer not null default 0,
  reports_count integer not null default 0,
  status text not null default 'active' check (status in ('active', 'hidden', 'removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_likes_count_idx on public.posts (likes_count desc);

create table if not exists public.post_likes (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id),
  target_type text not null check (target_type in ('post', 'roaster', 'profile')),
  target_id uuid not null,
  reason text not null,
  details text,
  status text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles (id)
);

create table if not exists public.ai_usage_daily (
  user_id uuid not null references public.profiles (id) on delete cascade,
  usage_date date not null,
  request_count integer not null default 0,
  primary key (user_id, usage_date)
);

create table if not exists public.rate_limit_buckets (
  identifier text not null,
  route_key text not null,
  window_start timestamptz not null,
  request_count integer not null default 0,
  primary key (identifier, route_key, window_start)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists roasters_set_updated_at on public.roasters;
create trigger roasters_set_updated_at
before update on public.roasters
for each row execute function public.set_updated_at();

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.toggle_post_like(p_post_id uuid)
returns table (liked boolean, likes_count integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user uuid := auth.uid();
  exists_like boolean;
begin
  if current_user is null then
    raise exception 'Authentication required';
  end if;

  select exists (
    select 1
    from public.post_likes
    where post_id = p_post_id
      and user_id = current_user
  ) into exists_like;

  if exists_like then
    delete from public.post_likes
    where post_id = p_post_id
      and user_id = current_user;

    update public.posts
    set likes_count = greatest(likes_count - 1, 0)
    where id = p_post_id;

    return query
    select false, likes_count
    from public.posts
    where id = p_post_id;
  else
    insert into public.post_likes (post_id, user_id)
    values (p_post_id, current_user)
    on conflict do nothing;

    update public.posts
    set likes_count = likes_count + 1
    where id = p_post_id;

    return query
    select true, likes_count
    from public.posts
    where id = p_post_id;
  end if;
end;
$$;

create or replace function public.increment_post_reports(p_post_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.posts
  set reports_count = reports_count + 1
  where id = p_post_id;
$$;

create or replace function public.consume_ai_quota(p_limit integer)
returns table (allowed boolean, request_count integer, remaining integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user uuid := auth.uid();
  current_count integer;
begin
  if current_user is null then
    raise exception 'Authentication required';
  end if;

  insert into public.ai_usage_daily (user_id, usage_date, request_count)
  values (current_user, current_date, 1)
  on conflict (user_id, usage_date)
  do update set request_count = public.ai_usage_daily.request_count + 1
  returning public.ai_usage_daily.request_count into current_count;

  if current_count > p_limit then
    update public.ai_usage_daily
    set request_count = request_count - 1
    where user_id = current_user
      and usage_date = current_date;

    return query select false, p_limit, 0;
  end if;

  return query select true, current_count, greatest(p_limit - current_count, 0);
end;
$$;

create or replace function public.consume_rate_limit(
  p_identifier text,
  p_route_key text,
  p_limit integer,
  p_window_seconds integer
)
returns table (allowed boolean, remaining integer, reset_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_bucket timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  current_count integer;
begin
  insert into public.rate_limit_buckets (identifier, route_key, window_start, request_count)
  values (p_identifier, p_route_key, current_bucket, 1)
  on conflict (identifier, route_key, window_start)
  do update set request_count = public.rate_limit_buckets.request_count + 1
  returning public.rate_limit_buckets.request_count into current_count;

  return query
  select current_count <= p_limit,
         greatest(p_limit - current_count, 0),
         current_bucket + make_interval(secs => p_window_seconds);
end;
$$;

alter table public.profiles enable row level security;
alter table public.roasters enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.reports enable row level security;
alter table public.ai_usage_daily enable row level security;
alter table public.rate_limit_buckets enable row level security;

drop policy if exists "Profiles are public" on public.profiles;
create policy "Profiles are public"
on public.profiles
for select
using (true);

drop policy if exists "Users can create own profile" on public.profiles;
create policy "Users can create own profile"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Roasters are public when active" on public.roasters;
create policy "Roasters are public when active"
on public.roasters
for select
using (status = 'active' or public.is_admin());

drop policy if exists "Authenticated users can add roasters" on public.roasters;
create policy "Authenticated users can add roasters"
on public.roasters
for insert
to authenticated
with check (created_by = auth.uid());

drop policy if exists "Admins can moderate roasters" on public.roasters;
create policy "Admins can moderate roasters"
on public.roasters
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Posts are public when active" on public.posts;
create policy "Posts are public when active"
on public.posts
for select
using (status = 'active' or public.is_admin());

drop policy if exists "Authenticated users can add posts" on public.posts;
create policy "Authenticated users can add posts"
on public.posts
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Admins can moderate posts" on public.posts;
create policy "Admins can moderate posts"
on public.posts
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Users can view own likes" on public.post_likes;
create policy "Users can view own likes"
on public.post_likes
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Users can manage own likes" on public.post_likes;
create policy "Users can manage own likes"
on public.post_likes
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can create reports" on public.reports;
create policy "Users can create reports"
on public.reports
for insert
to authenticated
with check (reporter_id = auth.uid());

drop policy if exists "Users can view own reports" on public.reports;
create policy "Users can view own reports"
on public.reports
for select
to authenticated
using (reporter_id = auth.uid() or public.is_admin());

drop policy if exists "Admins can moderate reports" on public.reports;
create policy "Admins can moderate reports"
on public.reports
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Users can read own ai usage" on public.ai_usage_daily;
create policy "Users can read own ai usage"
on public.ai_usage_daily
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can manage own ai usage" on public.ai_usage_daily;
create policy "Users can manage own ai usage"
on public.ai_usage_daily
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Authenticated users can use rate limit buckets" on public.rate_limit_buckets;
create policy "Authenticated users can use rate limit buckets"
on public.rate_limit_buckets
for all
to authenticated
using (true)
with check (true);

grant execute on function public.toggle_post_like(uuid) to authenticated;
grant execute on function public.increment_post_reports(uuid) to authenticated;
grant execute on function public.consume_ai_quota(integer) to authenticated;
grant execute on function public.consume_rate_limit(text, text, integer, integer) to authenticated;

