-- Host accounts, step 1: hosts sign in with an email link (Supabase Auth)
-- and edit their own page text and weekly schedule. The site is static, so
-- nothing here is read live: the deploy workflow fetches the edits before
-- every build (scripts/fetch-host-edits.mjs) and the site lays them over
-- the copy in content.ts and the schedule in live-workshops.json.
--
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.
-- Then add hosts to host_members (Table Editor), one row per email + slug.

-- Who may edit which host page. Jirel adds rows by hand; a host with two
-- cards (Nicole: nicole + whittle) gets two rows.
create table if not exists public.host_members (
  email      text not null,
  slug       text not null,
  created_at timestamptz not null default now(),
  primary key (email, slug)
);
alter table public.host_members enable row level security;
drop policy if exists "read own memberships" on public.host_members;
create policy "read own memberships" on public.host_members
  for select to authenticated
  using (lower(email) = lower(auth.jwt() ->> 'email'));

-- True when the signed-in user may edit this host. security definer so the
-- policies below can look into host_members whatever its own policies say.
create or replace function public.is_host_member(s text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.host_members m
    where m.slug = s and lower(m.email) = lower(auth.jwt() ->> 'email')
  );
$$;

-- A host's own words for their page, in English and/or German. Empty
-- fields keep what the site has. Public to read: it is what the site shows.
create table if not exists public.host_profiles (
  slug       text not null,
  lang       text not null check (lang in ('en', 'de')),
  specialty  text check (char_length(specialty) <= 80),
  studio     text check (char_length(studio) <= 80),
  blurb      text check (char_length(blurb) <= 1500),
  group_size text check (char_length(group_size) <= 80),
  duration   text check (char_length(duration) <= 40),
  place      text check (char_length(place) <= 120),
  languages  text check (char_length(languages) <= 40),
  price_note text check (char_length(price_note) <= 120),
  updated_at timestamptz not null default now(),
  updated_by text,
  primary key (slug, lang)
);
alter table public.host_profiles enable row level security;
drop policy if exists "anyone reads profiles" on public.host_profiles;
create policy "anyone reads profiles" on public.host_profiles
  for select to anon, authenticated using (true);
drop policy if exists "members write profiles" on public.host_profiles;
create policy "members write profiles" on public.host_profiles
  for all to authenticated
  using (public.is_host_member(slug))
  with check (public.is_host_member(slug));

-- A host's weekly schedule: one row per repeating slot (e.g. Tue-Sat 18:30).
-- When a host has any active row here, these replace the schedule the site
-- had for them.
create table if not exists public.host_slots (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null,
  title      text not null check (char_length(title) between 1 and 120),
  weekdays   text[] not null check (
    cardinality(weekdays) between 1 and 7
    and weekdays <@ array['mon','tue','wed','thu','fri','sat','sun']
  ),
  time       text not null check (time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  duration   text check (char_length(duration) <= 40),
  price      integer check (price between 0 and 2000),
  active     boolean not null default true,
  updated_at timestamptz not null default now()
);
create index if not exists host_slots_slug on public.host_slots (slug);
alter table public.host_slots enable row level security;
drop policy if exists "anyone reads slots" on public.host_slots;
create policy "anyone reads slots" on public.host_slots
  for select to anon, authenticated using (true);
drop policy if exists "members write slots" on public.host_slots;
create policy "members write slots" on public.host_slots
  for all to authenticated
  using (public.is_host_member(slug))
  with check (public.is_host_member(slug));
