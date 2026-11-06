import { normalizeCaseId } from "@/lib/cases/case-id";
import { serverAllowsPlay } from "@/lib/payments/ownership";
import { CaseAccessGuard } from "@/components/store/case-access-guard";
import { WebEvidenceClient } from "./web-evidence-client";

export const dynamic = "force-dynamic";

/**
 * Bàn điều tra. Khi bật PLAY_GATING_ENABLED: chỉ người sở hữu vụ án, link có
 * `?room=`, hoặc thiết bị có phiên phòng của vụ này mới vào được; còn lại về
 * trang vụ án.
 */
export default async function WebEvidencePage({
  searchParams,
}: {
  searchParams: Promise<{ case_id?: string; caseId?: string; room?: string }>;
}) {
  const query = await searchParams;
  const caseId = normalizeCaseId(query.case_id || query.caseId || "case_000");
  const allowed = await serverAllowsPlay(caseId, query.room);

  return (
    <CaseAccessGuard caseId={caseId} allowed={allowed}>
      <WebEvidenceClient />
    </CaseAccessGuard>
  );
}
