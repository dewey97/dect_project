"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Search, ArrowRight, FolderArchive, Lock } from "lucide-react";
import { SafeImg } from "@/components/ui/safe-img";
import { LandingNavbar } from "@/components/public/landing-navbar";
import { LandingFooter } from "@/components/public/landing-footer";
import type { CaseOwnership } from "@/components/store/case-store";

export interface DbCaseRow {
  slug: string;
  title: string;
  synopsis: string | null;
  cover_image_url: string | null;
  status?: string;
}

export interface CatalogItem {
  id: string;
  slug?: string;
  code: string;
  title: string;
  tagline: string;
  synopsis: string;
  coverImage: string;
  status: "AVAILABLE" | "COMING_SOON" | "LOCKED";
  statusLabel: string;
  isMystery?: boolean;
}

const STATIC_CATALOG: CatalogItem[] = [
  {
    id: "case-000",
    slug: "case_000",
    code: "CASE #000",
    title: "Vụ Án Trốn Tìm",
    tagline: "Án mạng phòng kín · Hà Nội 1998",
    synopsis:
      "Vụ án phòng kín rúng động Hà Nội 1998. Nạn nhân tử vong bất thường với then gỗ khóa trái, hiện trường không dấu vết đột nhập.",
    coverImage: "/poster_c0.webp",
    status: "AVAILABLE",
    statusLabel: "Đang mở điều tra",
  },
  {
    id: "case-001",
    code: "CASE #001",
    title: "Hồ Sơ Mật Phân Khu 2",
    tagline: "Tài liệu chưa giải mật",
    synopsis:
      "Dữ liệu hiện trường và lời khai các bên liên quan đang trong quá trình niêm phong bảo mật của ban chuyên án.",
    coverImage: "/images/landing/poster_classified.png",
    status: "COMING_SOON",
    statusLabel: "Sắp ra mắt",
    isMystery: true,
  },
  {
    id: "case-002",
    code: "CASE #002",
    title: "Hồ Sơ Mật Phân Khu 3",
    tagline: "Tài liệu chưa giải mật",
    synopsis:
      "Chuyên án đặc biệt đang được ban chuyên án hoàn thiện hồ sơ pháp y, lời khai nhân chứng và chuỗi tang vật.",
    coverImage: "/images/landing/poster_classified.png",
    status: "COMING_SOON",
    statusLabel: "Sắp ra mắt",
    isMystery: true,
  },
  {
    id: "case-003",
    code: "CASE #003",
    title: "Hồ Sơ Mật Phân Khu 4",
    tagline: "Tài liệu chưa giải mật",
    synopsis:
      "Tập tài liệu tuyệt mật đang chờ quyết định giải tỏa niêm phong lưu trữ từ hội đồng điều tra.",
    coverImage: "/images/landing/poster_classified.png",
    status: "COMING_SOON",
    statusLabel: "Sắp ra mắt",
    isMystery: true,
  },
  {
    id: "case-004",
    code: "CASE #004",
    title: "Hồ Sơ Mật Phân Khu 5",
    tagline: "Tài liệu chưa giải mật",
    synopsis:
      "Hồ sơ kỳ án mới đang được thu thập manh mối, giải mã ghi âm và tài liệu khám nghiệm thực địa.",
    coverImage: "/images/landing/poster_classified.png",
    status: "COMING_SOON",
    statusLabel: "Sắp ra mắt",
    isMystery: true,
  },
];

export function CasesCollectionView({
  dbCases = [],
  ownedMap = {},
  loggedIn = false,
}: {
  dbCases?: DbCaseRow[];
  ownedMap?: Record<string, CaseOwnership>;
  loggedIn?: boolean;
}) {
  const catalog = useMemo(() => {
    const items = [...STATIC_CATALOG];
    dbCases.forEach((dbCase) => {
      const existing = items.find((it) => it.slug === dbCase.slug);
      if (existing) {
        if (dbCase.title) existing.title = dbCase.title;
        if (dbCase.synopsis) existing.synopsis = dbCase.synopsis;
        // Chỉ nhận cover image từ DB nếu hợp lệ và không chứa ảnh 360 bị lỗi
        if (
          dbCase.cover_image_url &&
          !dbCase.cover_image_url.includes("crime_scene_360") &&
          dbCase.cover_image_url.trim() !== ""
        ) {
          existing.coverImage = dbCase.cover_image_url;
        } else if (existing.slug === "case_000") {
          existing.coverImage = "/poster_c0.webp";
        }
      }
    });
    return items;
  }, [dbCases]);

  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  // Main navigation: "ALL" (Tất cả vụ án) vs "MY_CASES" (Kho của bạn)
  const [mainView, setMainView] = useState<"ALL" | "MY_CASES">(
    tabParam === "my_cases" ? "MY_CASES" : "ALL"
  );
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (tabParam === "my_cases") {
      setMainView("MY_CASES");
    }
  }, [tabParam]);

  // Count owned cases
  const ownedItems = useMemo(() => {
    return catalog.filter((item) => {
      if (!item.slug) return false;
      const own = ownedMap[item.slug];
      return Boolean(own?.online || own?.box);
    });
  }, [catalog, ownedMap]);

  const filteredItems = useMemo(() => {
    if (mainView === "MY_CASES") {
      if (!searchQuery.trim()) return ownedItems;
      const q = searchQuery.toLowerCase();
      return ownedItems.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.code.toLowerCase().includes(q) ||
          item.synopsis.toLowerCase().includes(q)
      );
    }

    return catalog.filter((item) => {
      if (activeCategory === "AVAILABLE" && item.status !== "AVAILABLE") return false;
      if (activeCategory === "COMING_SOON" && item.status !== "COMING_SOON") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          item.title.toLowerCase().includes(q) ||
          item.code.toLowerCase().includes(q) ||
          item.synopsis.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [catalog, ownedItems, mainView, activeCategory, searchQuery]);

  return (
    <div className="min-h-dvh w-full flex flex-col justify-between bg-background text-foreground font-sans antialiased selection:bg-amber-500 selection:text-zinc-950">
      {/* Sticky Top Header Nav Synced 100% across the platform */}
      <LandingNavbar active="cases" />

      {/* Hero Header & Dual Tabs (TẤT CẢ VỤ ÁN vs KHO CỦA BẠN - Clean Minimal, No line, No subtext) */}
      <div className="mx-auto w-full max-w-6xl px-4 pt-10 pb-4 sm:px-6 sm:pt-14 sm:pb-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl">
              {mainView === "ALL" ? "TẤT CẢ VỤ ÁN" : "KHO CỦA BẠN"}
            </h1>
          </div>

          {/* Top Section View Tabs */}
          <div className="inline-flex rounded-none border border-zinc-800 bg-zinc-900/60 p-1">
            <button
              type="button"
              onClick={() => setMainView("ALL")}
              className={`rounded-none px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                mainView === "ALL"
                  ? "bg-amber-500 text-zinc-950 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Tất cả vụ án
            </button>
            <button
              type="button"
              onClick={() => setMainView("MY_CASES")}
              className={`inline-flex items-center gap-1.5 rounded-none px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                mainView === "MY_CASES"
                  ? "bg-amber-500 text-zinc-950 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <FolderArchive className="size-3.5" />
              <span>Kho của bạn</span>
              {ownedItems.length > 0 && (
                <span className="ml-1 rounded-full bg-zinc-950 px-1.5 py-0.2 text-[10px] font-mono text-amber-400">
                  {ownedItems.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 sm:px-6">
        {/* Sub-Filters Toolbar */}
        <div className="mb-8 flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
          {/* Sub-Tabs for "Tất cả vụ án" */}
          {mainView === "ALL" ? (
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {[
                { id: "ALL", label: "Tất cả" },
                { id: "AVAILABLE", label: "Đang mở" },
                { id: "COMING_SOON", label: "Sắp ra mắt" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id)}
                  className={`rounded-none px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    activeCategory === tab.id
                      ? "bg-zinc-800 text-amber-400"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-xs font-mono text-muted-foreground">
              {loggedIn ? `Hồ sơ đã kích hoạt: ${ownedItems.length}` : "Chưa đăng nhập"}
            </div>
          )}

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Tìm hồ sơ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-40 rounded-none bg-zinc-900/60 py-1.5 pl-7 pr-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none sm:w-56"
            />
          </div>
        </div>

        {/* View when in MY_CASES and not logged in (No border, clean minimal) */}
        {mainView === "MY_CASES" && !loggedIn ? (
          <div className="my-14 flex flex-col items-center justify-center p-6 text-center">
            <Lock className="size-10 text-amber-400 mb-3" />
            <h2 className="text-lg font-bold uppercase text-zinc-200">
              Đăng nhập để xem kho hồ sơ của bạn
            </h2>
            <p className="mt-1 max-w-md text-xs text-zinc-400 leading-relaxed font-mono">
              Kho của bạn lưu trữ tất cả các chuyên án bạn đã mua bản quyền hoặc kích hoạt mã hộp vật lý.
            </p>
            <Link
              href="/login?redirect=/cases"
              className="mt-5 inline-flex items-center gap-2 rounded-none bg-amber-500 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-950 transition-colors hover:bg-amber-400"
            >
              <span>Đăng nhập ngay</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        ) : mainView === "MY_CASES" && ownedItems.length === 0 ? (
          <div className="my-14 flex flex-col items-center justify-center p-6 text-center">
            <FolderArchive className="size-10 text-zinc-600 mb-3" />
            <h2 className="text-lg font-bold uppercase text-zinc-200">
              Kho của bạn hiện đang trống
            </h2>
            <p className="mt-1 max-w-md text-xs text-zinc-400 leading-relaxed font-mono">
              Bạn chưa sở hữu hồ sơ vụ án nào. Hãy chọn một kỳ án đang mở điều tra để bắt đầu hành trình phá án!
            </p>
            <button
              type="button"
              onClick={() => setMainView("ALL")}
              className="mt-5 inline-flex items-center gap-2 rounded-none bg-amber-500 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-950 transition-colors hover:bg-amber-400"
            >
              <span>Xem danh sách vụ án</span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center text-xs text-zinc-500">
            Không tìm thấy hồ sơ phù hợp.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {filteredItems.map((item) => {
              const isOwned = item.slug ? Boolean(ownedMap[item.slug]?.online || ownedMap[item.slug]?.box) : false;

              const cardContent = (
                <article className="group flex flex-col justify-between cursor-pointer">
                  <div>
                    {/* A4 Poster Aspect Ratio (1 / 1.414) */}
                    <div className="relative aspect-[1/1.414] w-full overflow-hidden bg-zinc-950">
                      <SafeImg
                        src={item.coverImage}
                        fallbackSrc="/poster_c0.webp"
                        alt={item.title}
                        className="h-full w-full rounded-none object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Status label overlay */}
                      <div className="absolute left-2 top-2 z-10">
                        <span
                          className={`px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${
                            item.status === "AVAILABLE"
                              ? "bg-amber-500 text-zinc-950"
                              : "bg-black/80 text-zinc-300"
                          }`}
                        >
                          {item.statusLabel}
                        </span>
                      </div>

                      {/* Owned badge */}
                      {isOwned && (
                        <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1 bg-emerald-950/90 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400">
                          <CheckCircle2 className="size-2.5" /> Đã sở hữu
                        </div>
                      )}
                    </div>

                    {/* Information (Clear, concise, no truncation, no rating, no button, no price) */}
                    <div className="mt-3 space-y-1">
                      <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                        {item.code}
                      </div>

                      <h2 className="text-sm font-bold uppercase text-zinc-100 group-hover:text-amber-400 transition-colors">
                        {item.title}
                      </h2>

                      <p className="text-xs leading-relaxed text-zinc-400">
                        {item.synopsis}
                      </p>

                      {/* Quick play link if owned and in MY_CASES */}
                      {mainView === "MY_CASES" && item.slug && (
                        <div className="pt-2">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300">
                            Vào bàn điều tra →
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );

              return item.slug ? (
                <Link
                  key={item.id}
                  href={mainView === "MY_CASES" && isOwned ? `/play/${item.slug}` : `/cases/${item.slug}`}
                  className="block"
                >
                  {cardContent}
                </Link>
              ) : (
                <div key={item.id} className="block">
                  {cardContent}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Synced Landing Page Footer */}
      <LandingFooter />
    </div>
  );
}
