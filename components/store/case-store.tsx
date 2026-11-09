"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  Monitor,
  Package,
  Star,
  ThumbsUp,
  Send,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PlayButton, PlayError } from "@/components/play/play-ui";
import { formatVnd } from "@/lib/payments/format";
import { isUpgradeSku } from "@/lib/payments/offers";
import { SafeImg } from "@/components/ui/safe-img";
import { LandingFooter } from "@/components/public/landing-footer";
import { LandingNavbar } from "@/components/public/landing-navbar";

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
  offer_not_found: "Gói phá án không còn khả dụng.",
  already_owned: "Bạn đã sở hữu vụ án này rồi.",
  login_required: "Vui lòng đăng nhập để tiếp tục.",
  payos_misconfigured: "Cổng thanh toán đang bảo trì. Vui lòng thử lại sau.",
  payments_disabled: "Cổng thanh toán đang bảo trì. Vui lòng thử lại sau.",
  upgrade_requires_license: "Gói nâng cấp chỉ dành cho người đã sở hữu vụ án.",
  rate_limited: "Bạn thao tác quá nhanh. Thử lại sau ít phút.",
};

interface UserReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  variant: string;
  content: string;
  likes: number;
  sellerResponse?: string;
}

interface RelatedProduct {
  id: string;
  code?: string;
  title: string;
  tag: string;
  synopsis: string;
  imageUrl: string;
  status: string;
  isMystery?: boolean;
}

const INITIAL_REVIEWS: UserReview[] = [
  {
    id: "rev-1",
    author: "thamtublackwood",
    rating: 5,
    date: "2026-03-22 19:42",
    variant: "Hộp Hồ Sơ Vật Lý",
    content:
      "Cầm hồ sơ giấy đối chiếu hiện trường rồi giải mã trên web cực kỳ bánh cuốn. Các chi tiết then cửa và chất độc gài cắm rất tinh tế. Chơi nhóm 4 người tranh luận sôi nổi suốt 2 tiếng mới tìm ra hung thủ.",
    likes: 24,
    sellerResponse:
      "Cảm ơn thám tử Blackwood! Chúc mừng tổ chuyên án đã phá án thành công xuất sắc.",
  },
  {
    id: "rev-2",
    author: "vandung_kths",
    rating: 5,
    date: "2026-03-18 21:15",
    variant: "Bản Chơi Online Toàn Bộ",
    content:
      "Logic án chặt chẽ không có sạn. Khâu thẩm vấn nghi phạm bóc tách mâu thuẫn giữa lời khai với biên bản khám nghiệm làm rất đã tay. Recommend nên chơi trên màn hình máy tính để soi kỹ các chứng cứ.",
    likes: 19,
  },
  {
    id: "rev-3",
    author: "ngocmai.investigates",
    rating: 5,
    date: "2026-03-12 14:05",
    variant: "Hộp Hồ Sơ Vật Lý",
    content:
      "Đóng gói hộp rất cẩn thận, bìa hồ sơ dày dặn mang lại cảm giác mở tài liệu mật thật sự. Bản đồ và các bức ảnh hiện trường in nét căng.",
    likes: 12,
  },
  {
    id: "rev-4",
    author: "hoangnam_crime99",
    rating: 5,
    date: "2026-03-05 10:30",
    variant: "Bản Chơi Online Toàn Bộ",
    content:
      "Âm thanh nền và phần mô phỏng điện thoại nạn nhân cực kỳ chân thực. Cảm giác bẻ khóa mật khẩu rồi mò vào tin nhắn bí mật của nạn nhân đỉnh chóp!",
    likes: 8,
  },
];

const RELATED_PRODUCTS: RelatedProduct[] = [
  {
    id: "rel-1",
    code: "CASE #001",
    title: "Hồ Sơ Mật Phân Khu 2",
    tag: "Tài liệu chưa giải mật",
    synopsis:
      "Dữ liệu hiện trường và lời khai các bên liên quan đang trong quá trình niêm phong bảo mật của ban chuyên án.",
    imageUrl: "/images/landing/poster_classified.png",
    status: "Sắp ra mắt",
    isMystery: true,
  },
  {
    id: "rel-2",
    code: "CASE #002",
    title: "Hồ Sơ Mật Phân Khu 3",
    tag: "Tài liệu chưa giải mật",
    synopsis:
      "Chuyên án đặc biệt đang được ban chuyên án hoàn thiện hồ sơ pháp y và tang vật điều tra.",
    imageUrl: "/images/landing/poster_classified.png",
    status: "Sắp ra mắt",
    isMystery: true,
  },
  {
    id: "rel-3",
    code: "CASE #003",
    title: "Hồ Sơ Mật Phân Khu 4",
    tag: "Tài liệu chưa giải mật",
    synopsis:
      "Tập tài liệu tuyệt mật đang chờ quyết định giải tỏa niêm phong của cơ quan điều tra.",
    imageUrl: "/images/landing/poster_classified.png",
    status: "Sắp ra mắt",
    isMystery: true,
  },
  {
    id: "rel-4",
    code: "CASE #004",
    title: "Hồ Sơ Mật Phân Khu 5",
    tag: "Tài liệu chưa giải mật",
    synopsis:
      "Hồ sơ vụ án mới đang được thu thập manh mối từ các nhân chứng thực địa.",
    imageUrl: "/images/landing/poster_classified.png",
    status: "Sắp ra mắt",
    isMystery: true,
  },
];

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
  initialCode?: string;
}) {
  const router = useRouter();
  const owned = ownership.online || ownership.box;
  const canPlay = owned || !gatingEnabled;
  const selfPath = `/cases/${caseId}`;
  const loginHref = (next: string) =>
    `/login?redirect=${encodeURIComponent(next)}`;

  const onlineOffers = offers.filter((o) => o.kind === "online");
  const boxOffer = offers.find((o) => o.kind === "box") ?? null;

  // Online offers: purchase cards (Solo, Party) for new players, upgrade cards for owners.
  const describe = (o: CaseOffer) =>
    o.description ||
    (o.groupCredits > 0
      ? `Chơi trọn vụ án + ${o.groupCredits} lượt mở phòng chơi nhóm cho bạn bè.`
      : "Chơi trọn vụ án một mình: hồ sơ, hiện trường 360 và điện thoại tang vật.");
  const purchaseOffers = onlineOffers
    .filter((o) => !isUpgradeSku(o.sku))
    .sort((a, b) => a.priceVnd - b.priceVnd);
  const upgradeOffers = onlineOffers.filter((o) => isUpgradeSku(o.sku));
  const visibleOffers = owned ? upgradeOffers : purchaseOffers;
  // Highlight the group offer when there is a choice.
  const featuredSku =
    visibleOffers.length > 1
      ? visibleOffers.reduce((a, b) =>
          b.groupCredits > a.groupCredits ? b : a,
        ).sku
      : null;
  const startingPrice = purchaseOffers[0]?.priceVnd ?? 0;

  // Always use a valid poster URL (guarantee /poster_c0.webp fallback)
  const effectiveCover =
    coverImageUrl &&
    !coverImageUrl.includes("crime_scene_360") &&
    coverImageUrl.trim() !== ""
      ? coverImageUrl
      : "/poster_c0.webp";

  // Gallery images list (sharp, unrounded)
  const galleryImages: string[] = [
    effectiveCover,
    boxOffer?.imageUrl || "/images/cases/case_000/crime_scene.png",
    "/phone.png",
    "/images/cases/case_000/11.webp",
  ].filter(Boolean);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Zoom Lightbox State
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isZoomOpen) return;
      if (e.key === "Escape") setIsZoomOpen(false);
      if (e.key === "ArrowLeft") {
        setActiveImageIndex((prev) =>
          prev > 0 ? prev - 1 : galleryImages.length - 1,
        );
      }
      if (e.key === "ArrowRight") {
        setActiveImageIndex((prev) =>
          prev < galleryImages.length - 1 ? prev + 1 : 0,
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isZoomOpen, galleryImages.length]);

  // Online checkout state
  // Selected online offer: defaults to the featured (group) offer.
  const [selectedSku, setSelectedSku] = useState<string | null>(null);
  const selectedOffer =
    visibleOffers.find((o) => o.sku === selectedSku) ??
    visibleOffers.find((o) => o.sku === featuredSku) ??
    visibleOffers[0] ??
    null;

  const [pendingSku, setPendingSku] = useState<string | null>(null);
  const [buyError, setBuyError] = useState<string | null>(null);

  const buy = async (sku: string) => {
    setBuyError(null);
    if (!loggedIn) return router.push(loginHref(`${selfPath}#pricing`));
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

  // Shopee-style Reviews state
  const [reviewsList, setReviewsList] = useState<UserReview[]>(INITIAL_REVIEWS);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [newAuthor, setNewAuthor] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const handleAddReview = (e: FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const brandNewReview: UserReview = {
      id: `rev-${Date.now()}`,
      author:
        newAuthor.trim() ||
        (loggedIn ? "Thám tử ẩn danh" : "Người chơi XPLORE"),
      rating: newRating,
      date: new Date().toISOString().slice(0, 16).replace("T", " "),
      variant: purchaseOffers[0]?.title || "Bản Điều Tra",
      content: newComment.trim(),
      likes: 1,
    };

    setReviewsList([brandNewReview, ...reviewsList]);
    setNewComment("");
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 4000);
  };

  const handleLike = (id: string) => {
    setReviewsList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, likes: r.likes + 1 } : r)),
    );
  };

  const filteredReviews = reviewsList.filter((r) => {
    if (activeFilter === "5star") return r.rating === 5;
    if (activeFilter === "4star") return r.rating === 4;
    return true;
  });

  return (
    <div className="min-h-dvh w-full flex flex-col justify-between bg-background text-foreground font-sans antialiased selection:bg-amber-500 selection:text-zinc-950">
      {/* Sticky Top Bar */}
      <LandingNavbar active="cases" />

      {/* Main Container */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
        {/* Top Product Showcase (2 Columns on Desktop) */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Image Gallery (Object contain, full display with dark padding & zoom) */}
          <div className="lg:col-span-7">
            <div className="space-y-3">
              {/* Main Image Container: object-contain with black padding to show 100% of the image (aspect-square 1:1) */}
              <div
                className="group relative aspect-square w-full overflow-hidden rounded-none border border-zinc-800 bg-zinc-950 flex items-center justify-center p-2 cursor-zoom-in select-none"
                onClick={() => {
                  setZoomScale(1);
                  setIsZoomOpen(true);
                }}
                title="Nhấn để phóng to ảnh"
              >
                <SafeImg
                  key={galleryImages[activeImageIndex] || galleryImages[0]}
                  src={galleryImages[activeImageIndex] || galleryImages[0]}
                  fallbackSrc="/poster_c0.webp"
                  alt={`Ảnh hồ sơ ${caseTitle}`}
                  className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                />
              </div>

              {/* Thumbnails row (rounded-none, object-contain, aspect-square) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {galleryImages.map((imgSrc, idx) => {
                  const isActive = idx === activeImageIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative aspect-square w-16 sm:w-20 shrink-0 overflow-hidden rounded-none border bg-zinc-950 p-1 flex items-center justify-center transition-all cursor-pointer ${
                        isActive
                          ? "border-amber-500 ring-1 ring-amber-500"
                          : "border-zinc-800 opacity-60 hover:border-zinc-600 hover:opacity-100"
                      }`}
                    >
                      <SafeImg
                        src={imgSrc}
                        fallbackSrc="/poster_c0.webp"
                        alt={`Ảnh thumbnail ${idx + 1}`}
                        className="h-full w-full object-contain pointer-events-none"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Case Info, Options & Action Buttons */}
          <div className="flex flex-col justify-start space-y-4 lg:col-span-5">
            {/* Title & Quick Rating Header */}
            <div className="space-y-1.5">
              <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-50 sm:text-3xl">
                {caseTitle}
              </h1>

              {/* Quick review rating header */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 pt-0.5">
                <div className="flex items-center gap-1 text-amber-400">
                  <span className="font-bold underline">5.0</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className="size-3 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                </div>
                <span className="text-zinc-600">·</span>
                <a href="#reviews" className="underline hover:text-zinc-200">
                  128 Đánh giá
                </a>
                <span className="text-zinc-600">·</span>
                <span>Đã bán 450+</span>
              </div>
            </div>

            {/* Status / Price Display */}
            <div className="py-0.5">
              {owned ? (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-2xl sm:text-3xl font-black text-emerald-400 uppercase tracking-tight">
                    ĐÃ SỞ HỮU
                  </span>
                  {ownership.groupCredits > 0 ? (
                    <span className="font-mono text-xs text-zinc-300 bg-zinc-900 border border-zinc-800 px-2 py-0.5">
                      Còn {ownership.groupCredits} lượt tạo phòng nhóm
                    </span>
                  ) : (
                    <span className="font-mono text-xs text-zinc-500">
                      (Bản quyền trực tuyến vĩnh viễn)
                    </span>
                  )}
                </div>
              ) : (
                <span className="font-mono text-3xl font-extrabold text-amber-400">
                  {startingPrice > 0
                    ? `Từ ${formatVnd(startingPrice)}`
                    : "199.000₫"}
                </span>
              )}
            </div>

            {/* Synopsis */}
            {synopsis && (
              <p className="text-xs leading-relaxed text-zinc-300 sm:text-sm">
                {synopsis}
              </p>
            )}

            {/* Primary action for players who can already play: kept apart from the offers */}
            {canPlay && (
              <Link
                href={`/play/${caseId}`}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-none bg-emerald-500 px-4 text-sm font-bold uppercase tracking-wider text-zinc-950 transition-colors hover:bg-emerald-400"
              >
                <span>Vào chơi ngay</span>
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            )}

            {/* ONLINE OFFERS: one card per offer, each with its own buy button */}
            <div id="pricing" className="space-y-2.5 pt-1">
              {visibleOffers.length > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor className="size-3.5 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
                      {owned ? "Nâng cấp chơi nhóm:" : "Chọn cách chơi online:"}
                    </span>
                  </div>
                  {owned && (
                    <span className="text-xs font-semibold text-emerald-400">
                      ✓ Đã sở hữu vụ án
                    </span>
                  )}
                </div>
              )}

              {selectedOffer && (
                <>
                  {/* Small selectable price boxes */}
                  <div
                    role="radiogroup"
                    aria-label="Gói chơi online"
                    className="flex flex-wrap gap-2"
                  >
                    {visibleOffers.map((o) => {
                      const selected = o.sku === selectedOffer.sku;
                      return (
                        <button
                          key={o.sku}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => setSelectedSku(o.sku)}
                          className={`relative flex min-h-11 min-w-[7.5rem] flex-col items-start rounded-none border px-3 py-2 text-left transition-colors cursor-pointer ${
                            selected
                              ? "border-amber-500 bg-amber-500/10"
                              : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-600"
                          }`}
                        >
                          {o.sku === featuredSku && (
                            <span className="absolute -top-2 right-2 bg-amber-500 px-1.5 font-mono text-[0.55rem] font-bold uppercase tracking-wider text-zinc-950">
                              Phổ biến
                            </span>
                          )}
                          <span
                            className={`text-sm font-bold ${selected ? "text-amber-200" : "text-zinc-200"}`}
                          >
                            {o.title}
                          </span>
                          <span className="font-mono text-sm font-extrabold text-amber-400">
                            {formatVnd(o.priceVnd)}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Description follows the selected box */}
                  <p
                    key={selectedOffer.sku}
                    aria-live="polite"
                    className="text-xs leading-relaxed text-zinc-400 animate-in fade-in duration-200"
                  >
                    {describe(selectedOffer)}
                  </p>

                  <PlayButton
                    className="w-full rounded-none py-3 text-sm font-bold uppercase tracking-wider"
                    variant="primary"
                    disabled={!paymentsEnabled || pendingSku !== null}
                    onClick={() => buy(selectedOffer.sku)}
                  >
                    {!paymentsEnabled
                      ? "Sắp mở bán"
                      : pendingSku === selectedOffer.sku
                        ? "Đang tạo đơn hàng PayOS…"
                        : !loggedIn
                          ? "Đăng nhập để mua"
                          : owned
                            ? `Nâng cấp · ${formatVnd(selectedOffer.priceVnd)}`
                            : `Mua ${selectedOffer.title} · ${formatVnd(selectedOffer.priceVnd)}`}
                  </PlayButton>
                </>
              )}
              <PlayError>{buyError}</PlayError>
            </div>

            <div className="space-y-2.5 pt-2">
              {/* Physical box: title + two plain shop links, same style, no price */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Package className="size-3.5 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
                    Đặt hộp hồ sơ vật lý:
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={boxOffer?.externalUrl || "https://shopee.vn"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-10 sm:min-h-9 items-center gap-1.5 rounded-none border border-zinc-700 bg-zinc-900/60 px-3.5 text-xs font-semibold text-zinc-200 transition-colors hover:border-amber-500/60 hover:text-amber-300"
                  >
                    <span>Shopee</span>
                    <ExternalLink className="size-3 shrink-0" aria-hidden />
                  </a>
                  <a
                    href="https://www.tiktok.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-10 sm:min-h-9 items-center gap-1.5 rounded-none border border-zinc-700 bg-zinc-900/60 px-3.5 text-xs font-semibold text-zinc-200 transition-colors hover:border-amber-500/60 hover:text-amber-300"
                  >
                    <span>TikTok Shop</span>
                    <ExternalLink className="size-3 shrink-0" aria-hidden />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Reviews and Feedback (Clean minimal layout, no redundant box frames) */}
        <section id="reviews" className="mt-14 pt-8 border-t border-zinc-900">
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold uppercase tracking-wider text-zinc-100">
                  ĐÁNH GIÁ SẢN PHẨM
                </h2>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="font-mono text-2xl font-black text-amber-400">
                    5.0
                  </span>
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className="size-3.5 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <span className="text-xs text-zinc-500">
                    trên 5 sao (128 lượt)
                  </span>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: "all", label: "Tất cả" },
                  { id: "5star", label: "5 Sao (120)" },
                  { id: "4star", label: "4 Sao (8)" },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setActiveFilter(filter.id)}
                    className={`rounded-none px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                      activeFilter === filter.id
                        ? "border border-amber-500 bg-amber-500/10 text-amber-400"
                        : "border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Review Input Form: Direct minimal inputs without outer container box */}
            <div className="pt-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                Viết đánh giá của bạn
              </h3>
              <form onSubmit={handleAddReview} className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="Tên thám tử / Biệt danh (tuỳ chọn)"
                    className="w-full rounded-none border border-zinc-800/80 bg-zinc-900/50 px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-amber-500/60 focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400">Đánh giá:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`size-4 ${
                              star <= newRating
                                ? "fill-amber-400 text-amber-400"
                                : "text-zinc-600"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm khám nghiệm hiện trường, bóc tách mâu thuẫn lời khai..."
                  className="w-full rounded-none border border-zinc-800/80 bg-zinc-900/50 p-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-amber-500/60 focus:outline-none"
                />

                <div className="flex items-center justify-between">
                  {reviewSuccess ? (
                    <span className="text-xs font-medium text-emerald-400">
                      ✓ Đánh giá đã được ghi nhận vào chuyên án!
                    </span>
                  ) : (
                    <span className="text-[11px] text-zinc-500">
                      Đánh giá sẽ được hiển thị công khai ngay sau khi gửi.
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="inline-flex items-center gap-1.5 rounded-none bg-amber-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-950 transition-colors hover:bg-amber-400 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="size-3" />
                    <span>Gửi đánh giá</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Reviews List */}
            <div className="space-y-2 pt-2">
              {filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="border-b border-zinc-900 pb-4 pt-2"
                >
                  <div className="flex items-start gap-3">
                    {/* Detective Avatar Initial */}
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-none border border-zinc-800 bg-zinc-900 font-mono text-xs font-bold text-amber-400 uppercase">
                      {rev.author.slice(0, 2)}
                    </div>

                    <div className="flex-1 space-y-1">
                      {/* Name & Time */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-200">
                          {rev.author}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {rev.date}
                        </span>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star
                            key={i}
                            className="size-3 fill-amber-400 text-amber-400"
                          />
                        ))}
                      </div>

                      {/* Variant Info */}
                      <div className="text-[11px] text-zinc-400">
                        Phân loại hàng: {rev.variant}
                      </div>

                      {/* Review Comment Content */}
                      <p className="pt-1 text-xs leading-relaxed text-zinc-300">
                        {rev.content}
                      </p>

                      {/* Seller Response if any */}
                      {rev.sellerResponse && (
                        <div className="mt-2 border-l-2 border-amber-500/50 pl-3 py-1 text-[11px] leading-relaxed text-zinc-400">
                          <span className="font-semibold text-amber-400">
                            Phản hồi của XPLORE Team:{" "}
                          </span>
                          {rev.sellerResponse}
                        </div>
                      )}

                      {/* Like Action */}
                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => handleLike(rev.id)}
                          className="flex items-center gap-1.5 text-[11px] text-zinc-500 transition-colors hover:text-zinc-300 cursor-pointer"
                        >
                          <ThumbsUp className="size-3" />
                          Hữu ích ({rev.likes})
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section: Other Cases & Products (Synced with Collection style) */}
        <section className="mt-14">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-black uppercase tracking-tight text-zinc-100 sm:text-2xl">
              CÁC SẢN PHẨM KHÁC
            </h2>
            <Link
              href="/cases"
              className="text-xs uppercase tracking-wider text-zinc-400 transition-colors hover:text-amber-400"
            >
              Xem tất cả →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {RELATED_PRODUCTS.map((prod) => (
              <div
                key={prod.id}
                className="group flex flex-col justify-between"
              >
                <div>
                  {/* A4 Poster Aspect Ratio (1 / 1.414) */}
                  <div className="relative aspect-[1/1.414] w-full overflow-hidden bg-zinc-950">
                    <SafeImg
                      src={prod.imageUrl}
                      fallbackSrc="/poster_c0.webp"
                      alt={prod.title}
                      className="h-full w-full rounded-none object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Status label overlay */}
                    <div className="absolute left-2 top-2 z-10">
                      <span className="bg-black/80 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-300">
                        {prod.status}
                      </span>
                    </div>
                  </div>

                  {/* Information (Minimal, NO stars, NO button, NO price, NO truncation) */}
                  <div className="mt-3 space-y-1">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                      {prod.code || prod.tag}
                    </div>

                    <h3 className="text-sm font-bold uppercase text-zinc-100 group-hover:text-amber-400 transition-colors">
                      {prod.title}
                    </h3>

                    <p className="text-xs leading-relaxed text-zinc-400">
                      {prod.synopsis}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* FULLSCREEN IMAGE LIGHTBOX MODAL */}
      {isZoomOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md select-none animate-in fade-in duration-200"
          onClick={() => setIsZoomOpen(false)}
        >
          {/* Top Bar Controls */}
          <div
            className="absolute top-4 right-4 flex items-center gap-3 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Toggle Zoom Scale */}
            <button
              type="button"
              onClick={() => setZoomScale((prev) => (prev === 1 ? 1.6 : 1))}
              className="flex size-9 items-center justify-center rounded-none border border-zinc-700 bg-zinc-900/80 text-zinc-300 transition-colors hover:border-amber-500 hover:text-amber-400 cursor-pointer"
              title={zoomScale === 1 ? "Phóng đại 160%" : "Thu về 100%"}
            >
              {zoomScale === 1 ? (
                <ZoomIn className="size-4" />
              ) : (
                <ZoomOut className="size-4" />
              )}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              className="flex size-9 items-center justify-center rounded-none border border-zinc-700 bg-zinc-900/80 text-zinc-300 transition-colors hover:border-red-500 hover:text-red-400 cursor-pointer"
              title="Đóng (ESC)"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Left Arrow */}
          {galleryImages.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveImageIndex((prev) =>
                  prev > 0 ? prev - 1 : galleryImages.length - 1,
                );
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex size-10 items-center justify-center rounded-none border border-zinc-800 bg-zinc-900/80 text-zinc-300 transition-colors hover:border-amber-500 hover:text-amber-400 z-10 cursor-pointer"
              title="Ảnh trước"
            >
              <ChevronLeft className="size-5" />
            </button>
          )}

          {/* Centered Image with Zoom Scale */}
          <div
            className="max-h-[90vh] max-w-[90vw] overflow-auto flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <SafeImg
              src={galleryImages[activeImageIndex] || galleryImages[0]}
              fallbackSrc="/poster_c0.webp"
              alt={`Phóng to ảnh ${activeImageIndex + 1}`}
              style={{
                transform: `scale(${zoomScale})`,
                transition: "transform 0.25s ease-out",
              }}
              className={`max-h-[85vh] max-w-[85vw] object-contain shadow-2xl ${
                zoomScale > 1 ? "cursor-zoom-out" : "cursor-zoom-in"
              }`}
              onClick={() => setZoomScale((prev) => (prev === 1 ? 1.6 : 1))}
            />
          </div>

          {/* Right Arrow */}
          {galleryImages.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveImageIndex((prev) =>
                  prev < galleryImages.length - 1 ? prev + 1 : 0,
                );
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex size-10 items-center justify-center rounded-none border border-zinc-800 bg-zinc-900/80 text-zinc-300 transition-colors hover:border-amber-500 hover:text-amber-400 z-10 cursor-pointer"
              title="Ảnh tiếp"
            >
              <ChevronRight className="size-5" />
            </button>
          )}

          {/* Image index counter indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-xs text-zinc-400 bg-zinc-900/80 px-3 py-1 border border-zinc-800">
            {activeImageIndex + 1} / {galleryImages.length}
          </div>
        </div>
      )}

      {/* Synced Landing Page Footer */}
      <LandingFooter />
    </div>
  );
}
