import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isValidCaseId, normalizeCaseId } from "@/lib/cases/case-id";
import { getAppBaseUrl, getPayosConfig } from "@/lib/payments/payos";
import { getOwnership, isPlayGatingEnabled } from "@/lib/payments/ownership";
import { CaseStore, type CaseOffer } from "@/components/store/case-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Vụ án" };

/**
 * Case page: the single door into a case from the landing page.
 * Shows ownership, the online packages (PayOS), the physical box (shop link +
 * code activation) and the "Vào chơi" button, locked while gating is on and
 * the visitor owns nothing. `?code=` pre-fills the box code (QR in the box).
 */
export default async function CasePage({
  params,
  searchParams,
}: {
  params: Promise<{ caseId: string }>;
  searchParams: Promise<{ code?: string }>;
}) {
  const [{ caseId: raw }, query] = await Promise.all([params, searchParams]);
  if (!isValidCaseId(raw)) notFound();
  const caseId = normalizeCaseId(raw);

  const supabase = await createClient();
  const { data: caseRow } = await supabase
    .from("cases")
    .select("slug, title, synopsis, cover_image_url")
    .eq("slug", caseId)
    .maybeSingle();
  if (!caseRow) notFound();

  const [{ data: offerRows }, { data: userData }] = await Promise.all([
    supabase
      .from("case_offers")
      .select(
        "sku, kind, title, description, price_vnd, group_credits, external_url, image_url",
      )
      .eq("case_id", caseId)
      .eq("active", true)
      .order("sort_order"),
    supabase.auth.getUser(),
  ]);

  const user = userData.user;
  const ownership = await getOwnership(user?.id, caseId);

  const offers: CaseOffer[] = (offerRows ?? []).map((row) => ({
    sku: row.sku,
    kind: row.kind === "box" ? "box" : "online",
    title: row.title,
    description: row.description ?? null,
    priceVnd: row.price_vnd,
    groupCredits: row.group_credits,
    externalUrl: row.external_url ?? null,
    imageUrl: row.image_url ?? null,
  }));

  return (
    <CaseStore
      caseId={caseId}
      caseTitle={caseRow.title}
      synopsis={caseRow.synopsis ?? null}
      coverImageUrl={caseRow.cover_image_url ?? null}
      offers={offers}
      loggedIn={Boolean(user)}
      ownership={ownership}
      paymentsEnabled={Boolean(getPayosConfig() && getAppBaseUrl())}
      gatingEnabled={isPlayGatingEnabled()}
      initialCode={
        typeof query.code === "string"
          ? query.code.slice(0, 20).toUpperCase()
          : ""
      }
    />
  );
}
