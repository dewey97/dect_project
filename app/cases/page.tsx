import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getOwnedCases } from "@/lib/payments/ownership";
import { CasesCollectionView } from "@/components/store/cases-collection-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kho Hồ Sơ Vụ Án | XPLORE",
  description:
    "Khám phá các kỳ án trinh thám độc quyền của XPLORE. Hồ sơ giấy thật, hiện trường 360 độ và điện thoại tang vật.",
};

/** Narrative cases collection page (Hunt A Killer inspired). */
export default async function CasesIndexPage() {
  const supabase = await createClient();
  const [{ data: cases }, { data: userData }] = await Promise.all([
    supabase
      .from("cases")
      .select("slug, title, synopsis, cover_image_url, status")
      .order("slug"),
    supabase.auth.getUser(),
  ]);
  const user = userData.user;
  const owned = await getOwnedCases(user?.id);

  return (
    <CasesCollectionView
      dbCases={cases ?? []}
      ownedMap={owned}
      loggedIn={Boolean(user)}
    />
  );
}
