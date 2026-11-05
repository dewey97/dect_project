-- ==============================================================================
-- Migration 53: Online purchase (PayOS) - offers, orders, licenses
-- Plan: docs/plans/2026-11-05_payment_checkout.md
--
-- What it does:
--   1. case_offers: what each case sells. kind 'online' is paid through PayOS,
--      kind 'box' is a link to an external shop (Shopee / TikTok Shop).
--   2. orders: one row per checkout attempt. order_code is the integer PayOS needs.
--   3. licenses: online access per (user, case), with group credits.
--   4. RLS: players read only their own orders and licenses. Offers are public
--      while active. All writes go through service_role on the server.
--   5. RPC order_create (allocates order_code) and grant_license_for_order
--      (idempotent: a webhook delivered twice grants once). service_role only.
--   6. Seed offers for case_000. Prices are defaults; edit them here or in SQL.
--
-- Additive only. Safe to run before the code is deployed.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. case_offers
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.case_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id TEXT NOT NULL,                 -- case slug, same as case_checkpoints.case_id
  sku TEXT NOT NULL CHECK (sku ~ '^[a-z0-9_-]{1,32}$'),
  kind TEXT NOT NULL CHECK (kind IN ('online', 'box')),
  title TEXT NOT NULL,
  description TEXT,
  price_vnd INTEGER NOT NULL DEFAULT 0 CHECK (price_vnd >= 0),
  group_credits INTEGER NOT NULL DEFAULT 0 CHECK (group_credits >= 0),
  external_url TEXT,                     -- shop link for kind 'box'
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (case_id, sku),
  CONSTRAINT case_offers_online_price CHECK (kind <> 'online' OR price_vnd > 0)
);

-- ------------------------------------------------------------------------------
-- 2. orders
-- ------------------------------------------------------------------------------

CREATE SEQUENCE IF NOT EXISTS public.orders_order_code_seq START WITH 100000;

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code BIGINT NOT NULL UNIQUE DEFAULT nextval('public.orders_order_code_seq'),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id TEXT NOT NULL,
  sku TEXT NOT NULL,
  amount_vnd INTEGER NOT NULL CHECK (amount_vnd > 0),   -- price at the time of purchase
  group_credits INTEGER NOT NULL DEFAULT 0,             -- credits at the time of purchase
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'cancelled', 'expired', 'failed')),
  payment_link_id TEXT,
  checkout_url TEXT,
  paid_at TIMESTAMPTZ,
  provider_payload JSONB,                               -- raw webhook data, for reconciliation
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER SEQUENCE public.orders_order_code_seq OWNED BY public.orders.order_code;

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders (user_id, created_at DESC);

-- ------------------------------------------------------------------------------
-- 3. licenses
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id TEXT NOT NULL,
  group_credits INTEGER NOT NULL DEFAULT 0 CHECK (group_credits >= 0),
  source TEXT NOT NULL DEFAULT 'payos' CHECK (source IN ('payos', 'manual')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, case_id)
);

-- ------------------------------------------------------------------------------
-- 4. RLS
-- ------------------------------------------------------------------------------

ALTER TABLE public.case_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.case_offers FROM anon, authenticated;
REVOKE ALL ON public.orders FROM anon, authenticated;
REVOKE ALL ON public.licenses FROM anon, authenticated;
GRANT SELECT ON public.case_offers TO anon, authenticated;
GRANT SELECT ON public.orders TO authenticated;
GRANT SELECT ON public.licenses TO authenticated;

DROP POLICY IF EXISTS "case_offers_public_read" ON public.case_offers;
CREATE POLICY "case_offers_public_read" ON public.case_offers
  FOR SELECT TO anon, authenticated USING (active OR private.is_admin());

DROP POLICY IF EXISTS "orders_owner_read" ON public.orders;
CREATE POLICY "orders_owner_read" ON public.orders
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR private.is_admin());

DROP POLICY IF EXISTS "licenses_owner_read" ON public.licenses;
CREATE POLICY "licenses_owner_read" ON public.licenses
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR private.is_admin());

-- ------------------------------------------------------------------------------
-- 5. RPC
-- ------------------------------------------------------------------------------

-- Creates a pending order from an active online offer. The price comes from the
-- offer row, never from the client. Errors: OFFER_NOT_FOUND.
CREATE OR REPLACE FUNCTION public.order_create(
  p_user_id UUID,
  p_case_id TEXT,
  p_sku TEXT
)
RETURNS public.orders
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_offer case_offers%ROWTYPE;
  v_order orders%ROWTYPE;
BEGIN
  SELECT * INTO v_offer FROM case_offers
  WHERE case_id = p_case_id AND sku = p_sku AND kind = 'online' AND active;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'OFFER_NOT_FOUND';
  END IF;

  INSERT INTO orders (user_id, case_id, sku, amount_vnd, group_credits)
  VALUES (p_user_id, p_case_id, p_sku, v_offer.price_vnd, v_offer.group_credits)
  RETURNING * INTO v_order;

  RETURN v_order;
END;
$$;

-- Marks an order paid and grants (or extends) the license, in one transaction.
-- Locks the order row, so concurrent webhook deliveries cannot both grant.
-- Returns 'granted', 'already_paid' or 'amount_mismatch' (order marked 'failed').
-- Raises ORDER_NOT_FOUND.
CREATE OR REPLACE FUNCTION public.grant_license_for_order(
  p_order_code BIGINT,
  p_amount INTEGER,
  p_payload JSONB
)
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_order orders%ROWTYPE;
BEGIN
  SELECT * INTO v_order FROM orders WHERE order_code = p_order_code FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'ORDER_NOT_FOUND';
  END IF;

  IF v_order.status = 'paid' THEN
    RETURN 'already_paid';
  END IF;

  -- Returned, not raised: a raise would roll back the 'failed' mark.
  IF p_amount IS DISTINCT FROM v_order.amount_vnd THEN
    UPDATE orders
    SET status = 'failed', provider_payload = p_payload, updated_at = NOW()
    WHERE id = v_order.id;
    RETURN 'amount_mismatch';
  END IF;

  UPDATE orders
  SET status = 'paid', paid_at = NOW(), provider_payload = p_payload, updated_at = NOW()
  WHERE id = v_order.id;

  INSERT INTO licenses (user_id, case_id, group_credits, source)
  VALUES (v_order.user_id, v_order.case_id, v_order.group_credits, 'payos')
  ON CONFLICT (user_id, case_id) DO UPDATE
  SET group_credits = licenses.group_credits + EXCLUDED.group_credits,
      updated_at = NOW();

  RETURN 'granted';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.order_create(UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.grant_license_for_order(BIGINT, INTEGER, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.order_create(UUID, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.grant_license_for_order(BIGINT, INTEGER, JSONB) TO service_role;

-- ------------------------------------------------------------------------------
-- 6. Seed offers for case_000 (default prices, see docs/product/license_access.md)
-- ------------------------------------------------------------------------------

INSERT INTO public.case_offers
  (case_id, sku, kind, title, description, price_vnd, group_credits, external_url, sort_order)
VALUES
  ('case_000', 'solo',  'online', 'Solo',  'Tự chơi không giới hạn trên tài khoản của bạn.', 69000, 0, NULL, 10),
  ('case_000', 'group', 'online', 'Nhóm',  'Tự chơi không giới hạn và 1 lượt tạo phòng chơi nhóm.', 79000, 1, NULL, 20),
  ('case_000', 'party', 'online', 'Party', 'Tự chơi không giới hạn và 3 lượt tạo phòng chơi nhóm.', 89000, 3, NULL, 30),
  ('case_000', 'box',   'box',    'Bộ hộp vật lý', 'Hồ sơ in, vật chứng thật và mã QR vào game. Tạo phòng nhóm miễn phí.', 0, 0, NULL, 100)
ON CONFLICT (case_id, sku) DO NOTHING;

COMMIT;

-- Checks after running:
--   select case_id, sku, kind, price_vnd, group_credits, active from public.case_offers order by sort_order;
--   select last_value from public.orders_order_code_seq;

-- ------------------------------------------------------------------------------
-- Rollback (manual). Drops paid orders and licenses too: export them first.
--
--   BEGIN;
--   DROP FUNCTION IF EXISTS public.grant_license_for_order(BIGINT, INTEGER, JSONB);
--   DROP FUNCTION IF EXISTS public.order_create(UUID, TEXT, TEXT);
--   DROP TABLE IF EXISTS public.licenses;
--   DROP TABLE IF EXISTS public.orders;
--   DROP TABLE IF EXISTS public.case_offers;
--   COMMIT;
-- ------------------------------------------------------------------------------
