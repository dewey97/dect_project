-- ==============================================================================
-- Migration 54: Online offers become Solo + Party only, plus a Party upgrade
-- Spec: docs/product/license_access.md section 5 (decided 2026-11-09)
--
-- What it does:
--   1. Hides the 'group' offer (Nhóm, 79.000đ, +1 room) of case_000. The row is
--      kept: past orders and licenses that reference sku 'group' stay valid.
--   2. Adds 'party-upgrade' for case_000: 20.000đ (Party 89.000 - Solo 69.000),
--      +3 group credits. SKUs ending in '-upgrade' are sold only to players who
--      already own the case; POST /api/checkout enforces it (lib/payments/offers.ts).
--
-- Data only, idempotent. Run it AFTER the code is deployed: the old code has no
-- ownership check and would sell 'party-upgrade' (20.000đ) to anyone.
-- ==============================================================================

BEGIN;

UPDATE public.case_offers
SET active = false, updated_at = NOW()
WHERE case_id = 'case_000' AND sku = 'group' AND active;

INSERT INTO public.case_offers
  (case_id, sku, kind, title, description, price_vnd, group_credits, external_url, sort_order)
VALUES
  ('case_000', 'party-upgrade', 'online', 'Nâng cấp Party',
   'Thêm 3 lượt mở phòng chơi nhóm cho bạn bè. Dành cho người đã sở hữu vụ án.',
   20000, 3, NULL, 40)
ON CONFLICT (case_id, sku) DO UPDATE
SET kind = EXCLUDED.kind,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    price_vnd = EXCLUDED.price_vnd,
    group_credits = EXCLUDED.group_credits,
    active = true,
    updated_at = NOW();

COMMIT;

-- Checks after running (expect: solo, party, party-upgrade active; group inactive):
--   select sku, title, price_vnd, group_credits, active
--   from public.case_offers where case_id = 'case_000' order by sort_order;
