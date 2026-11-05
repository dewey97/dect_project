-- ==============================================================================
-- Migration 52: Group play v3, lock game_rooms and archive v1 rooms
-- Spec: docs/architecture/group_play_realtime.md, 8.1 (security) and 8.2.
-- Plan: docs/plans/2026-11-05_group_play_v3_implementation.md, P1 (decision D4).
--
-- What it does:
--   1. Enables RLS on game_rooms and drops every existing policy on it.
--      anon / authenticated lose INSERT, UPDATE, DELETE and SELECT. Only the
--      server (service_role, /api/rooms/*) reads and writes rooms. Admins can read.
--   2. Archives v1 rooms (rooms without a Host participant): status 'dormant',
--      room_code NULL. state_json is kept. Nothing is deleted.
--
-- RUN ONLY AFTER:
--   1. Migration 51 has run.
--   2. The v3 client (RoomSyncProvider via /api/rooms/*) is deployed to production.
--   Running it earlier breaks group play on production: the v1 client reads and
--   writes game_rooms directly with the anon key.
-- ==============================================================================

BEGIN;

ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'game_rooms'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.game_rooms', pol.policyname);
  END LOOP;
END $$;

REVOKE ALL ON public.game_rooms FROM anon, authenticated;
GRANT SELECT ON public.game_rooms TO authenticated;

CREATE POLICY "game_rooms_admin_read" ON public.game_rooms
  FOR SELECT TO authenticated USING (private.is_admin());

-- v1 rooms: no Host, no participants. The v3 client cannot reconnect to them.
UPDATE public.game_rooms
SET status = 'dormant',
    room_code = NULL,
    phase = CASE WHEN phase = 'lobby' THEN 'investigating' ELSE phase END,
    updated_at = NOW()
WHERE host_participant_id IS NULL
  AND status = 'active';

-- The default only existed for v1 inserts. The API always sends max_players.
ALTER TABLE public.game_rooms ALTER COLUMN max_players DROP DEFAULT;

COMMIT;

-- Checks after running:
--   -- must be 0 rows:
--   select policyname from pg_policies
--   where tablename = 'game_rooms' and policyname <> 'game_rooms_admin_read';
--   -- must be 0:
--   select count(*) from public.game_rooms
--   where status = 'active' and host_participant_id is null;
--   -- with the anon key (from the browser console), must fail or return []:
--   await supabase.from('game_rooms').select('*').limit(1)

-- Rollback (manual, reopens the v1 hole):
--   BEGIN;
--   DROP POLICY IF EXISTS "game_rooms_admin_read" ON public.game_rooms;
--   ALTER TABLE public.game_rooms DISABLE ROW LEVEL SECURITY;
--   GRANT SELECT, INSERT, UPDATE ON public.game_rooms TO anon, authenticated;
--   ALTER TABLE public.game_rooms ALTER COLUMN max_players SET DEFAULT 6;
--   COMMIT;
