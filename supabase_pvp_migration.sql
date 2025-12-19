-- IRON COLOSSEUM (PvP)

-- PvP Profiles
create table if not exists pvp_profiles (
  user_id text primary key, -- References User ID (usually auth.users.id but text in schema)
  rank_score int default 1000,
  wins int default 0,
  losses int default 0,
  total_damage_dealt bigint default 0,
  highest_wilks_score float default 0,
  season int default 1,
  updated_at timestamptz default now()
);

-- Enable RLS for PvP Profiles
alter table pvp_profiles enable row level security;
create policy "Anyone can read pvp profiles" on pvp_profiles for select using (true);
create policy "Users can update own pvp profile" on pvp_profiles for update using (auth.uid()::text = user_id);
create policy "Users can insert own pvp profile" on pvp_profiles for insert with check (auth.uid()::text = user_id);

-- Battle Logs
create table if not exists battle_logs (
  id text primary key,
  attacker_id text not null,
  defender_id text not null,
  winner_id text not null,
  timestamp timestamptz default now(),
  battle_type text default 'DUEL',
  log_data jsonb
);

-- Enable RLS for Battle Logs
alter table battle_logs enable row level security;
create policy "Anyone can read battle logs" on battle_logs for select using (true);
create policy "Users can insert battle logs" on battle_logs for insert with check (auth.uid()::text = attacker_id or auth.uid()::text = defender_id);
