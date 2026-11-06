import { noStoreJson } from "@/lib/http";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getPaymentLink,
  getPayosConfig,
  mapPayosStatus,
} from "@/lib/payments/payos";

export const dynamic = "force-dynamic";

/**
 * Status of one order, for its owner. While the order is pending, asks PayOS
 * again so the result page does not depend on the webhook arriving first.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orderCode: string }> },
) {
  const { orderCode: raw } = await params;
  const orderCode = Number(raw);
  if (!/^\d{1,15}$/.test(raw) || !Number.isSafeInteger(orderCode)) {
    return noStoreJson({ error: "bad_request" }, 400);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return noStoreJson({ error: "not_logged_in" }, 401);

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select(
      "order_code, user_id, case_id, sku, amount_vnd, status, payment_link_id",
    )
    .eq("order_code", orderCode)
    .maybeSingle();
  if (!order || order.user_id !== user.id) {
    return noStoreJson({ error: "not_found" }, 404);
  }

  let status: string = order.status;
  const config = getPayosConfig();
  if (status === "pending" && config && order.payment_link_id) {
    try {
      const info = await getPaymentLink(config, orderCode);
      const mapped = mapPayosStatus(info.status);
      if (mapped === "paid") {
        const { data: result, error } = await admin.rpc(
          "grant_license_for_order",
          { p_order_code: orderCode, p_amount: info.amount, p_payload: info },
        );
        if (error) {
          console.error(
            `[ORDERS] grant failed for ${orderCode}:`,
            error.message,
          );
        } else {
          status = result === "amount_mismatch" ? "failed" : "paid";
        }
      } else if (mapped === "cancelled" || mapped === "expired") {
        await admin
          .from("orders")
          .update({ status: mapped, updated_at: new Date().toISOString() })
          .eq("order_code", orderCode)
          .eq("status", "pending");
        status = mapped;
      }
    } catch (err) {
      // PayOS unreachable: report what the database has; the page polls again.
      console.warn(
        `[ORDERS] PayOS lookup failed for ${orderCode}:`,
        String(err),
      );
    }
  }

  return noStoreJson({
    orderCode,
    caseId: order.case_id,
    sku: order.sku,
    amount: order.amount_vnd,
    status,
  });
}
