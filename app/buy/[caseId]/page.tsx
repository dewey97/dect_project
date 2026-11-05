import { permanentRedirect } from "next/navigation";
import { isValidCaseId, normalizeCaseId } from "@/lib/cases/case-id";
import { notFound } from "next/navigation";

/** Old purchase URL. The case page /cases/<case_id> now holds the offers. */
export default async function BuyRedirect({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  if (!isValidCaseId(caseId)) notFound();
  permanentRedirect(`/cases/${normalizeCaseId(caseId)}#online`);
}
