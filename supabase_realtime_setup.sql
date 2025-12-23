-- Enable Realtime for specific tables
-- Note: 'supabase_realtime' publication exists by default on Supabase

-- 1. Add tables to publication
alter publication supabase_realtime add table raid_bosses;
alter publication supabase_realtime add table chat_messages;

-- 2. Create tables if not handled by Prisma Push (Prisma handles creation, this ensures RLS/Permissions if needed)
-- For now, we assume Prisma handles structure.

-- 3. (Optional) Basic RLS Policies for Guild Hall
alter table chat_messages enable row level security;
alter table raid_bosses enable row level security;

-- Allow authenticated users to insert chat messages
create policy "Authenticated users can insert chat"
on chat_messages for insert
to authenticated
with check (true);

-- Allow everyone to read chat (or just authenticated)
create policy "Authenticated users can read chat"
on chat_messages for select
to authenticated
using (true);

-- Allow authenticated to read raid boss
create policy "Everyone can read raid boss"
on raid_bosses for select
to authenticated
using (true);

-- Allow authenticated users to update raid boss (Attack)
-- Strictly speaking, this should be a Server Action so we don't expose UPDATE to client.
-- But if we use "Server Action that calls supabase.service_role", RLS can be bypassed or handled there.
-- Let's keep strict RLS: Client CANNOT update raid boss directly. Attack goes via Server Action.
-- So NO update policy for raid_bosses for public/authenticated.
