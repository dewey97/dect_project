import { normalizeCaseId } from "@/lib/cases/case-id";
import { serverAllowsPlay } from "@/lib/payments/ownership";
import { CaseAccessGuard } from "@/components/cases/case-access-guard";
import { BoardGameClient } from "./boardgame-client";

export const dynamic = "force-dynamic";

/** Bàn đồng hành bản hộp. Cùng cổng quyền chơi với /evidence/web. */
export default async function BoardGameCompanionPage({
  searchParams,
}: {
  searchParams: Promise<{ case_id?: string; caseId?: string; room?: string }>;
}) {
  const query = await searchParams;
  const caseId = normalizeCaseId(query.case_id || query.caseId || "case_000");
  const allowed = await serverAllowsPlay(caseId, query.room);

  return (
    <CaseAccessGuard caseId={caseId} allowed={allowed}>
      <BoardGameClient />
    </CaseAccessGuard>
  );
}
