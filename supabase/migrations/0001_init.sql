-- Synkoz MVP backend schema: rooms, participants, and chat messages.
--
-- This MVP has no auth yet: every client uses the public anon key and a
-- locally-generated user id. RLS is therefore intentionally permissive
-- (read/insert for everyone). Tighten these policies when real auth lands.

create extension if not exists "pgcrypto";

-- Rooms -----------------------------------------------------------------------
create table if not exists public.rooms (
  id         uuid primary key default gen_random_uuid(),
  code       text unique not null,
  title      text not null,
  prize      text not null,
  host_id    text not null,
  status     text not null default 'waiting',   -- waiting | spinning | finished
  spinning   boolean not null default false,
  winner_id  text,                              -- participant user_id of the winner
  created_at timestamptz not null default now()
);

-- Participants ----------------------------------------------------------------
create table if not exists public.participants (
  id           uuid primary key default gen_random_uuid(),
  room_id      uuid not null references public.rooms(id) on delete cascade,
  user_id      text not null,
  username     text not null,
  avatar_color text not null,
  created_at   timestamptz not null default now(),
  unique (room_id, user_id)
);

-- Messages --------------------------------------------------------------------
create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  room_id    uuid not null references public.rooms(id) on delete cascade,
  user_id    text not null,
  username   text not null,
  text       text not null,
  created_at timestamptz not null default now()
);

create index if not exists participants_room_idx on public.participants (room_id);
create index if not exists messages_room_idx on public.messages (room_id, created_at);

-- Row Level Security ----------------------------------------------------------
alter table public.rooms        enable row level security;
alter table public.participants enable row level security;
alter table public.messages     enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'rooms' and policyname = 'rooms_read') then
    create policy "rooms_read"   on public.rooms        for select using (true);
    create policy "rooms_insert" on public.rooms        for insert with check (true);
    create policy "rooms_update" on public.rooms        for update using (true) with check (true);

    create policy "parts_read"   on public.participants for select using (true);
    create policy "parts_insert" on public.participants for insert with check (true);
    create policy "parts_delete" on public.participants for delete using (true);

    create policy "msgs_read"    on public.messages     for select using (true);
    create policy "msgs_insert"  on public.messages     for insert with check (true);
  end if;
end $$;

-- Realtime: broadcast row changes on all three tables -------------------------
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'rooms') then
    alter publication supabase_realtime add table public.rooms;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'participants') then
    alter publication supabase_realtime add table public.participants;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'messages') then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;
