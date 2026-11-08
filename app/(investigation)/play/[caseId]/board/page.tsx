import { notFound } from "next/navigation";
import { isValidCaseId, normalizeCaseId } from "@/lib/cases/case-id";
import { serverAllowsPlay } from "@/lib/payments/ownership";
import { CaseAccessGuard } from "@/components/store/case-access-guard";
import { WebEvidenceClient } from "./board-client";

export const dynamic = "force-dynamic";

/**
 * Bàn điều tra online: `/play/<case_id>/board[?room=CODE]`.
 * Khi bật PLAY_GATING_ENABLED: chỉ người sở hữu vụ án, link có `?room=`,
 * hoặc thiết bị có phiên phòng của vụ này mới vào được; còn lại về trang vụ án.
 */
export default async function BoardPage({
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
      <WebEvidenceClient />
    </CaseAccessGuard>
  );
}
