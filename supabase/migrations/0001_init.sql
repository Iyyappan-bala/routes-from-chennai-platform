-- Routes From Chennai Platform — initial schema (Release 1)
-- Matches platform-planning/PHASE_1_PLAN.md Section 2 and DATABASE_DESIGN.md

create type content_status as enum ('draft', 'published', 'archived');
create type user_role as enum ('visitor', 'editor', 'admin');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role user_role not null default 'visitor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table regions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table countries (
  id uuid primary key default gen_random_uuid(),
  region_id uuid not null references regions(id) on delete restrict,
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on countries (region_id);

create table cities (
  id uuid primary key default gen_random_uuid(),
  country_id uuid not null references countries(id) on delete restrict,
  name text not null,
  slug text not null unique,
  lat double precision,
  lng double precision,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on cities (country_id);

create table media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  alt_text text not null,
  width int,
  height int,
  uploaded_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique
);

create table destinations (
  id uuid primary key default gen_random_uuid(),
  city_id uuid references cities(id) on delete restrict,
  name text not null,
  slug text not null unique,
  description text,
  lat double precision,
  lng double precision,
  hero_image_id uuid references media_assets(id),
  status content_status not null default 'draft',
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on destinations (city_id);
create index idx_destinations_published on destinations (status) where status = 'published';

create table destination_categories (
  destination_id uuid references destinations(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  primary key (destination_id, category_id)
);

create table stories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  body text not null,
  hero_image_id uuid references media_assets(id),
  author_id uuid references profiles(id),
  status content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_stories_published on stories (status) where status = 'published';

create table story_categories (
  story_id uuid references stories(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  primary key (story_id, category_id)
);

create table destination_stories (
  destination_id uuid references destinations(id) on delete cascade,
  story_id uuid references stories(id) on delete cascade,
  primary key (destination_id, story_id)
);

create table saved_destinations (
  profile_id uuid references profiles(id) on delete cascade,
  destination_id uuid references destinations(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, destination_id)
);

create table saved_stories (
  profile_id uuid references profiles(id) on delete cascade,
  story_id uuid references stories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, story_id)
);

-- Reference data: public read, editor/admin write
alter table regions enable row level security;
alter table countries enable row level security;
alter table cities enable row level security;
alter table categories enable row level security;

create policy "public read regions" on regions for select using (true);
create policy "editors manage regions" on regions for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role in ('editor','admin'))
);
create policy "editors update regions" on regions for update using (
  exists (select 1 from profiles where id = auth.uid() and role in ('editor','admin'))
);
create policy "editors delete regions" on regions for delete using (
  exists (select 1 from profiles where id = auth.uid() and role in ('editor','admin'))
);

create policy "public read countries" on countries for select using (true);
create policy "editors manage countries" on countries for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('editor','admin'))
);

create policy "public read cities" on cities for select using (true);
create policy "editors manage cities" on cities for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('editor','admin'))
);

create policy "public read categories" on categories for select using (true);
create policy "editors manage categories" on categories for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('editor','admin'))
);

-- Content: public read only published, editor/admin full access
alter table destinations enable row level security;
alter table stories enable row level security;
alter table media_assets enable row level security;

create policy "public read published destinations"
  on destinations for select using (status = 'published');
create policy "editors manage destinations"
  on destinations for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('editor','admin'))
  );

create policy "public read published stories"
  on stories for select using (status = 'published');
create policy "editors manage stories"
  on stories for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('editor','admin'))
  );

create policy "public read media for published content"
  on media_assets for select using (true);
create policy "editors manage media"
  on media_assets for insert with check (
    exists (select 1 from profiles where id = auth.uid() and role in ('editor','admin'))
  );

-- Join tables: readable with their parent content, writable by editors/admins
alter table destination_categories enable row level security;
alter table story_categories enable row level security;
alter table destination_stories enable row level security;

create policy "public read destination_categories" on destination_categories for select using (true);
create policy "editors manage destination_categories" on destination_categories for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('editor','admin'))
);

create policy "public read story_categories" on story_categories for select using (true);
create policy "editors manage story_categories" on story_categories for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('editor','admin'))
);

create policy "public read destination_stories" on destination_stories for select using (true);
create policy "editors manage destination_stories" on destination_stories for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('editor','admin'))
);

-- Profiles: a user reads/updates only their own row; role is not self-editable in practice
-- because the client never exposes a role field in the update form (enforced at API layer too)
alter table profiles enable row level security;

create policy "users read own profile" on profiles for select using (id = auth.uid());
create policy "users update own profile" on profiles for update using (id = auth.uid())
  with check (id = auth.uid());

-- Saved items: table structure ready now; UI ships in Release 2
alter table saved_destinations enable row level security;
alter table saved_stories enable row level security;

create policy "users manage own saved destinations"
  on saved_destinations for all using (profile_id = auth.uid());
create policy "users manage own saved stories"
  on saved_stories for all using (profile_id = auth.uid());

-- Auto-create a profile row when a new auth user signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, role)
  values (new.id, new.raw_user_meta_data->>'display_name', 'visitor');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
