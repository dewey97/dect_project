import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getOwnedCases } from "@/lib/payments/ownership";
import { CasesCollectionView } from "@/components/store/cases-collection-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bộ Sưu Tập Kỳ Án Trinh Thám | XPLORE",
  description:
    "Danh mục tất cả các bộ hồ sơ vụ án trinh thám chính thức của XPLORE.",
};

export default async function NarrativeCasesPage() {
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
