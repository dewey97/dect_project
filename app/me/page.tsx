import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOwnedCases } from "@/lib/payments/ownership";
import { formatVnd } from "@/lib/payments/format";
import { OwnershipBadge } from "@/components/store/ownership-badge";
import { PlayCard, PlayLabel } from "@/components/play/play-ui";
import { SafeImg } from "@/components/ui/safe-img";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Vụ án của tôi" };

const ORDER_STATUS: Record<string, { label: string; className: string }> = {
  paid: { label: "Đã thanh toán", className: "text-emerald-300" },
  pending: { label: "Chờ thanh toán", className: "text-amber-300" },
  cancelled: { label: "Đã hủy", className: "text-zinc-500" },
  expired: { label: "Hết hạn", className: "text-zinc-500" },
  failed: { label: "Lỗi", className: "text-red-300" },
};

// Rendered on the server only, so a fixed time zone is safe from hydration drift.
const dateFormat = new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const PENDING_LINK_MINUTES = 15;

/** Account page: owned cases (online / box / group credits) and order history. */
export default async function MePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=${encodeURIComponent("/me")}`);

  const owned = await getOwnedCases(user.id);
  const ownedIds = Object.keys(owned);

  const [{ data: cases }, { data: orders }] = await Promise.all([
    ownedIds.length
      ? supabase
          .from("cases")
          .select("slug, title, cover_image_url")
          .in("slug", ownedIds)
      : Promise.resolve({
          data: [] as {
            slug: string;
            title: string;
            cover_image_url: string | null;
          }[],
        }),
    supabase
      .from("orders")
      .select(
        "order_code, case_id, sku, amount_vnd, status, checkout_url, created_at",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const titles = new Map((cases ?? []).map((c) => [c.slug, c]));
  const now = Date.now();

  return (
    <div className="min-h-dvh w-full bg-[#0d0c0a] text-zinc-100">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:py-10">
        <header className="space-y-1">
          <PlayLabel>Tài khoản · {user.email}</PlayLabel>
          <h1 className="text-3xl font-bold text-zinc-50">Vụ án của tôi</h1>
        </header>

        <section aria-labelledby="owned-heading" className="space-y-3">
          <h2 id="owned-heading">
            <PlayLabel>Đã sở hữu</PlayLabel>
          </h2>
          {ownedIds.length === 0 ? (
            <PlayCard className="space-y-3">
              <p className="text-sm text-zinc-400">
                Bạn chưa sở hữu vụ án nào. Mua bản online hoặc nhập mã trong nắp
                hộp trên trang vụ án.
              </p>
              <Link
                href="/cases"
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-amber-500 px-4 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
              >
                Xem các vụ án
              </Link>
            </PlayCard>
          ) : (
            <ul className="space-y-3">
              {ownedIds.map((caseId) => {
                const o = owned[caseId];
                const c = titles.get(caseId);
                return (
                  <li key={caseId}>
                    <PlayCard className="flex flex-wrap items-center gap-4">
                      {c?.cover_image_url && (
                        <SafeImg
                          src={c.cover_image_url}
                          alt=""
                          className="aspect-[1/1.414] w-14 shrink-0 rounded border border-zinc-800 object-cover"
                        />
                      )}
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <Link
                          href={`/cases/${caseId}`}
                          className="font-bold text-zinc-50 hover:underline"
                        >
                          {c?.title ?? caseId}
                        </Link>
                        <div className="flex flex-wrap items-center gap-2">
                          <OwnershipBadge ownership={o} />
                          {o.online && !o.box && (
                            <span className="text-xs text-zinc-400">
                              Còn {o.groupCredits} lượt nhóm
                            </span>
                          )}
                        </div>
                      </div>
                      <Link
                        href={`/play/${caseId}`}
                        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-amber-500 px-5 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
                      >
                        Vào chơi
                      </Link>
                    </PlayCard>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section aria-labelledby="orders-heading" className="space-y-3">
          <h2 id="orders-heading">
            <PlayLabel>Đơn hàng</PlayLabel>
          </h2>
          {(orders ?? []).length === 0 ? (
            <p className="text-sm text-zinc-500">Chưa có đơn hàng.</p>
          ) : (
            <PlayCard className="divide-y divide-zinc-800 p-0 sm:p-0">
              {(orders ?? []).map((order) => {
                const status =
                  ORDER_STATUS[order.status] ?? ORDER_STATUS.failed;
                const created = new Date(order.created_at);
                const canResume =
                  order.status === "pending" &&
                  order.checkout_url &&
                  now - created.getTime() < PENDING_LINK_MINUTES * 60_000;
                return (
                  <div
                    key={order.order_code}
                    className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 text-sm"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/buy/result/${order.order_code}`}
                        className="font-mono text-zinc-200 hover:underline"
                      >
                        DH{order.order_code}
                      </Link>
                      <span className="ml-2 text-zinc-500">
                        {titles.get(order.case_id)?.title ?? order.case_id} ·{" "}
                        {order.sku}
                      </span>
                      <div className="text-xs text-zinc-500">
                        {dateFormat.format(created)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-zinc-300">
                        {formatVnd(order.amount_vnd)}
                      </span>
                      <span
                        className={`text-xs font-semibold ${status.className}`}
                      >
                        {status.label}
                      </span>
                      {canResume && (
                        <a
                          href={order.checkout_url!}
                          className="text-xs font-semibold text-amber-400 underline-offset-4 hover:underline"
                        >
                          Thanh toán tiếp
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </PlayCard>
          )}
        </section>

        <nav className="flex flex-wrap justify-center gap-x-6 text-sm text-zinc-500">
          <Link href="/cases" className="px-1 py-3 hover:text-zinc-300">
            Các vụ án
          </Link>
          <Link href="/" className="px-1 py-3 hover:text-zinc-300">
            Về trang chủ
          </Link>
        </nav>
      </div>
    </div>
  );
}
