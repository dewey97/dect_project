import { notFound } from "next/navigation";
import { isValidCaseId, normalizeCaseId } from "@/lib/cases/case-id";
import { serverAllowsPlay } from "@/lib/payments/ownership";
import { CaseAccessGuard } from "@/components/store/case-access-guard";
import { BoardGameClient } from "./box-client";

export const dynamic = "force-dynamic";

/** Bàn đồng hành bản hộp: `/play/<case_id>/box`. Cùng cổng quyền chơi với /board. */
export default async function BoxPage({
  params,
  searchParams,
}: {
  params: Promise<{ caseId: string }>;
  searchParams: Promise<{ room?: string }>;
}) {
  const [{ caseId: raw }, query] = await Promise.all([params, searchParams]);
  if (!isValidCaseId(raw)) notFound();
  const caseId = normalizeCaseId(raw);
  const allowed = await serverAllowsPlay(caseId, query.room);

  return (
    <CaseAccessGuard caseId={caseId} allowed={allowed}>
      <BoardGameClient />
    </CaseAccessGuard>
  );
}
