import { redirect } from "next/navigation";
import { normalizeCaseId } from "@/lib/cases/case-id";

export const dynamic = "force-dynamic";

export default async function CharactersStudioPage({
  searchParams,
}: {
  searchParams: Promise<{ case?: string }>;
}) {
  const params = await searchParams;
  const caseId = params.case ? normalizeCaseId(params.case) : null;
  redirect(caseId ? `/studio/checkpoints?case=${caseId}` : "/studio/checkpoints");
}
