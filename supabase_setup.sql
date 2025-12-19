-- Enable Row Level Security (RLS)
alter default privileges revoke execute on functions from public;

-- 1. Raid Bosses Table
create table if not exists raid_bosses (
  id text primary key,
  name text not null,
  total_hp bigint not null,
  current_hp bigint not null,
  image text,
  description text,
  rewards text[], -- Array of strings
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Enable RLS
alter table raid_bosses enable row level security;

-- Policies for Raid Bosses (Open for all for this game demo)
create policy "Allow public read access" on raid_bosses for select using (true);
create policy "Allow public update access" on raid_bosses for update using (true); -- Needed for HP updates

-- 2. Chat Messages Table
create table if not exists chat_messages (
  id uuid default gen_random_uuid() primary key,
  user_name text not null,
  message text not null,
  timestamp timestamptz default now(),
  type text default 'CHAT' -- 'CHAT' or 'LOG'
);

-- Enable RLS
alter table chat_messages enable row level security;

-- Policies for Chat (Open for all)
create policy "Allow public read access" on chat_messages for select using (true);
create policy "Allow public insert access" on chat_messages for insert with check (true);

-- Seed Initial Boss
insert into raid_bosses (id, name, total_hp, current_hp, image, description, rewards, is_active)
values 
  ('boss_iron_golem', 'The Iron Golem', 1000000, 742500, '🦾', 'A massive automaton forged in the heart of the Iron Mines. It grows stronger with every failed attempt.', ARRAY['Kinetic Shard x50', 'Golem Core', 'Title: Golem Smasher'], true)
on conflict (id) do nothing;