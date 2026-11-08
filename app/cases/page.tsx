import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getOwnedCases, NOT_OWNED } from "@/lib/payments/ownership";
import { OwnershipBadge } from "@/components/store/ownership-badge";
import { PlayLabel } from "@/components/play/play-ui";
import { SafeImg } from "@/components/ui/safe-img";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Các vụ án" };

/** Published cases with the visitor's ownership. Each card opens /cases/<slug>. */
export default async function CasesIndexPage() {
  const supabase = await createClient();
  const [{ data: cases }, { data: userData }] = await Promise.all([
    supabase
      .from("cases")
      .select("slug, title, synopsis, cover_image_url")
      .eq("status", "PUBLISHED")
      .order("slug"),
    supabase.auth.getUser(),
  ]);
  const owned = await getOwnedCases(userData.user?.id);

  return (
    <div className="min-h-dvh w-full bg-[#0d0c0a] text-zinc-100">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:py-10">
        <header className="space-y-1">
          <PlayLabel>Kho hồ sơ</PlayLabel>
          <h1 className="text-3xl font-bold text-zinc-50">Các vụ án</h1>
        </header>

        {(cases ?? []).length === 0 ? (
          <p className="text-sm text-zinc-400">Chưa có vụ án nào mở bán.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {(cases ?? []).map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/cases/${c.slug}`}
                  className="flex h-full gap-4 rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 transition-colors hover:border-zinc-600 focus-visible:outline-2 focus-visible:outline-amber-400"
                >
                  {c.cover_image_url && (
                    <SafeImg
                      src={c.cover_image_url}
                      alt=""
                      className="aspect-[1/1.414] w-20 shrink-0 rounded-md border border-zinc-800 object-cover"
                    />
                  )}
                  <div className="min-w-0 space-y-2">
                    <h2 className="text-lg font-bold text-zinc-50">
                      {c.title}
                    </h2>
                    <OwnershipBadge ownership={owned[c.slug] ?? NOT_OWNED} />
                    {c.synopsis && (
                      <p className="line-clamp-3 text-sm text-zinc-400">
                        {c.synopsis}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <Link
          href="/"
          className="self-center px-3 py-3 text-sm text-zinc-500 hover:text-zinc-300"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
