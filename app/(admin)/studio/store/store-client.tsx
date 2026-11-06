"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  KeyRound,
  Pencil,
  Plus,
  ShoppingCart,
  UserPlus,
} from "lucide-react";
import {
  generateBoxCodes,
  grantLicenseManually,
  saveOffer,
  type OfferInput,
  type StoreData,
  type StoreOffer,
} from "@/lib/actions/store-actions";
import { formatVnd } from "@/lib/payments/format";
import { cn } from "@/lib/utils";

const input =
  "h-9 w-full rounded-md border border-white/10 bg-zinc-900/60 px-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none";
const label = "space-y-1 text-xs font-medium text-zinc-400";
const button =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";
const primary = `${button} bg-amber-500 text-zinc-950 hover:bg-amber-400`;
const secondary = `${button} border border-white/10 bg-zinc-900 text-zinc-200 hover:bg-zinc-800`;

const ORDER_STATUS: Record<string, string> = {
  paid: "text-emerald-300",
  pending: "text-amber-300",
  failed: "text-red-300",
};

function emptyOffer(caseId: string): OfferInput {
  return {
    case_id: caseId,
    sku: "",
    kind: "online",
    title: "",
    description: "",
    price_vnd: 0,
    group_credits: 0,
    external_url: "",
    image_url: "",
    sort_order: 50,
    active: true,
  };
}

function toInput(o: StoreOffer): OfferInput {
  return {
    id: o.id,
    case_id: o.case_id,
    sku: o.sku,
    kind: o.kind,
    title: o.title,
    description: o.description ?? "",
    price_vnd: o.price_vnd,
    group_credits: o.group_credits,
    external_url: o.external_url ?? "",
    image_url: o.image_url ?? "",
    sort_order: o.sort_order,
    active: o.active,
  };
}

function Section({
  title,
  icon: Icon,
  children,
  actions,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-xl border border-white/10 bg-zinc-950/50 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-100">
          <Icon className="size-4 text-amber-400" />
          {title}
        </h2>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function StoreClient({
  data,
  caseId,
}: {
  data: StoreData;
  /** Case from the sidebar picker. */
  caseId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<OfferInput | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  const offers = useMemo(
    () => data.offers.filter((o) => o.case_id === caseId),
    [data.offers, caseId],
  );
  const batches = data.batches.filter((b) => b.case_id === caseId);
  const titleOf = (slug: string) =>
    data.cases.find((c) => c.slug === slug)?.title ?? slug;

  const run = (
    action: () => Promise<{ success: boolean; error?: string }>,
    okText: string,
    after?: () => void,
  ) => {
    setMessage(null);
    startTransition(async () => {
      const res = await action();
      if (res.success) {
        setMessage({ ok: true, text: okText });
        after?.();
        router.refresh();
      } else {
        setMessage({ ok: false, text: res.error ?? "Lỗi không rõ." });
      }
    });
  };

  // --- Offer form ---
  const submitOffer = (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const draft = editing;
    run(
      () => saveOffer(draft),
      "Đã lưu gói bán.",
      () => setEditing(null),
    );
  };

  // --- Manual grant ---
  const [grantEmail, setGrantEmail] = useState("");
  const [grantCredits, setGrantCredits] = useState(0);
  const submitGrant = (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      email: grantEmail,
      case_id: caseId,
      group_credits: grantCredits,
    };
    run(
      () => grantLicenseManually(payload),
      `Đã cấp quyền ${titleOf(caseId)} cho ${grantEmail}.`,
      () => {
        setGrantEmail("");
        setGrantCredits(0);
      },
    );
  };

  // --- Box codes ---
  const [codeCount, setCodeCount] = useState(100);
  const [batchName, setBatchName] = useState("");
  const submitCodes = (e: FormEvent) => {
    e.preventDefault();
    const payload = { case_id: caseId, count: codeCount, batch: batchName };
    setMessage(null);
    startTransition(async () => {
      const res = await generateBoxCodes(payload);
      if (!res.success) {
        setMessage({ ok: false, text: res.error });
        return;
      }
      const origin = window.location.origin;
      const csv = ["code,qr_url"]
        .concat(
          res.data.codes.map((c) => `${c},${origin}/cases/${caseId}?code=${c}`),
        )
        .join("\n");
      const url = URL.createObjectURL(
        new Blob([csv + "\n"], { type: "text/csv" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `${caseId}-${payload.batch}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage({
        ok: true,
        text: `Đã sinh ${res.data.codes.length} mã, file CSV đã tải về. Mã gốc không xem lại được: cất file cẩn thận.`,
      });
      setBatchName("");
      router.refresh();
    });
  };

  if (!data.ready) {
    return (
      <div className="mx-auto max-w-3xl p-6 text-sm text-zinc-300">
        Chưa có bảng cửa hàng. Chạy migration{" "}
        <code>db/schema/53_payments.sql</code> trên Supabase rồi tải lại trang.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Cửa hàng</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Gói bán, mã hộp, cấp quyền tay và đơn hàng.
          </p>
        </div>
        <span className="rounded-md border border-amber-500/25 bg-amber-500/10 px-3 py-1.5 text-sm text-amber-200">
          Case: {titleOf(caseId)}
        </span>
      </header>

      {message && (
        <p
          role="status"
          className={cn(
            "rounded-md border px-3 py-2 text-sm",
            message.ok
              ? "border-emerald-800 bg-emerald-950/30 text-emerald-200"
              : "border-red-900 bg-red-950/30 text-red-200",
          )}
        >
          {message.text}
        </p>
      )}

      {/* Offers */}
      <Section
        title="Gói bán"
        icon={ShoppingCart}
        actions={
          <button
            type="button"
            className={secondary}
            onClick={() => setEditing(emptyOffer(caseId))}
          >
            <Plus className="size-4" /> Thêm gói
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="py-2 pr-3">SKU</th>
                <th className="py-2 pr-3">Loại</th>
                <th className="py-2 pr-3">Tên</th>
                <th className="py-2 pr-3">Giá</th>
                <th className="py-2 pr-3">Lượt nhóm</th>
                <th className="py-2 pr-3">Link / ảnh</th>
                <th className="py-2 pr-3">Hiện</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {offers.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-4 text-zinc-500">
                    Vụ này chưa có gói bán.
                  </td>
                </tr>
              )}
              {offers.map((o) => (
                <tr key={o.id} className={cn(!o.active && "opacity-50")}>
                  <td className="py-2 pr-3 font-mono">{o.sku}</td>
                  <td className="py-2 pr-3">
                    {o.kind === "box" ? "Hộp" : "Online"}
                  </td>
                  <td className="py-2 pr-3">{o.title}</td>
                  <td className="py-2 pr-3 font-mono">
                    {o.kind === "box" && !o.price_vnd
                      ? "—"
                      : formatVnd(o.price_vnd)}
                  </td>
                  <td className="py-2 pr-3">
                    {o.kind === "online" ? o.group_credits : "—"}
                  </td>
                  <td className="py-2 pr-3 text-xs text-zinc-400">
                    {o.external_url
                      ? "có link"
                      : o.kind === "box"
                        ? "thiếu link"
                        : ""}
                    {o.image_url ? " · có ảnh" : ""}
                  </td>
                  <td className="py-2 pr-3">{o.active ? "Có" : "Ẩn"}</td>
                  <td className="py-2 text-right">
                    <button
                      type="button"
                      className="inline-flex h-8 items-center gap-1 rounded px-2 text-xs text-zinc-300 hover:bg-zinc-800"
                      onClick={() => setEditing(toInput(o))}
                    >
                      <Pencil className="size-3.5" /> Sửa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editing && (
          <form
            onSubmit={submitOffer}
            className="grid gap-3 rounded-lg border border-white/10 bg-black/30 p-4 sm:grid-cols-2"
          >
            <p className="text-sm font-semibold text-zinc-200 sm:col-span-2">
              {editing.id ? `Sửa gói ${editing.sku}` : "Gói mới"}
            </p>
            <label className={label}>
              <span>SKU (mã gói, không đổi sau khi có đơn)</span>
              <input
                className={input}
                value={editing.sku}
                disabled={!!editing.id}
                onChange={(e) =>
                  setEditing({ ...editing, sku: e.target.value.toLowerCase() })
                }
                placeholder="solo, group, party, box"
              />
            </label>
            <label className={label}>
              <span>Loại</span>
              <select
                className={input}
                value={editing.kind}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    kind: e.target.value as "online" | "box",
                  })
                }
              >
                <option value="online">Online (thanh toán PayOS)</option>
                <option value="box">Bộ hộp (link sàn)</option>
              </select>
            </label>
            <label className={label}>
              <span>Tên gói</span>
              <input
                className={input}
                value={editing.title}
                onChange={(e) =>
                  setEditing({ ...editing, title: e.target.value })
                }
              />
            </label>
            <label className={label}>
              <span>
                Giá (VND{editing.kind === "box" ? ", 0 = không hiện" : ""})
              </span>
              <input
                type="number"
                min={0}
                step={1000}
                className={input}
                value={editing.price_vnd}
                onChange={(e) =>
                  setEditing({ ...editing, price_vnd: Number(e.target.value) })
                }
              />
            </label>
            <label className={`${label} sm:col-span-2`}>
              <span>Mô tả</span>
              <input
                className={input}
                value={editing.description}
                onChange={(e) =>
                  setEditing({ ...editing, description: e.target.value })
                }
              />
            </label>
            {editing.kind === "online" ? (
              <label className={label}>
                <span>Lượt tạo phòng nhóm cộng thêm</span>
                <input
                  type="number"
                  min={0}
                  className={input}
                  value={editing.group_credits}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      group_credits: Number(e.target.value),
                    })
                  }
                />
              </label>
            ) : (
              <label className={label}>
                <span>Link sàn (Shopee / TikTok Shop)</span>
                <input
                  className={input}
                  value={editing.external_url}
                  placeholder="https://..."
                  onChange={(e) =>
                    setEditing({ ...editing, external_url: e.target.value })
                  }
                />
              </label>
            )}
            <label className={label}>
              <span>Ảnh (https://... hoặc /images/...)</span>
              <input
                className={input}
                value={editing.image_url}
                onChange={(e) =>
                  setEditing({ ...editing, image_url: e.target.value })
                }
              />
            </label>
            <label className={label}>
              <span>Thứ tự</span>
              <input
                type="number"
                className={input}
                value={editing.sort_order}
                onChange={(e) =>
                  setEditing({ ...editing, sort_order: Number(e.target.value) })
                }
              />
            </label>
            <label className="flex items-center gap-2 self-end pb-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={editing.active}
                onChange={(e) =>
                  setEditing({ ...editing, active: e.target.checked })
                }
              />
              Hiện trên trang vụ án
            </label>
            <div className="flex gap-2 sm:col-span-2">
              <button type="submit" className={primary} disabled={pending}>
                Lưu gói
              </button>
              <button
                type="button"
                className={secondary}
                onClick={() => setEditing(null)}
              >
                Hủy
              </button>
            </div>
          </form>
        )}
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Box codes */}
        <Section title="Mã hộp" icon={KeyRound}>
          {batches.length > 0 ? (
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="py-1.5">Lô</th>
                  <th className="py-1.5">Tổng</th>
                  <th className="py-1.5">Đã kích hoạt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {batches.map((b) => (
                  <tr key={b.batch ?? "-"}>
                    <td className="py-1.5 font-mono">{b.batch ?? "—"}</td>
                    <td className="py-1.5">{b.total}</td>
                    <td className="py-1.5">{b.redeemed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-zinc-500">Chưa có mã nào cho vụ này.</p>
          )}
          <form
            onSubmit={submitCodes}
            className="grid gap-3 sm:grid-cols-[1fr_6rem_auto] sm:items-end"
          >
            <label className={label}>
              <span>Tên lô in</span>
              <input
                className={input}
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                placeholder="2026-11-lo1"
              />
            </label>
            <label className={label}>
              <span>Số mã</span>
              <input
                type="number"
                min={1}
                max={2000}
                className={input}
                value={codeCount}
                onChange={(e) => setCodeCount(Number(e.target.value))}
              />
            </label>
            <button
              type="submit"
              className={primary}
              disabled={pending || !batchName.trim()}
            >
              <Download className="size-4" /> Sinh và tải CSV
            </button>
          </form>
          <p className="text-xs text-zinc-500">
            File CSV có mã và link QR. Hệ thống chỉ lưu bản băm, không xem lại
            mã gốc được.
          </p>
        </Section>

        {/* Manual grant */}
        <Section title="Cấp quyền tay" icon={UserPlus}>
          <form
            onSubmit={submitGrant}
            className="grid gap-3 sm:grid-cols-[1fr_6rem_auto] sm:items-end"
          >
            <label className={label}>
              <span>Email tài khoản</span>
              <input
                type="email"
                className={input}
                value={grantEmail}
                onChange={(e) => setGrantEmail(e.target.value)}
                placeholder="nguoichoi@example.com"
              />
            </label>
            <label className={label}>
              <span>+ Lượt nhóm</span>
              <input
                type="number"
                min={0}
                className={input}
                value={grantCredits}
                onChange={(e) => setGrantCredits(Number(e.target.value))}
              />
            </label>
            <button
              type="submit"
              className={primary}
              disabled={pending || !grantEmail.trim()}
            >
              Cấp quyền
            </button>
          </form>
          <p className="text-xs text-zinc-500">
            Cấp bản online cho {titleOf(caseId)}, cộng thêm lượt nhóm nếu nhập.
            Dùng cho khách chuyển khoản tay, đền bù, người thử nghiệm.
          </p>
        </Section>
      </div>

      {/* Orders */}
      <Section title="Đơn hàng gần đây (mọi vụ)" icon={ShoppingCart}>
        {data.orders.length === 0 ? (
          <p className="text-sm text-zinc-500">Chưa có đơn hàng.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="py-2 pr-3">Mã</th>
                  <th className="py-2 pr-3">Tài khoản</th>
                  <th className="py-2 pr-3">Vụ / gói</th>
                  <th className="py-2 pr-3">Số tiền</th>
                  <th className="py-2 pr-3">Trạng thái</th>
                  <th className="py-2">Tạo lúc</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.orders.map((o) => (
                  <tr key={o.order_code}>
                    <td className="py-2 pr-3 font-mono">DH{o.order_code}</td>
                    <td className="py-2 pr-3">
                      {o.email ?? o.user_id.slice(0, 8)}
                    </td>
                    <td className="py-2 pr-3">
                      {o.case_id} · {o.sku}
                    </td>
                    <td className="py-2 pr-3 font-mono">
                      {formatVnd(o.amount_vnd)}
                    </td>
                    <td
                      className={cn(
                        "py-2 pr-3 font-semibold",
                        ORDER_STATUS[o.status] ?? "text-zinc-500",
                      )}
                    >
                      {o.status}
                    </td>
                    <td className="py-2 font-mono text-xs text-zinc-400">
                      {o.created_at.slice(0, 16).replace("T", " ")} UTC
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  );
}
