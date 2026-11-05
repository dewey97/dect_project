import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isValidCaseId, normalizeCaseId } from "@/lib/cases/case-id";
import { getAppBaseUrl, getPayosConfig } from "@/lib/payments/payos";
import { BuyOffers, type BuyOffer } from "@/components/buy/buy-offers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Mua vụ án" };

/**
 * Purchase page of a case. Online packages pay through PayOS; the box block
 * links to an external shop. Without PayOS keys the page still renders and
 * the pay buttons show "Sắp mở bán".
 */
export default async function BuyPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId: raw } = await params;
  if (!isValidCaseId(raw)) notFound();
  const caseId = normalizeCaseId(raw);

  const supabase = await createClient();
  const { data: caseRow } = await supabase
    .from("cases")
    .select("slug, title, synopsis")
    .eq("slug", caseId)
    .maybeSingle();
  if (!caseRow) notFound();

  const [{ data: offerRows }, { data: userData }] = await Promise.all([
    supabase
      .from("case_offers")
      .select(
        "sku, kind, title, description, price_vnd, group_credits, external_url",
      )
      .eq("case_id", caseId)
      .eq("active", true)
      .order("sort_order"),
    supabase.auth.getUser(),
  ]);

  const user = userData.user;
  let ownedCredits: number | null = null;
  if (user) {
    const { data: license } = await supabase
      .from("licenses")
      .select("group_credits")
      .eq("case_id", caseId)
      .eq("user_id", user.id)
      .maybeSingle();
    ownedCredits = license ? license.group_credits : null;
  }

  const offers: BuyOffer[] = (offerRows ?? []).map((row) => ({
    sku: row.sku,
    kind: row.kind === "box" ? "box" : "online",
    title: row.title,
    description: row.description ?? null,
    priceVnd: row.price_vnd,
    groupCredits: row.group_credits,
    externalUrl: row.external_url ?? null,
  }));

  return (
    <BuyOffers
      caseId={caseId}
      caseTitle={caseRow.title}
      synopsis={caseRow.synopsis ?? null}
      offers={offers}
      loggedIn={Boolean(user)}
      ownedCredits={ownedCredits}
      paymentsEnabled={Boolean(getPayosConfig() && getAppBaseUrl())}
    />
  );
}
