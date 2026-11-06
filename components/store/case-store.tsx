"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, KeyRound, Lock, Monitor, Package } from "lucide-react";
import {
  PlayButton,
  PlayCard,
  PlayError,
  PlayLabel,
  inputClass,
} from "@/components/play/play-ui";
import { formatVnd } from "@/lib/payments/format";
import { OwnershipBadge } from "@/components/store/ownership-badge";

export interface CaseOffer {
  sku: string;
  kind: "online" | "box";
  title: string;
  description: string | null;
  priceVnd: number;
  groupCredits: number;
  externalUrl: string | null;
  imageUrl: string | null;
}

export interface CaseOwnership {
  online: boolean;
  box: boolean;
  groupCredits: number;
}

const CHECKOUT_ERRORS: Record<string, string> = {
  payments_disabled: "Thanh toán online sắp mở bán.",
  offer_not_found: "Gói này không còn bán.",
  rate_limited: "Bạn bấm quá nhanh. Thử lại sau ít phút.",
  provider_error: "Cổng thanh toán đang lỗi. Thử lại sau.",
};

const REDEEM_ERRORS: Record<string, string> = {
  invalid_code: "Mã không đúng. Mã gồm 12 ký tự, in trong nắp hộp.",
  code_used: "Mã này đã được kích hoạt trên một tài khoản khác.",
  rate_limited: "Nhập sai quá nhiều lần. Thử lại sau 1 phút.",
};

const primaryLink =
  "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors";

export function CaseStore({
  caseId,
  caseTitle,
  synopsis,
  coverImageUrl,
  offers,
  loggedIn,
  ownership,
  paymentsEnabled,
  gatingEnabled,
  initialCode,
}: {
  caseId: string;
  caseTitle: string;
  synopsis: string | null;
  coverImageUrl: string | null;
  offers: CaseOffer[];
  loggedIn: boolean;
  ownership: CaseOwnership;
  paymentsEnabled: boolean;
  gatingEnabled: boolean;
  initialCode: string;
}) {
  const router = useRouter();
  const owned = ownership.online || ownership.box;
  const canPlay = owned || !gatingEnabled;
  const selfPath = `/cases/${caseId}`;
  const loginHref = (next: string) =>
    `/login?redirect=${encodeURIComponent(next)}`;

  const online = offers.filter((o) => o.kind === "online");
  const box = offers.find((o) => o.kind === "box") ?? null;

  // --- Online checkout ---
  const [pendingSku, setPendingSku] = useState<string | null>(null);
  const [buyError, setBuyError] = useState<string | null>(null);

  const buy = async (sku: string) => {
    setBuyError(null);
    if (!loggedIn) return router.push(loginHref(`${selfPath}#online`));
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
      setBuyError(
        CHECKOUT_ERRORS[body.error] ?? "Không tạo được đơn hàng. Thử lại sau.",
      );
    } catch {
      setBuyError("Mất kết nối. Thử lại sau.");
    }
    setPendingSku(null);
  };

  // --- Box activation ---
  const [code, setCode] = useState(initialCode);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  const redeem = async (e: FormEvent) => {
    e.preventDefault();
    setRedeemError(null);
    if (!loggedIn) {
      const next = code.trim()
        ? `${selfPath}?code=${encodeURIComponent(code.trim())}#box`
        : `${selfPath}#box`;
      return router.push(loginHref(next));
    }
    setRedeeming(true);
    try {
      const res = await fetch("/api/box/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && typeof body.caseId === "string") {
        // The code may belong to another case: open that case's page.
        if (body.caseId !== caseId) router.push(`/cases/${body.caseId}`);
        else router.replace(selfPath);
        router.refresh();
        setCode("");
      } else {
        setRedeemError(
          REDEEM_ERRORS[body.error] ?? "Không kích hoạt được. Thử lại sau.",
        );
      }
    } catch {
      setRedeemError("Mất kết nối. Thử lại sau.");
    }
    setRedeeming(false);
  };

  return (
    <div className="min-h-dvh w-full bg-[#0d0c0a] text-zinc-100">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:py-10">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end">
          {coverImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImageUrl}
              alt=""
              className="aspect-[1/1.414] w-28 shrink-0 rounded-md border border-zinc-800 object-cover"
            />
          )}
          <div className="min-w-0 flex-1 space-y-2">
            <PlayLabel>Hồ sơ vụ án</PlayLabel>
            <h1 className="text-3xl font-bold leading-tight text-zinc-50">
              {caseTitle}
            </h1>
            <div>
              <OwnershipBadge ownership={ownership} />
            </div>
            {synopsis && (
              <p className="max-w-prose text-sm leading-relaxed text-zinc-400">
                {synopsis}
              </p>
            )}
          </div>
        </header>

        {/* Play */}
        <PlayCard className="space-y-2">
          {canPlay ? (
            <Link
              href={`/play/${caseId}`}
              className={`${primaryLink} bg-amber-500 text-zinc-950 hover:bg-amber-400`}
            >
              Vào chơi
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className={`${primaryLink} cursor-not-allowed bg-zinc-800 text-zinc-500`}
            >
              <Lock className="size-4" aria-hidden />
              Vào chơi
            </button>
          )}
          <p className="text-center text-xs text-zinc-500">
            {owned
              ? ownership.online && !ownership.box
                ? `Còn ${ownership.groupCredits} lượt tạo phòng nhóm. Tự chơi không giới hạn.`
                : "Tạo phòng nhóm miễn phí với bộ hộp."
              : canPlay
                ? "Đang mở chơi thử, chưa cần mua."
                : "Mua bản online hoặc kích hoạt hộp để chơi. Bạn bè vào phòng của bạn không cần mua."}
          </p>
        </PlayCard>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Box */}
          <section
            id="box"
            aria-labelledby="box-heading"
            className="scroll-mt-6"
          >
            <PlayCard className="flex h-full flex-col gap-4">
              <h2
                id="box-heading"
                className="flex items-center gap-2 text-lg font-bold text-zinc-50"
              >
                <Package className="size-5 text-zinc-400" aria-hidden />
                {box?.title ?? "Bộ hộp vật lý"}
              </h2>
              {(box?.imageUrl || coverImageUrl) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={box?.imageUrl || coverImageUrl || ""}
                  alt={`Ảnh ${box?.title ?? "bộ hộp"}`}
                  className="aspect-[4/3] w-full rounded-lg border border-zinc-800 object-cover"
                />
              )}
              {box?.description && (
                <p className="text-sm leading-relaxed text-zinc-400">
                  {box.description}
                </p>
              )}
              {box && box.priceVnd > 0 && (
                <p className="font-mono text-lg font-bold text-amber-300">
                  {formatVnd(box.priceVnd)}
                </p>
              )}
              {box?.externalUrl ? (
                <a
                  href={box.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${primaryLink} border border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800`}
                >
                  Đặt hàng
                  <ExternalLink className="size-4" aria-hidden />
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className={`${primaryLink} cursor-not-allowed border border-zinc-800 text-zinc-500`}
                >
                  Đặt hàng (sắp mở bán)
                </button>
              )}

              <form
                onSubmit={redeem}
                className="mt-auto space-y-2 border-t border-zinc-800 pt-4"
              >
                <label
                  htmlFor="box-code"
                  className="flex items-center gap-2 text-sm font-medium text-zinc-200"
                >
                  <KeyRound className="size-4" aria-hidden />
                  {ownership.box
                    ? "Kích hoạt thêm hộp"
                    : "Đã có hộp? Nhập mã trong nắp hộp"}
                </label>
                <input
                  id="box-code"
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setRedeemError(null);
                  }}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  maxLength={20}
                  placeholder="XXXX-XXXX-XXXX"
                  className={`${inputClass} font-mono tracking-widest`}
                />
                <PlayError>{redeemError}</PlayError>
                <PlayButton
                  type="submit"
                  variant="secondary"
                  className="w-full"
                  disabled={redeeming || !code.trim()}
                >
                  {redeeming
                    ? "Đang kích hoạt…"
                    : loggedIn
                      ? "Kích hoạt hộp"
                      : "Đăng nhập để kích hoạt"}
                </PlayButton>
              </form>
            </PlayCard>
          </section>

          {/* Online */}
          <section
            id="online"
            aria-labelledby="online-heading"
            className="scroll-mt-6"
          >
            <PlayCard className="flex h-full flex-col gap-4">
              <h2
                id="online-heading"
                className="flex items-center gap-2 text-lg font-bold text-zinc-50"
              >
                <Monitor className="size-5 text-zinc-400" aria-hidden />
                Chơi online
              </h2>
              <p className="text-sm leading-relaxed text-zinc-400">
                Toàn bộ hồ sơ trên điện thoại hoặc máy tính, không cần hộp.
              </p>
              {online.length === 0 && (
                <p className="text-sm text-zinc-500">Chưa có gói online.</p>
              )}
              <ul className="space-y-3">
                {online.map((offer) => (
                  <li
                    key={offer.sku}
                    className="space-y-2 rounded-lg border border-zinc-800 p-3"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-bold text-zinc-50">{offer.title}</h3>
                      <span className="font-mono font-bold text-amber-300">
                        {formatVnd(offer.priceVnd)}
                      </span>
                    </div>
                    {offer.description && (
                      <p className="text-xs leading-relaxed text-zinc-400">
                        {offer.description}
                      </p>
                    )}
                    <PlayButton
                      className="w-full"
                      variant={ownership.online ? "secondary" : "primary"}
                      disabled={!paymentsEnabled || pendingSku !== null}
                      onClick={() => buy(offer.sku)}
                    >
                      {!paymentsEnabled
                        ? "Sắp mở bán"
                        : pendingSku === offer.sku
                          ? "Đang tạo đơn…"
                          : ownership.online
                            ? offer.groupCredits > 0
                              ? `Mua thêm ${offer.groupCredits} lượt nhóm`
                              : "Đã sở hữu"
                            : loggedIn
                              ? "Mua"
                              : "Đăng nhập để mua"}
                    </PlayButton>
                  </li>
                ))}
              </ul>
              <PlayError>{buyError}</PlayError>
            </PlayCard>
          </section>
        </div>

        <nav className="flex flex-wrap justify-center gap-x-6 text-sm text-zinc-500">
          <Link href="/cases" className="px-1 py-3 hover:text-zinc-300">
            Các vụ án khác
          </Link>
          {loggedIn && (
            <Link href="/me" className="px-1 py-3 hover:text-zinc-300">
              Vụ án của tôi
            </Link>
          )}
          <Link href="/" className="px-1 py-3 hover:text-zinc-300">
            Về trang chủ
          </Link>
        </nav>
      </div>
    </div>
  );
}
