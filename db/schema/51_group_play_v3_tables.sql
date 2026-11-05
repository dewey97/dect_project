-- ==============================================================================
-- Migration 51: Group play v3, schema (additive)
-- Spec: docs/architecture/group_play_realtime.md, Parts 4 and 6.
-- Plan: docs/plans/2026-11-05_group_play_v3_implementation.md, P1.
--
-- What it does:
--   1. game_rooms: adds id (primary key), mode, status, phase, phase_changed_at,
--      max_players, host_participant_id, started_at, ended_at, unranked_at,
--      last_activity_at, version. room_code becomes nullable and is unique only among active rooms.
--   2. New tables room_participants and room_events (RLS on, no anon policy).
--   3. RPC room_create, room_join (atomic seat check), room_lifecycle_sweep.
--      Only service_role can execute them.
--
-- SAFE TO RUN BEFORE THE v3 CODE IS DEPLOYED: the v1 client keeps working.
--   - New columns have defaults, so v1 inserts (room_code, game_id, state_json,
--     last_action) still succeed.
--   - RLS on game_rooms is NOT changed here. The lock and the archive of v1 rooms
--     are in migration 52, which runs only after the v3 code is in production.
--
-- The script does not assume the current primary key of game_rooms (the table
-- has no create migration in db/schema/). It inspects the catalog and:
--   - adds id if missing;
--   - replaces a primary key or unique constraint on room_code with PK(id).
--   If another table has a foreign key to game_rooms(room_code), dropping that
--   constraint fails and the whole transaction rolls back. Nothing is lost.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. game_rooms
-- ------------------------------------------------------------------------------

ALTER TABLE public.game_rooms
  ADD COLUMN IF NOT EXISTS id UUID NOT NULL DEFAULT gen_random_uuid();

DO $$
DECLARE
  c RECORD;
  pk_is_id BOOLEAN := false;
BEGIN
  -- Drop a primary key that is not exactly (id), and any unique constraint that
  -- covers room_code. Other unique constraints are left alone.
  FOR c IN
    SELECT con.conname, con.contype,
           array_agg(att.attname ORDER BY att.attname) AS cols
    FROM pg_constraint con
    JOIN pg_attribute att
      ON att.attrelid = con.conrelid AND att.attnum = ANY (con.conkey)
    WHERE con.conrelid = 'public.game_rooms'::regclass
      AND con.contype IN ('p', 'u')
    GROUP BY con.conname, con.contype
  LOOP
    IF c.cols = ARRAY['id']::name[] THEN
      IF c.contype = 'p' THEN
        pk_is_id := true;
      END IF;
    ELSIF c.contype = 'p' OR 'room_code' = ANY (c.cols) THEN
      EXECUTE format('ALTER TABLE public.game_rooms DROP CONSTRAINT %I', c.conname);
    END IF;
  END LOOP;

  IF NOT pk_is_id THEN
    ALTER TABLE public.game_rooms ADD CONSTRAINT game_rooms_pkey PRIMARY KEY (id);
  END IF;
END $$;

-- Unique indexes on room_code that are not constraints (CREATE UNIQUE INDEX).
-- Must run after room_code exists; v1 always had it.
DO $$
DECLARE
  idx RECORD;
BEGIN
  FOR idx IN
    SELECT i.relname AS name
    FROM pg_index x
    JOIN pg_class i ON i.oid = x.indexrelid
    WHERE x.indrelid = 'public.game_rooms'::regclass
      AND x.indisunique
      AND NOT x.indisprimary
      AND i.relname <> 'idx_game_rooms_active_code'
      AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conindid = x.indexrelid)
      AND EXISTS (
        SELECT 1 FROM pg_attribute a
        WHERE a.attrelid = x.indrelid
          AND a.attname = 'room_code'
          AND a.attnum = ANY (x.indkey)
      )
  LOOP
    EXECUTE format('DROP INDEX public.%I', idx.name);
  END LOOP;
END $$;

ALTER TABLE public.game_rooms ALTER COLUMN room_code DROP NOT NULL;

ALTER TABLE public.game_rooms
  ADD COLUMN IF NOT EXISTS mode VARCHAR(10) NOT NULL DEFAULT 'box',
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS phase VARCHAR(20) NOT NULL DEFAULT 'lobby',
  ADD COLUMN IF NOT EXISTS phase_changed_at TIMESTAMPTZ DEFAULT NOW(),
  -- The API always sets max_players. The default exists only so that v1 inserts
  -- keep working until migration 52.
  ADD COLUMN IF NOT EXISTS max_players SMALLINT NOT NULL DEFAULT 6,
  ADD COLUMN IF NOT EXISTS host_participant_id UUID,
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ,
  -- Q12 (2026-11-05): set once, never cleared, when nobody in the room was active
  -- for more than 15 minutes after started_at. The room keeps playing but is not ranked.
  ADD COLUMN IF NOT EXISTS unranked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS state_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- v1 rows already have progress. Mark them as in investigation, not lobby.
-- They stay 'active' so the v1 client still finds them; migration 52 archives them.
UPDATE public.game_rooms
SET phase = 'investigating',
    last_activity_at = COALESCE(updated_at, created_at, NOW())
WHERE host_participant_id IS NULL
  AND phase = 'lobby';

ALTER TABLE public.game_rooms DROP CONSTRAINT IF EXISTS game_rooms_mode_check;
ALTER TABLE public.game_rooms ADD CONSTRAINT game_rooms_mode_check
  CHECK (mode IN ('box', 'online'));

ALTER TABLE public.game_rooms DROP CONSTRAINT IF EXISTS game_rooms_status_check;
ALTER TABLE public.game_rooms ADD CONSTRAINT game_rooms_status_check
  CHECK (status IN ('active', 'dormant', 'completed'));

ALTER TABLE public.game_rooms DROP CONSTRAINT IF EXISTS game_rooms_phase_check;
ALTER TABLE public.game_rooms ADD CONSTRAINT game_rooms_phase_check
  CHECK (phase IN ('lobby', 'intro_scene', 'intro_handover', 'investigating', 'epilogue'));

ALTER TABLE public.game_rooms DROP CONSTRAINT IF EXISTS game_rooms_max_players_check;
ALTER TABLE public.game_rooms ADD CONSTRAINT game_rooms_max_players_check
  CHECK (max_players >= 1);

-- v1 had no uniqueness guarantee on codes. Before the partial unique index,
-- keep only the most recent active row per code; free the code on the others.
UPDATE public.game_rooms g
SET status = 'dormant', room_code = NULL
WHERE g.status = 'active'
  AND g.room_code IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.game_rooms newer
    WHERE newer.status = 'active'
      AND newer.room_code = g.room_code
      AND newer.id <> g.id
      AND (COALESCE(newer.updated_at, newer.created_at, 'epoch'::timestamptz), newer.id)
          > (COALESCE(g.updated_at, g.created_at, 'epoch'::timestamptz), g.id)
  );

CREATE UNIQUE INDEX IF NOT EXISTS idx_game_rooms_active_code
  ON public.game_rooms (room_code) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_game_rooms_status_activity
  ON public.game_rooms (status, last_activity_at);

-- ------------------------------------------------------------------------------
-- 2. room_participants
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.game_rooms(id) ON DELETE CASCADE,
  nickname VARCHAR(20) NOT NULL CHECK (char_length(btrim(nickname)) BETWEEN 1 AND 20),
  token_hash TEXT NOT NULL,          -- sha256 of the participant token; the raw token stays on the device
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  entered_at TIMESTAMPTZ,            -- pressed "Vào cuộc" (or Host started while in lobby). NULL = in waiting room
  left_at TIMESTAMPTZ,               -- pressed "Rời phòng". NULL = holds a seat
  kicked BOOLEAN NOT NULL DEFAULT false,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- heartbeat, used only for Host auto-transfer (plan D1)
  UNIQUE (room_id, nickname)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_room_participants_token
  ON public.room_participants (token_hash);

CREATE INDEX IF NOT EXISTS idx_room_participants_room
  ON public.room_participants (room_id, joined_at);

ALTER TABLE public.game_rooms
  DROP CONSTRAINT IF EXISTS game_rooms_host_participant_fkey;
ALTER TABLE public.game_rooms
  ADD CONSTRAINT game_rooms_host_participant_fkey
  FOREIGN KEY (host_participant_id) REFERENCES public.room_participants(id)
  ON DELETE SET NULL;

-- ------------------------------------------------------------------------------
-- 3. room_events
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.room_events (
  id BIGSERIAL PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.game_rooms(id) ON DELETE CASCADE,
  actor_participant_id UUID REFERENCES public.room_participants(id) ON DELETE SET NULL,
  type VARCHAR(40) NOT NULL,
  target_ref TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_room_events_room
  ON public.room_events (room_id, id);

-- ------------------------------------------------------------------------------
-- 4. RLS on the new tables: no anon / authenticated access. The server uses
--    service_role (bypasses RLS). Admins can read for Studio.
-- ------------------------------------------------------------------------------

ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.room_participants FROM anon, authenticated;
REVOKE ALL ON public.room_events FROM anon, authenticated;
GRANT SELECT ON public.room_participants TO authenticated;
GRANT SELECT ON public.room_events TO authenticated;

DROP POLICY IF EXISTS "room_participants_admin_read" ON public.room_participants;
CREATE POLICY "room_participants_admin_read" ON public.room_participants
  FOR SELECT TO authenticated USING (private.is_admin());

DROP POLICY IF EXISTS "room_events_admin_read" ON public.room_events;
CREATE POLICY "room_events_admin_read" ON public.room_events
  FOR SELECT TO authenticated USING (private.is_admin());

-- ------------------------------------------------------------------------------
-- 5. RPC
--    Errors are raised with a fixed MESSAGE that the server maps to HTTP codes:
--    ROOM_NOT_FOUND, ROOM_FULL, KICKED, INVALID_NICKNAME, INVALID_MAX_PLAYERS.
-- ------------------------------------------------------------------------------

-- Picks a free nickname in a room: "Vy", then "Vy 2", "Vy 3", ... (max 20 chars).
CREATE OR REPLACE FUNCTION public.room_pick_nickname(p_room_id UUID, p_nickname TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  base TEXT := left(btrim(regexp_replace(coalesce(p_nickname, ''), '\s+', ' ', 'g')), 20);
  candidate TEXT;
  suffix TEXT;
  n INTEGER := 1;
BEGIN
  IF char_length(base) = 0 THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'INVALID_NICKNAME';
  END IF;
  candidate := base;
  WHILE EXISTS (
    SELECT 1 FROM room_participants WHERE room_id = p_room_id AND nickname = candidate
  ) LOOP
    n := n + 1;
    suffix := ' ' || n::TEXT;
    candidate := btrim(left(base, 20 - char_length(suffix))) || suffix;
  END LOOP;
  RETURN candidate;
END;
$$;

-- Creates a room and its Host in one transaction. A unique_violation (23505) on
-- idx_game_rooms_active_code means the code is taken: the server retries with a
-- new code (max 5 tries).
CREATE OR REPLACE FUNCTION public.room_create(
  p_game_id TEXT,
  p_mode TEXT,
  p_max_players INTEGER,
  p_room_code TEXT,
  p_nickname TEXT,
  p_token_hash TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_room game_rooms%ROWTYPE;
  v_participant room_participants%ROWTYPE;
BEGIN
  IF p_max_players IS NULL OR p_max_players < 1 OR p_max_players > 99 THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'INVALID_MAX_PLAYERS';
  END IF;

  INSERT INTO game_rooms (room_code, game_id, mode, max_players, phase, status, state_json)
  VALUES (p_room_code, p_game_id, p_mode, p_max_players, 'lobby', 'active', '{}'::jsonb)
  RETURNING * INTO v_room;

  INSERT INTO room_participants (room_id, nickname, token_hash)
  VALUES (v_room.id, room_pick_nickname(v_room.id, p_nickname), p_token_hash)
  RETURNING * INTO v_participant;

  UPDATE game_rooms SET host_participant_id = v_participant.id
  WHERE id = v_room.id
  RETURNING * INTO v_room;

  RETURN jsonb_build_object('room', to_jsonb(v_room), 'participant', to_jsonb(v_participant));
END;
$$;

-- Joins an active room by code. Locks the room row so that two joins on the last
-- seat cannot both succeed. A device that already has a participant in this room
-- (same token) gets the same row back, re-seated if it had left.
CREATE OR REPLACE FUNCTION public.room_join(
  p_room_code TEXT,
  p_nickname TEXT,
  p_token_hash TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_room game_rooms%ROWTYPE;
  v_participant room_participants%ROWTYPE;
  v_seats INTEGER;
  v_rejoined BOOLEAN := false;
BEGIN
  SELECT * INTO v_room FROM game_rooms
  WHERE room_code = p_room_code AND status = 'active'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'ROOM_NOT_FOUND';
  END IF;

  SELECT count(*) INTO v_seats FROM room_participants
  WHERE room_id = v_room.id AND left_at IS NULL AND NOT kicked;

  SELECT * INTO v_participant FROM room_participants
  WHERE room_id = v_room.id AND token_hash = p_token_hash;

  IF FOUND THEN
    IF v_participant.kicked THEN
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'KICKED';
    END IF;
    IF v_participant.left_at IS NOT NULL THEN
      IF v_seats >= v_room.max_players THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'ROOM_FULL';
      END IF;
      -- Back as a new arrival: waiting room first, same nickname.
      UPDATE room_participants
      SET left_at = NULL, entered_at = NULL, joined_at = NOW(), last_seen_at = NOW()
      WHERE id = v_participant.id
      RETURNING * INTO v_participant;
      v_rejoined := true;
    ELSE
      UPDATE room_participants SET last_seen_at = NOW()
      WHERE id = v_participant.id
      RETURNING * INTO v_participant;
    END IF;
  ELSE
    IF v_seats >= v_room.max_players THEN
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'ROOM_FULL';
    END IF;
    INSERT INTO room_participants (room_id, nickname, token_hash)
    VALUES (v_room.id, room_pick_nickname(v_room.id, p_nickname), p_token_hash)
    RETURNING * INTO v_participant;
    v_rejoined := true;
  END IF;

  UPDATE game_rooms SET last_activity_at = NOW()
  WHERE id = v_room.id
  RETURNING * INTO v_room;

  RETURN jsonb_build_object(
    'room', to_jsonb(v_room),
    'participant', to_jsonb(v_participant),
    'is_new_seat', v_rejoined
  );
END;
$$;

-- Daily cleanup (spec Part 6). Returns how many rows each rule touched.
CREATE OR REPLACE FUNCTION public.room_lifecycle_sweep()
RETURNS JSONB
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_deleted_lobby INTEGER;
  v_dormant INTEGER;
  v_freed INTEGER;
  v_events INTEGER;
BEGIN
  -- Junk rooms: still in lobby, nobody seen for 30 minutes.
  -- host_participant_id IS NOT NULL limits this to v3 rooms: rows inserted by
  -- the v1 client (before migration 52) also get phase 'lobby' by default.
  DELETE FROM game_rooms g
  WHERE g.phase = 'lobby'
    AND g.status = 'active'
    AND g.host_participant_id IS NOT NULL
    AND g.last_activity_at < NOW() - INTERVAL '30 minutes'
    AND NOT EXISTS (
      SELECT 1 FROM room_participants p
      WHERE p.room_id = g.id AND p.last_seen_at >= NOW() - INTERVAL '30 minutes'
    );
  GET DIAGNOSTICS v_deleted_lobby = ROW_COUNT;

  -- Unfinished rooms with no activity for 7 days: keep progress, free the code.
  -- A 7-day gap is far over the 15-minute rule (Q12), so started rooms also
  -- become unranked here if no API call has marked them yet.
  UPDATE game_rooms
  SET status = 'dormant', room_code = NULL, updated_at = NOW(),
      unranked_at = CASE WHEN started_at IS NOT NULL
                         THEN COALESCE(unranked_at, NOW()) ELSE unranked_at END
  WHERE status = 'active'
    AND phase <> 'lobby'
    AND last_activity_at < NOW() - INTERVAL '7 days';
  GET DIAGNOSTICS v_dormant = ROW_COUNT;

  -- Completed rooms must not hold a code (the conclusion route frees it; this is a safety net).
  UPDATE game_rooms SET room_code = NULL
  WHERE status = 'completed' AND room_code IS NOT NULL;
  GET DIAGNOSTICS v_freed = ROW_COUNT;

  -- Events of rooms completed more than 30 days ago.
  DELETE FROM room_events e
  USING game_rooms g
  WHERE e.room_id = g.id
    AND g.status = 'completed'
    AND g.ended_at < NOW() - INTERVAL '30 days';
  GET DIAGNOSTICS v_events = ROW_COUNT;

  RETURN jsonb_build_object(
    'deleted_lobby_rooms', v_deleted_lobby,
    'dormant_rooms', v_dormant,
    'freed_codes', v_freed,
    'deleted_events', v_events
  );
END;
$$;

-- Functions are executable by PUBLIC by default. Restrict to service_role.
REVOKE EXECUTE ON FUNCTION public.room_pick_nickname(UUID, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.room_create(TEXT, TEXT, INTEGER, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.room_join(TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.room_lifecycle_sweep() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.room_pick_nickname(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.room_create(TEXT, TEXT, INTEGER, TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.room_join(TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.room_lifecycle_sweep() TO service_role;

COMMIT;

-- ------------------------------------------------------------------------------
-- Schedule (run once by the owner, after enabling the pg_cron extension in
-- Database > Extensions). Daily at 03:00 UTC:
--
--   select cron.schedule('room-lifecycle-sweep', '0 3 * * *',
--     $$select public.room_lifecycle_sweep()$$);
-- ------------------------------------------------------------------------------

-- Checks after running:
--   select column_name from information_schema.columns
--   where table_name = 'game_rooms' order by ordinal_position;
--   select conname, pg_get_constraintdef(oid) from pg_constraint
--   where conrelid = 'public.game_rooms'::regclass;
--   select public.room_lifecycle_sweep();   -- as postgres, returns counts

-- ------------------------------------------------------------------------------
-- Rollback (manual). Does not restore a dropped room_code primary key.
--
--   BEGIN;
--   DROP FUNCTION IF EXISTS public.room_lifecycle_sweep();
--   DROP FUNCTION IF EXISTS public.room_join(TEXT, TEXT, TEXT);
--   DROP FUNCTION IF EXISTS public.room_create(TEXT, TEXT, INTEGER, TEXT, TEXT, TEXT);
--   DROP FUNCTION IF EXISTS public.room_pick_nickname(UUID, TEXT);
--   ALTER TABLE public.game_rooms DROP CONSTRAINT IF EXISTS game_rooms_host_participant_fkey;
--   DROP TABLE IF EXISTS public.room_events;
--   DROP TABLE IF EXISTS public.room_participants;
--   DROP INDEX IF EXISTS public.idx_game_rooms_active_code;
--   DROP INDEX IF EXISTS public.idx_game_rooms_status_activity;
--   ALTER TABLE public.game_rooms
--     DROP COLUMN IF EXISTS mode, DROP COLUMN IF EXISTS status,
--     DROP COLUMN IF EXISTS phase, DROP COLUMN IF EXISTS phase_changed_at,
--     DROP COLUMN IF EXISTS max_players, DROP COLUMN IF EXISTS host_participant_id,
--     DROP COLUMN IF EXISTS started_at, DROP COLUMN IF EXISTS ended_at,
--     DROP COLUMN IF EXISTS unranked_at,
--     DROP COLUMN IF EXISTS last_activity_at, DROP COLUMN IF EXISTS version;
--   COMMIT;
-- ------------------------------------------------------------------------------
