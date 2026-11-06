import { noStoreJson } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPayosConfig, verifyWebhookSignature } from "@/lib/payments/payos";

export const dynamic = "force-dynamic";

/**
 * PayOS payment webhook. Registered once with scripts/ops/payos-confirm-webhook.mjs.
 *
 * - Bad signature: 401.
 * - Valid but unknown order (for example the test call PayOS sends when the
 *   webhook is registered): 200, ignored.
 * - Valid paid notification: grant_license_for_order, which is idempotent and
 *   checks the amount. A database error returns 500 so PayOS retries.
 */
export async function POST(req: Request) {
  const config = getPayosConfig();
  if (!config) return noStoreJson({ error: "payments_disabled" }, 503);

  const body = await req.json().catch(() => null);
  const data = body?.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return noStoreJson({ error: "bad_request" }, 400);
  }
  if (!verifyWebhookSignature(data, body.signature, config.checksumKey)) {
    return noStoreJson({ error: "invalid_signature" }, 401);
  }

  const orderCode = Number(data.orderCode);
  const amount = Number(data.amount);
  const isPaid = body.code === "00" && data.code === "00";
  if (!isPaid || !Number.isSafeInteger(orderCode)) {
    return noStoreJson({ success: true, ignored: true });
  }

  const admin = createAdminClient();
  const { data: result, error } = await admin.rpc("grant_license_for_order", {
    p_order_code: orderCode,
    p_amount: Number.isFinite(amount) ? Math.round(amount) : null,
    p_payload: data,
  });

  if (error) {
    if (error.message?.includes("ORDER_NOT_FOUND")) {
      return noStoreJson({ success: true, ignored: true });
    }
    console.error(
      `[PAYOS WEBHOOK] grant failed for ${orderCode}:`,
      error.message,
    );
    return noStoreJson({ error: "server_error" }, 500);
  }

  if (result === "amount_mismatch") {
    console.error(
      `[PAYOS WEBHOOK] Amount mismatch for order ${orderCode}: ${amount}`,
    );
  }
  return noStoreJson({ success: true, result });
}
