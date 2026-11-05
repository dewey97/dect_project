"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Package, ShieldCheck } from "lucide-react";
import {
  PlayButton,
  PlayCard,
  PlayError,
  PlayLabel,
  PlayShell,
} from "@/components/play/play-ui";
import { formatVnd } from "@/lib/payments/format";

export interface BuyOffer {
  sku: string;
  kind: "online" | "box";
  title: string;
  description: string | null;
  priceVnd: number;
  groupCredits: number;
  externalUrl: string | null;
}

const CHECKOUT_ERRORS: Record<string, string> = {
  payments_disabled: "Thanh toán online sắp mở bán.",
  offer_not_found: "Gói này không còn bán.",
  rate_limited: "Bạn bấm quá nhanh. Thử lại sau ít phút.",
  provider_error: "Cổng thanh toán đang lỗi. Thử lại sau.",
};

export function BuyOffers({
  caseId,
  caseTitle,
  synopsis,
  offers,
  loggedIn,
  ownedCredits,
  paymentsEnabled,
}: {
  caseId: string;
  caseTitle: string;
  synopsis: string | null;
  offers: BuyOffer[];
  loggedIn: boolean;
  /** null: no license yet. */
  ownedCredits: number | null;
  paymentsEnabled: boolean;
}) {
  const router = useRouter();
  const [pendingSku, setPendingSku] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const online = offers.filter((o) => o.kind === "online");
  const boxes = offers.filter((o) => o.kind === "box");
  const owned = ownedCredits !== null;

  const buy = async (sku: string) => {
    setError(null);
    if (!loggedIn) {
      router.push(`/login?redirect=${encodeURIComponent(`/buy/${caseId}`)}`);
      return;
    }
    setPendingSku(sku);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId, sku }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && typeof body.checkoutUrl === "string") {
        window.location.href = body.checkoutUrl;
        return;
      }
      setError(
        CHECKOUT_ERRORS[body.error] ?? "Không tạo được đơn hàng. Thử lại sau.",
      );
    } catch {
      setError("Mất kết nối. Thử lại sau.");
    }
    setPendingSku(null);
  };

  return (
    <div className="h-dvh">
      <PlayShell>
        <header className="space-y-1">
          <PlayLabel>Mua vụ án</PlayLabel>
          <h1 className="text-2xl font-bold leading-tight text-zinc-50">
            {caseTitle}
          </h1>
          {synopsis && (
            <p className="text-sm leading-relaxed text-zinc-400">{synopsis}</p>
          )}
        </header>

        {owned && (
          <PlayCard className="space-y-3 border-emerald-900/60">
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
              <ShieldCheck className="size-4" aria-hidden />
              Bạn đã sở hữu vụ án này
            </p>
            <p className="text-xs text-zinc-400">
              Lượt tạo phòng nhóm còn lại: {ownedCredits}
            </p>
            <Link
              href={`/play/${caseId}`}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-amber-500 px-4 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
            >
              Vào chơi
            </Link>
          </PlayCard>
        )}

        <section className="space-y-3" aria-labelledby="online-heading">
          <h2 id="online-heading">
            <PlayLabel>Bản online</PlayLabel>
          </h2>
          {online.length === 0 && (
            <PlayCard>
              <p className="text-sm text-zinc-400">Chưa có gói online.</p>
            </PlayCard>
          )}
          {online.map((offer) => (
            <PlayCard key={offer.sku} className="space-y-3">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-lg font-bold text-zinc-50">
                  {offer.title}
                </h3>
                <span className="font-mono text-lg font-bold text-amber-300">
                  {formatVnd(offer.priceVnd)}
                </span>
              </div>
              {offer.description && (
                <p className="text-sm leading-relaxed text-zinc-400">
                  {offer.description}
                </p>
              )}
              <PlayButton
                className="w-full"
                disabled={!paymentsEnabled || pendingSku !== null}
                onClick={() => buy(offer.sku)}
              >
                {!paymentsEnabled
                  ? "Sắp mở bán"
                  : pendingSku === offer.sku
                    ? "Đang tạo đơn…"
                    : owned && offer.groupCredits > 0
                      ? `Mua thêm ${offer.groupCredits} lượt nhóm`
                      : "Thanh toán"}
              </PlayButton>
            </PlayCard>
          ))}
          <PlayError>{error}</PlayError>
          {paymentsEnabled && !loggedIn && online.length > 0 && (
            <p className="text-xs text-zinc-500">
              Cần đăng nhập để vụ án gắn với tài khoản của bạn.
            </p>
          )}
        </section>

        {boxes.length > 0 && (
          <section className="space-y-3" aria-labelledby="box-heading">
            <h2 id="box-heading">
              <PlayLabel>Bộ hộp vật lý</PlayLabel>
            </h2>
            {boxes.map((offer) => (
              <PlayCard key={offer.sku} className="space-y-3">
                <h3 className="flex items-center gap-2 text-lg font-bold text-zinc-50">
                  <Package className="size-5 text-zinc-400" aria-hidden />
                  {offer.title}
                </h3>
                {offer.description && (
                  <p className="text-sm leading-relaxed text-zinc-400">
                    {offer.description}
                  </p>
                )}
                {offer.externalUrl ? (
                  <a
                    href={offer.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 text-sm font-semibold text-zinc-100 hover:bg-zinc-800"
                  >
                    Mua trên sàn
                    <ExternalLink className="size-4" aria-hidden />
                  </a>
                ) : (
                  <p className="text-sm text-zinc-500">Sắp mở bán.</p>
                )}
                <p className="text-xs text-zinc-500">
                  Đã có hộp? Quét mã QR trong nắp hộp để vào chơi.
                </p>
              </PlayCard>
            ))}
          </section>
        )}

        <Link
          href={`/play/${caseId}`}
          className="inline-flex min-h-11 items-center gap-2 self-center px-3 text-sm text-zinc-500 hover:text-zinc-300"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Quay lại màn vào game
        </Link>
      </PlayShell>
    </div>
  );
}
