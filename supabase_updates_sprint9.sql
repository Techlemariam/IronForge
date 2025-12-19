-- GRIMOIRE
create table if not exists grimoire_entries (
  id text primary key,
  user_id uuid references auth.users(id),
  date timestamptz not null default now(),
  type text not null, -- 'ACHIEVEMENT', 'PR', etc
  title text not null,
  description text,
  rarity text, -- 'common', 'epic', etc
  metadata jsonb
);

alter table grimoire_entries enable row level security;
create policy "Users can read own grimoire" on grimoire_entries for select using (auth.uid() = user_id);
create policy "Users can insert own grimoire" on grimoire_entries for insert with check (auth.uid() = user_id);


-- UNLOCKED MONSTERS
create table if not exists unlocked_monsters (
  user_id uuid references auth.users(id),
  monster_id text not null,
  unlocked_at timestamptz default now(),
  primary key (user_id, monster_id)
);

alter table unlocked_monsters enable row level security;
create policy "Users can read own unlocked monsters" on unlocked_monsters for select using (auth.uid() = user_id);
create policy "Users can insert own unlocked monsters" on unlocked_monsters for insert with check (auth.uid() = user_id);
