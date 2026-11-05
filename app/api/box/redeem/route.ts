import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";
import {
  hashBoxCode,
  isWellFormedBoxCode,
  normalizeBoxCode,
} from "@/lib/payments/box-code";
import { isPlayGatingEnabled } from "@/lib/payments/ownership";

export const dynamic = "force-dynamic";

function json(body: Record<string, unknown>, status = 200) {
  // `gating` tells /activate whether it may fall back to the old open entry.
  return NextResponse.json(
    { ...body, gating: isPlayGatingEnabled() },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

/**
 * Redeems the code printed in a box and ties the case to the account.
 * Body: { code }. Returns { caseId, result: "activated" | "already_yours" }.
 * Errors: 401 not_logged_in, 400 invalid_code, 409 code_used, 429 rate_limited.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return json({ error: "not_logged_in" }, 401);

  // Per account and per IP: slows down guessing.
  const byUser = checkRateLimit(`box_redeem:${user.id}`, {
    limit: 5,
    windowMs: 60_000,
  });
  const byIp = checkRateLimit(`box_redeem_ip:${getClientIp(req)}`, {
    limit: 20,
    windowMs: 60_000,
  });
  if (!byUser.allowed || !byIp.allowed)
    return json({ error: "rate_limited" }, 429);

  const body = await req.json().catch(() => null);
  const code = normalizeBoxCode(body?.code);
  if (!isWellFormedBoxCode(code)) return json({ error: "invalid_code" }, 400);

  const { data, error } = await createAdminClient().rpc("redeem_box_code", {
    p_user_id: user.id,
    p_code_hash: hashBoxCode(code),
  });
  if (error) {
    if (error.message?.includes("BOX_CODE_INVALID"))
      return json({ error: "invalid_code" }, 400);
    if (error.message?.includes("BOX_CODE_USED"))
      return json({ error: "code_used" }, 409);
    console.error("[BOX REDEEM] failed:", error.message);
    return json({ error: "server_error" }, 500);
  }

  const result = data as { case_id: string; result: string };
  return json({ caseId: result.case_id, result: result.result });
}
