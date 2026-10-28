import { redirect } from "next/navigation";
import { normalizeCaseId } from "@/lib/cases/case-id";

export const dynamic = "force-dynamic";

export default async function EvidenceStudioPage({
  searchParams,
}: {
  searchParams: Promise<{ case?: string }>;
}) {
  const resolvedParams = await searchParams;
  const caseId = normalizeCaseId(resolvedParams.case || "case_000");
  redirect(`/studio/dossier?case=${encodeURIComponent(caseId)}`);
}
