-- Open Livingroom — canonical schema (see .cursorrules)
-- Run once on a fresh project. If you already applied an older version, use a follow-up migration or reset the dev DB.

create table public.anchors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  name text not null,
  city text not null,
  city_slug text not null,
  country text not null,
  neighborhood text,
  internship text,
  max_guests int default 1,
  notes text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table public.availability (
  id uuid primary key default gen_random_uuid(),
  anchor_id uuid not null references public.anchors (id) on delete cascade,
  start_date date not null,
  end_date date not null
);

create table public.stay_requests (
  id uuid primary key default gen_random_uuid(),
  anchor_id uuid not null references public.anchors (id) on delete cascade,
  roamer_user_id uuid references auth.users (id) on delete set null,
  roamer_name text not null,
  roamer_email text not null,
  roamer_blurb text,
  check_in date not null,
  check_out date not null,
  status text not null default 'pending',
  created_at timestamptz default now(),
  constraint stay_requests_status_values check (status in ('pending', 'confirmed', 'declined'))
);

create index anchors_city_slug_idx on public.anchors (city_slug);
create index availability_anchor_id_idx on public.availability (anchor_id);
create index stay_requests_anchor_id_idx on public.stay_requests (anchor_id);

alter table public.anchors replica identity full;
alter table public.availability replica identity full;
alter table public.stay_requests replica identity full;

alter publication supabase_realtime add table public.availability;
alter publication supabase_realtime add table public.stay_requests;
alter publication supabase_realtime add table public.anchors;
