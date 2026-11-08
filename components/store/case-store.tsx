"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  Monitor,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  ThumbsUp,
  Send,
  ArrowRight,
  Flame,
  Check,
  ZoomIn,
  ZoomOut,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PlayButton, PlayError } from "@/components/play/play-ui";
import { formatVnd } from "@/lib/payments/format";
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

  // Online options list
  const onlineOptions = onlineOffers.map((o) => ({
    key: `online-${o.sku}`,
    sku: o.sku,
    title: o.title,
    priceVnd: o.priceVnd,
    description:
      o.description ||
      (o.groupCredits > 0
        ? `Quyền truy cập trực tuyến không giới hạn + ${o.groupCredits} lượt tạo phòng chơi nhóm cho đồng đội.`
        : "Quyền truy cập trực tuyến không giới hạn toàn bộ hồ sơ, hiện trường 360 và điện thoại tang vật."),
    data: o,
  }));

  // Selected online package
  const [selectedOnlineKey, setSelectedOnlineKey] = useState<string>(() => {
    return onlineOptions[0]?.key || "online-default";
  });

  const selectedOnlineOption =
    onlineOptions.find((opt) => opt.key === selectedOnlineKey) ||
    onlineOptions[0] ||
    null;

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
        setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
      }
      if (e.key === "ArrowRight") {
        setActiveImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isZoomOpen, galleryImages.length]);

  // Online checkout state
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
      author: newAuthor.trim() || (loggedIn ? "Thám tử ẩn danh" : "Người chơi XPLORE"),
      rating: newRating,
      date: new Date().toISOString().slice(0, 16).replace("T", " "),
      variant: selectedOnlineOption?.title || "Bản Điều Tra",
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
      {/* Sticky Top Bar Synced 100% across the platform (No 'Vào chơi' or 'Chưa sở hữu' in header) */}
      <LandingNavbar active="cases" />

      {/* Main Container */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
        {/* Top Product Showcase (2 Columns on Desktop) */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Image Gallery (Object contain, full display with dark padding & zoom) */}
          <div className="lg:col-span-7">
            <div className="space-y-3">
              {/* Main Image Container: object-contain with black padding to show 100% of the image */}
              <div
                className="group relative aspect-[4/3] w-full overflow-hidden rounded-none border border-zinc-800 bg-zinc-950 flex items-center justify-center p-2 cursor-zoom-in select-none"
                onClick={() => {
                  setZoomScale(1);
                  setIsZoomOpen(true);
                }}
                title="Nhấn để phóng to ảnh"
              >
                <SafeImg
                  src={galleryImages[activeImageIndex] || galleryImages[0]}
                  fallbackSrc="/poster_c0.webp"
                  alt={`Ảnh hồ sơ ${caseTitle}`}
                  className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                />

                {/* Phóng to button indicator */}
                <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 rounded-none bg-black/80 px-2.5 py-1 text-[11px] font-mono text-zinc-300 opacity-80 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                  <ZoomIn className="size-3.5 text-amber-400" />
                  <span>Phóng to</span>
                </div>
              </div>

              {/* Thumbnails row (rounded-none, object-contain) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {galleryImages.map((imgSrc, idx) => {
                  const isActive = idx === activeImageIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-none border bg-zinc-950 p-1 flex items-center justify-center transition-all ${
                        isActive
                          ? "border-amber-500 ring-1 ring-amber-500"
                          : "border-zinc-800 opacity-60 hover:border-zinc-600 hover:opacity-100"
                      }`}
                    >
                      <SafeImg
                        src={imgSrc}
                        fallbackSrc="/poster_c0.webp"
                        alt={`Ảnh thumbnail ${idx + 1}`}
                        className="h-full w-full object-contain"
                      />
                    </button>
                  );
                })}
              </div>

              {/* Assurance points */}
              <div className="grid grid-cols-3 gap-2 border-t border-zinc-900 pt-4 text-center text-xs text-zinc-400">
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck className="size-4 text-amber-400" />
                  <span>Bảo mật kịch bản 100%</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Truck className="size-4 text-amber-400" />
                  <span>Freeship toàn quốc</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <RotateCcw className="size-4 text-amber-400" />
                  <span>Đổi trả 1-1 trong 7 ngày</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Case Info, Options & Action Buttons */}
          <div className="flex flex-col justify-start space-y-5 lg:col-span-5">
            {/* Classification & Title */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold uppercase tracking-widest text-amber-400">
                  XPLORE DETECTIVE CASE // #{caseId.toUpperCase()}
                </span>
                <span className="inline-flex items-center gap-1 rounded-none bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
                  <Flame className="size-3" /> BESTSELLER
                </span>
              </div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-50 sm:text-3xl">
                {caseTitle}
              </h1>

              {/* Shopee-style quick review rating header */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                <div className="flex items-center gap-1 text-amber-400">
                  <span className="font-bold underline">5.0</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="size-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <span className="text-zinc-600">|</span>
                <a href="#reviews" className="text-zinc-400 underline hover:text-zinc-200">
                  128 Đánh giá
                </a>
                <span className="text-zinc-600">|</span>
                <span className="text-zinc-400">Đã bán 450+</span>
              </div>
            </div>

            {/* Dynamic Price Banner */}
            <div className="rounded-none border border-zinc-800/80 bg-zinc-900/40 p-4">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-3xl font-extrabold text-amber-400">
                  {selectedOnlineOption && selectedOnlineOption.priceVnd > 0
                    ? formatVnd(selectedOnlineOption.priceVnd)
                    : "199.000₫"}
                </span>
                <span className="font-mono text-xs text-zinc-400">
                  (Bản Online trên web)
                </span>
              </div>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                Mở khóa trực tuyến vĩnh viễn trên trình duyệt, không cần chờ đợi giao hàng. Hoặc đặt mua Bộ Hộp Hồ Sơ Vật Lý (199.000₫) để nhận hồ sơ in tận tay.
              </p>
            </div>

            {/* Synopsis */}
            {synopsis && (
              <p className="text-xs leading-relaxed text-zinc-300 sm:text-sm">
                {synopsis}
              </p>
            )}

            {/* CLASSIFICATION: CHỌN GÓI CHƠI ONLINE (Đã bỏ khối Hộp vật lý lặp lại thừa) */}
            <div id="pricing" className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="size-3.5 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
                    Chọn gói chơi online:
                  </span>
                </div>
                {owned && (
                  <span className="text-xs font-semibold text-emerald-400">
                    ✓ Đã sở hữu vụ án
                  </span>
                )}
              </div>

              {/* Online Packages Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {onlineOptions.map((opt) => {
                  const isSelected = selectedOnlineKey === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setSelectedOnlineKey(opt.key)}
                      className={`inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-xs font-semibold transition-all ${
                        isSelected
                          ? "border border-amber-500 bg-amber-500/15 text-amber-300 shadow-sm"
                          : "border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                      }`}
                    >
                      <span>{opt.title} · {formatVnd(opt.priceVnd)}</span>
                      {isSelected && <Check className="size-3 text-amber-400" />}
                    </button>
                  );
                })}
              </div>

              {/* Description text of selected online package (No box / no frame) */}
              {selectedOnlineOption?.description && (
                <p className="text-xs leading-relaxed text-zinc-400 pt-0.5">
                  <span className="text-zinc-500">Mô tả gói: </span>
                  {selectedOnlineOption.description}
                </p>
              )}
            </div>

            {/* SEPARATED ACTION BUTTONS: Bản Online vs Bản Hộp Vật Lý */}
            <div className="space-y-3 pt-3 border-t border-zinc-800/80">
              {/* If user already has access to play this case, show prominently 'Vào chơi' */}
              {canPlay ? (
                <Link
                  href={`/play/${caseId}`}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-none bg-emerald-500 px-4 text-sm font-bold uppercase tracking-wider text-zinc-950 transition-colors hover:bg-emerald-400"
                >
                  <span>Vào chơi ngay</span>
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              ) : (
                <div>
                  <PlayButton
                    className="w-full rounded-none py-3 text-sm font-bold uppercase tracking-wider"
                    variant="primary"
                    disabled={!paymentsEnabled || pendingSku !== null}
                    onClick={() => selectedOnlineOption && buy(selectedOnlineOption.sku)}
                  >
                    {!paymentsEnabled
                      ? "Sắp mở bán trực tuyến"
                      : pendingSku === selectedOnlineOption?.sku
                        ? "Đang tạo đơn hàng PayOS…"
                        : loggedIn
                          ? `Mở khóa bản online ngay · ${formatVnd(selectedOnlineOption?.priceVnd || 0)}`
                          : "Đăng nhập để mua bản online"}
                  </PlayButton>
                  <PlayError>{buyError}</PlayError>
                </div>
              )}

              {/* Physical Box External Link Button */}
              <div>
                <a
                  href={boxOffer?.externalUrl || "https://shopee.vn"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-none border border-amber-500/40 bg-amber-500/10 px-4 text-sm font-bold uppercase tracking-wider text-amber-400 transition-colors hover:bg-amber-500/20 hover:border-amber-500"
                >
                  <span>Đặt hàng hộp vật lý (199.000₫)</span>
                  <ExternalLink className="size-4" aria-hidden />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Shopee-Style Reviews and Feedback */}
        <section id="reviews" className="mt-14 border-t border-zinc-800 pt-10">
          <div className="space-y-6">
            <h2 className="text-lg font-bold uppercase tracking-wider text-zinc-100">
              ĐÁNH GIÁ SẢN PHẨM
            </h2>

            {/* Rating Overview Box */}
            <div className="flex flex-col gap-6 rounded-none border border-zinc-800 bg-zinc-900/40 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <span className="font-mono text-4xl font-black text-amber-400">5.0</span>
                  <div className="flex text-amber-400 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="size-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1">trên 5 sao</span>
                </div>

                <div className="h-10 w-px bg-zinc-800 hidden sm:block" />

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
                      className={`rounded-none px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                        activeFilter === filter.id
                          ? "border border-amber-500 bg-amber-500/10 text-amber-400"
                          : "border border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Always-open Review Input Form */}
            <div className="rounded-none border border-zinc-800/80 bg-zinc-950/60 p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3">
                Viết đánh giá của bạn
              </h3>
              <form onSubmit={handleAddReview} className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="Tên thám tử / Biệt danh (tuỳ chọn)"
                    className="w-full rounded-none border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-amber-500/60 focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400">Đánh giá:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="p-0.5 hover:scale-110 transition-transform"
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
                  className="w-full rounded-none border border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-amber-500/60 focus:outline-none"
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
                    className="inline-flex items-center gap-1.5 rounded-none bg-amber-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-950 transition-colors hover:bg-amber-400 disabled:opacity-50"
                  >
                    <Send className="size-3" />
                    <span>Gửi đánh giá</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="border-b border-zinc-800/80 pb-5 pt-2"
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
                        <div className="mt-2 rounded-none border border-zinc-800/80 bg-zinc-950 p-2.5 text-[11px] leading-relaxed text-zinc-400">
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
                          className="flex items-center gap-1.5 text-[11px] text-zinc-500 transition-colors hover:text-zinc-300"
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
        <section className="mt-16 border-t border-zinc-800/60 pt-10">
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
              <div key={prod.id} className="group flex flex-col justify-between">
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

      {/* FULLSCREEN IMAGE LIGHTBOX MODAL (Cho phép zoom phóng đại ảnh hồ sơ) */}
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
              className="flex size-9 items-center justify-center rounded-none border border-zinc-700 bg-zinc-900/80 text-zinc-300 transition-colors hover:border-amber-500 hover:text-amber-400"
              title={zoomScale === 1 ? "Phóng đại 160%" : "Thu về 100%"}
            >
              {zoomScale === 1 ? <ZoomIn className="size-4" /> : <ZoomOut className="size-4" />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              className="flex size-9 items-center justify-center rounded-none border border-zinc-700 bg-zinc-900/80 text-zinc-300 transition-colors hover:border-red-500 hover:text-red-400"
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
                setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex size-10 items-center justify-center rounded-none border border-zinc-800 bg-zinc-900/80 text-zinc-300 transition-colors hover:border-amber-500 hover:text-amber-400 z-10"
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
                setActiveImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex size-10 items-center justify-center rounded-none border border-zinc-800 bg-zinc-900/80 text-zinc-300 transition-colors hover:border-amber-500 hover:text-amber-400 z-10"
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
