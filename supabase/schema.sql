-- ============================================================================
-- Portfolio — Supabase schema
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists profile (
  id integer primary key default 1 check (id = 1),
  name text,
  title text,
  headline text,
  avatar_symbol text,
  photo_path text,
  email text,
  bio text,
  summary text,
  education jsonb default '[]'::jsonb,
  about_details jsonb default '[]'::jsonb,
  updated_at timestamptz default now()
);

create table if not exists journey (
  id uuid primary key default gen_random_uuid(),
  sort_order integer default 0,
  year text,
  title text,
  subtitle text,
  description text,
  created_at timestamptz default now()
);

create table if not exists docs (
  id uuid primary key default gen_random_uuid(),
  title text,
  slug text,
  category text,
  tags jsonb default '[]'::jsonb,
  date text,
  read_time text,
  summary text,
  content text,
  status text default 'published',
  file_url text,
  file_name text,
  file_type text,
  created_at timestamptz default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  long_description text,
  technologies jsonb default '[]'::jsonb,
  features jsonb default '[]'::jsonb,
  challenges_solved text,
  lessons_learned text,
  github_link text,
  demo_link text,
  tags jsonb default '[]'::jsonb,
  featured boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists skills (
  id integer primary key default 1 check (id = 1),
  data jsonb,
  updated_at timestamptz default now()
);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  title text,
  icon text,
  tagline text,
  details jsonb default '[]'::jsonb,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists certifications (
  id uuid primary key default gen_random_uuid(),
  name text,
  issuer text,
  status text default 'Earned',
  date text,
  credential_id text,
  verify_url text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists pillars (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  items jsonb default '[]'::jsonb,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Public (anon) can read everything; only authenticated users can write.
-- ---------------------------------------------------------------------------

do $$
declare t text;
begin
  foreach t in array array['profile','journey','docs','projects','skills','services','certifications','pillars']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "public_read" on %I', t);
    execute format('create policy "public_read" on %I for select using (true)', t);
    execute format('drop policy if exists "auth_write" on %I', t);
    execute format('create policy "auth_write" on %I for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Storage bucket for uploaded documents (public download, authenticated upload)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;

drop policy if exists "documents_public_read" on storage.objects;
create policy "documents_public_read"
  on storage.objects for select
  using (bucket_id = 'documents');

drop policy if exists "documents_auth_write" on storage.objects;
create policy "documents_auth_write"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'documents');

drop policy if exists "documents_auth_update" on storage.objects;
create policy "documents_auth_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'documents');

drop policy if exists "documents_auth_delete" on storage.objects;
create policy "documents_auth_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'documents');
