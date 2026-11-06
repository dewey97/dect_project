"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { PlayCard, PlayLabel, PlayShell } from "@/components/play/play-ui";
import { formatVnd } from "@/lib/payments/format";

const POLL_MS = 3_000;
const MAX_POLLS = 40; // about 2 minutes

interface OrderView {
  caseId: string;
  amount: number;
  status: string;
}

type View =
  | { state: "loading" }
  | { state: "login" }
  | { state: "missing" }
  | { state: "order"; order: OrderView; timedOut: boolean };

const linkClass =
  "inline-flex min-h-11 w-full items-center justify-center rounded-lg px-4 text-sm font-semibold";

export function BuyResult({ orderCode }: { orderCode: string }) {
  const [view, setView] = useState<View>({ state: "loading" });

  useEffect(() => {
    let stopped = false;
    let polls = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      polls += 1;
      let next: View | null = null;
      try {
        const res = await fetch(`/api/orders/${orderCode}`, {
          cache: "no-store",
        });
        if (res.status === 401) next = { state: "login" };
        else if (res.status === 404) next = { state: "missing" };
        else if (res.ok) {
          const order = (await res.json()) as OrderView;
          next = {
            state: "order",
            order,
            timedOut: order.status === "pending" && polls >= MAX_POLLS,
          };
        }
      } catch {
        // network blip: poll again
      }
      if (stopped) return;
      if (next) setView(next);
      const keepPolling =
        polls < MAX_POLLS &&
        (next === null ||
          (next.state === "order" && next.order.status === "pending"));
      if (keepPolling) timer = setTimeout(poll, POLL_MS);
    };

    poll();
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }, [orderCode]);

  return (
    <div className="h-dvh">
      <PlayShell>
        <header className="space-y-1">
          <PlayLabel>Đơn hàng DH{orderCode}</PlayLabel>
          <h1 className="text-2xl font-bold leading-tight text-zinc-50">
            Kết quả thanh toán
          </h1>
        </header>

        <PlayCard className="space-y-4">
          <div role="status" aria-live="polite" className="space-y-2">
            {view.state === "loading" && (
              <p className="text-sm text-zinc-400">Đang kiểm tra đơn hàng…</p>
            )}
            {view.state === "login" && (
              <p className="text-sm text-zinc-300">
                Đăng nhập bằng tài khoản đã mua để xem đơn hàng.
              </p>
            )}
            {view.state === "missing" && (
              <p className="text-sm text-zinc-300">
                Không tìm thấy đơn hàng này trên tài khoản của bạn.
              </p>
            )}
            {view.state === "order" && <OrderStatus view={view} />}
          </div>

          {view.state === "login" && (
            <Link
              href={`/login?redirect=${encodeURIComponent(`/buy/result/${orderCode}`)}`}
              className={`${linkClass} bg-amber-500 text-zinc-950 hover:bg-amber-400`}
            >
              Đăng nhập
            </Link>
          )}
          {view.state === "order" && view.order.status === "paid" && (
            <Link
              href={`/play/${view.order.caseId}`}
              className={`${linkClass} bg-amber-500 text-zinc-950 hover:bg-amber-400`}
            >
              Vào chơi
            </Link>
          )}
          {view.state === "order" && view.order.status !== "paid" && (
            <Link
              href={`/cases/${view.order.caseId}`}
              className={`${linkClass} border border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800`}
            >
              Quay lại trang vụ án
            </Link>
          )}
        </PlayCard>
      </PlayShell>
    </div>
  );
}

function OrderStatus({
  view,
}: {
  view: { order: OrderView; timedOut: boolean };
}) {
  const { order, timedOut } = view;
  const amount = formatVnd(order.amount);

  if (order.status === "paid") {
    return (
      <p className="flex items-center gap-2 text-base font-semibold text-emerald-300">
        <CheckCircle2 className="size-5" aria-hidden />
        Đã thanh toán {amount}. Vụ án đã gắn vào tài khoản của bạn.
      </p>
    );
  }
  if (order.status === "pending") {
    return (
      <>
        <p className="flex items-center gap-2 text-base font-semibold text-amber-300">
          <Clock className="size-5" aria-hidden />
          Đang chờ xác nhận thanh toán {amount}…
        </p>
        <p className="text-xs text-zinc-500">
          {timedOut
            ? "Chưa nhận được xác nhận. Nếu đã chuyển khoản, tải lại trang sau ít phút; tiền đã trừ sẽ được ghi nhận."
            : "Trang tự cập nhật. Không cần chuyển khoản lại."}
        </p>
      </>
    );
  }
  const label =
    order.status === "cancelled"
      ? "Bạn đã hủy thanh toán."
      : order.status === "expired"
        ? "Link thanh toán đã hết hạn."
        : "Thanh toán không thành công. Liên hệ hỗ trợ nếu đã bị trừ tiền.";
  return (
    <p className="flex items-center gap-2 text-base font-semibold text-red-300">
      <XCircle className="size-5" aria-hidden />
      {label}
    </p>
  );
}
