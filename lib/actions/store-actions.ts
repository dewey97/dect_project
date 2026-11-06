"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAuth } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidCaseId, normalizeCaseId } from "@/lib/cases/case-id";
import {
  generateBoxCode,
  hashBoxCode,
  normalizeBoxCode,
} from "@/lib/payments/box-code";

// Studio "Cửa hàng": offers, orders, manual licenses and box codes.
// Every action checks admin first, then writes with the service role
// (these tables have no client write policies).

type Result<T = undefined> =
  | ({ success: true } & (T extends undefined ? object : { data: T }))
  | { success: false; error: string };

function fail(err: unknown): { success: false; error: string } {
  const message = err instanceof Error ? err.message : String(err);
  console.error("[STORE ACTIONS]", message);
  return { success: false, error: message };
}

export interface StoreOffer {
  id: string;
  case_id: string;
  sku: string;
  kind: "online" | "box";
  title: string;
  description: string | null;
  price_vnd: number;
  group_credits: number;
  external_url: string | null;
  image_url: string | null;
  sort_order: number;
  active: boolean;
}

export interface StoreOrder {
  order_code: number;
  user_id: string;
  email: string | null;
  case_id: string;
  sku: string;
  amount_vnd: number;
  status: string;
  created_at: string;
  paid_at: string | null;
}

export interface BoxBatchStat {
  case_id: string;
  batch: string | null;
  total: number;
  redeemed: number;
}

export interface StoreData {
  cases: { slug: string; title: string }[];
  offers: StoreOffer[];
  orders: StoreOrder[];
  batches: BoxBatchStat[];
  /** false when migration 53 has not been run. */
  ready: boolean;
}

/** Up to 1000 users: enough for now; switch to a profiles.email column later. */
async function emailMap(): Promise<Map<string, string>> {
  const { data, error } = await createAdminClient().auth.admin.listUsers({
    perPage: 1000,
  });
  if (error) return new Map();
  return new Map(data.users.map((u) => [u.id, u.email ?? ""]));
}

export async function getStoreData(): Promise<Result<StoreData>> {
  try {
    await requireAdminAuth();
    const db = createAdminClient();
    const [cases, offers, orders, codes] = await Promise.all([
      db.from("cases").select("slug, title").order("slug"),
      db.from("case_offers").select("*").order("case_id").order("sort_order"),
      db
        .from("orders")
        .select(
          "order_code, user_id, case_id, sku, amount_vnd, status, created_at, paid_at",
        )
        .order("created_at", { ascending: false })
        .limit(100),
      db.from("box_codes").select("case_id, batch, redeemed_by"),
    ]);

    const ready = !offers.error;
    const emails = ready ? await emailMap() : new Map<string, string>();

    const stats = new Map<string, BoxBatchStat>();
    for (const row of codes.data ?? []) {
      const key = `${row.case_id}|${row.batch ?? ""}`;
      const stat = stats.get(key) ?? {
        case_id: row.case_id,
        batch: row.batch,
        total: 0,
        redeemed: 0,
      };
      stat.total += 1;
      if (row.redeemed_by) stat.redeemed += 1;
      stats.set(key, stat);
    }

    return {
      success: true,
      data: {
        cases: cases.data ?? [],
        offers: (offers.data ?? []) as StoreOffer[],
        orders: (orders.data ?? []).map((o) => ({
          ...o,
          email: emails.get(o.user_id) ?? null,
        })),
        batches: [...stats.values()],
        ready,
      },
    };
  } catch (err) {
    return fail(err);
  }
}

export interface OfferInput {
  id?: string;
  case_id: string;
  sku: string;
  kind: "online" | "box";
  title: string;
  description: string;
  price_vnd: number;
  group_credits: number;
  external_url: string;
  image_url: string;
  sort_order: number;
  active: boolean;
}

function cleanUrl(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  if (/^https:\/\//.test(value)) return value;
  throw new Error("Link phải bắt đầu bằng https:// hoặc /");
}

export async function saveOffer(input: OfferInput): Promise<Result> {
  try {
    await requireAdminAuth();
    if (!isValidCaseId(input.case_id)) throw new Error("Vụ án không hợp lệ.");
    if (!/^[a-z0-9_-]{1,32}$/.test(input.sku)) {
      throw new Error("SKU chỉ gồm a-z, 0-9, _ và -, tối đa 32 ký tự.");
    }
    if (!input.title.trim()) throw new Error("Thiếu tên gói.");
    const price = Math.round(Number(input.price_vnd));
    const credits = Math.round(Number(input.group_credits));
    if (!Number.isFinite(price) || price < 0)
      throw new Error("Giá không hợp lệ.");
    if (input.kind === "online" && price <= 0)
      throw new Error("Gói online cần giá lớn hơn 0.");
    if (!Number.isFinite(credits) || credits < 0)
      throw new Error("Số lượt nhóm không hợp lệ.");

    const row = {
      case_id: normalizeCaseId(input.case_id),
      sku: input.sku,
      kind: input.kind,
      title: input.title.trim(),
      description: input.description.trim() || null,
      price_vnd: price,
      group_credits: input.kind === "online" ? credits : 0,
      external_url: cleanUrl(input.external_url),
      image_url: cleanUrl(input.image_url),
      sort_order: Math.round(Number(input.sort_order)) || 0,
      active: input.active,
      updated_at: new Date().toISOString(),
    };

    const db = createAdminClient();
    const { error } = input.id
      ? await db.from("case_offers").update(row).eq("id", input.id)
      : await db.from("case_offers").insert(row);
    if (error) {
      if (error.code === "23505") throw new Error("SKU này đã có trong vụ án.");
      throw error;
    }
    revalidatePath("/studio/store");
    revalidatePath(`/cases/${row.case_id}`);
    return { success: true };
  } catch (err) {
    return fail(err);
  }
}

/** Grants online access (and optional group credits) by hand, by account email. */
export async function grantLicenseManually(input: {
  email: string;
  case_id: string;
  group_credits: number;
}): Promise<Result> {
  try {
    await requireAdminAuth();
    if (!isValidCaseId(input.case_id)) throw new Error("Vụ án không hợp lệ.");
    const email = input.email.trim().toLowerCase();
    const credits = Math.max(0, Math.round(Number(input.group_credits)) || 0);
    const emails = await emailMap();
    const userId = [...emails.entries()].find(
      ([, e]) => e.toLowerCase() === email,
    )?.[0];
    if (!userId) throw new Error("Không tìm thấy tài khoản với email này.");

    const db = createAdminClient();
    const caseId = normalizeCaseId(input.case_id);
    const { data: existing } = await db
      .from("licenses")
      .select("group_credits, online_at")
      .eq("user_id", userId)
      .eq("case_id", caseId)
      .maybeSingle();
    const now = new Date().toISOString();
    const { error } = existing
      ? await db
          .from("licenses")
          .update({
            group_credits: existing.group_credits + credits,
            online_at: existing.online_at ?? now,
            updated_at: now,
          })
          .eq("user_id", userId)
          .eq("case_id", caseId)
      : await db.from("licenses").insert({
          user_id: userId,
          case_id: caseId,
          group_credits: credits,
          online_at: now,
        });
    if (error) throw error;
    revalidatePath("/studio/store");
    return { success: true };
  } catch (err) {
    return fail(err);
  }
}

/**
 * Creates a batch of box codes. Stores only the hashes and returns the plain
 * codes once, for the printer. They cannot be read back later.
 */
export async function generateBoxCodes(input: {
  case_id: string;
  count: number;
  batch: string;
}): Promise<Result<{ codes: string[] }>> {
  try {
    await requireAdminAuth();
    if (!isValidCaseId(input.case_id)) throw new Error("Vụ án không hợp lệ.");
    const count = Math.round(Number(input.count));
    if (!Number.isInteger(count) || count < 1 || count > 2000) {
      throw new Error("Mỗi lần sinh từ 1 đến 2000 mã.");
    }
    const batch = input.batch.trim();
    if (!/^[A-Za-z0-9_.-]{1,64}$/.test(batch)) {
      throw new Error("Tên lô chỉ gồm chữ, số, _ . -");
    }
    const caseId = normalizeCaseId(input.case_id);

    const codes = new Set<string>();
    while (codes.size < count) codes.add(generateBoxCode());
    const rows = [...codes].map((code) => ({
      code_hash: hashBoxCode(normalizeBoxCode(code)),
      case_id: caseId,
      batch,
    }));

    const { error } = await createAdminClient().from("box_codes").insert(rows);
    if (error) throw error;
    revalidatePath("/studio/store");
    return { success: true, data: { codes: [...codes] } };
  } catch (err) {
    return fail(err);
  }
}
