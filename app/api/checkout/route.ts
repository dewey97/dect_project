import { noStoreJson } from "@/lib/http";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidCaseId, normalizeCaseId } from "@/lib/cases/case-id";
import { checkRateLimit } from "@/lib/security/rate-limiter";
import { isUpgradeSku } from "@/lib/payments/offers";
import {
  PayosError,
  createPaymentLink,
  getAppBaseUrl,
  getPayosConfig,
  orderDescription,
} from "@/lib/payments/payos";

export const dynamic = "force-dynamic";

const SKU_PATTERN = /^[a-z0-9_-]{1,32}$/;
const LINK_LIFETIME_SECONDS = 15 * 60;

/**
 * Creates an order and a PayOS payment link. Body: { caseId, sku }.
 * The price comes from case_offers (order_create RPC), never from the client.
 * Upgrade offers (SKU "*-upgrade") are sold only to players who already own the case.
 * Errors: 401 not_logged_in, 400 bad_request, 403 upgrade_requires_license,
 * 404 offer_not_found, 429 rate_limited, 503 payments_disabled, 502 provider_error.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return noStoreJson({ error: "not_logged_in" }, 401);

  const rate = checkRateLimit(`checkout:${user.id}`, {
    limit: 10,
    windowMs: 60_000,
  });
  if (!rate.allowed) return noStoreJson({ error: "rate_limited" }, 429);

  const body = await req.json().catch(() => null);
  const rawCaseId = typeof body?.caseId === "string" ? body.caseId : "";
  const sku = typeof body?.sku === "string" ? body.sku.trim() : "";
  if (!isValidCaseId(rawCaseId) || !SKU_PATTERN.test(sku)) {
    return noStoreJson({ error: "bad_request" }, 400);
  }
  const caseId = normalizeCaseId(rawCaseId);

  const config = getPayosConfig();
  const baseUrl = getAppBaseUrl();
  if (!config || !baseUrl) return noStoreJson({ error: "payments_disabled" }, 503);

  const admin = createAdminClient();

  if (isUpgradeSku(sku)) {
    const { data: license } = await admin
      .from("licenses")
      .select("online_at, box_activated_at")
      .eq("user_id", user.id)
      .eq("case_id", caseId)
      .maybeSingle();
    if (!license?.online_at && !license?.box_activated_at) {
      return noStoreJson({ error: "upgrade_requires_license" }, 403);
    }
  }

  const { data: order, error } = await admin.rpc("order_create", {
    p_user_id: user.id,
    p_case_id: caseId,
    p_sku: sku,
  });
  if (error || !order) {
    if (error?.message?.includes("OFFER_NOT_FOUND")) {
      return noStoreJson({ error: "offer_not_found" }, 404);
    }
    console.error("[CHECKOUT] order_create failed:", error?.message);
    return noStoreJson({ error: "server_error" }, 500);
  }

  const orderCode = Number(order.order_code);
  // Path param, not a query string: PayOS appends its own query to returnUrl.
  const resultUrl = `${baseUrl}/buy/result/${orderCode}`;

  try {
    const link = await createPaymentLink(config, {
      orderCode,
      amount: order.amount_vnd,
      description: orderDescription(orderCode),
      returnUrl: resultUrl,
      cancelUrl: resultUrl,
      buyerEmail: user.email ?? undefined,
      expiredAt: Math.floor(Date.now() / 1000) + LINK_LIFETIME_SECONDS,
    });

    await admin
      .from("orders")
      .update({
        payment_link_id: link.paymentLinkId,
        checkout_url: link.checkoutUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    return noStoreJson({ orderCode, checkoutUrl: link.checkoutUrl });
  } catch (err) {
    const message = err instanceof PayosError ? err.message : String(err);
    console.error(
      `[CHECKOUT] PayOS create link failed for ${orderCode}:`,
      message,
    );
    await admin
      .from("orders")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("id", order.id);
    return noStoreJson({ error: "provider_error" }, 502);
  }
}
