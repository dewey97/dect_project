"use client";

import { useParams } from "next/navigation";
import { normalizeCaseId } from "@/lib/cases/case-id";

/** case_id của route chơi `/play/[caseId]/...`, đã chuẩn hóa. */
export function usePlayCaseId(): string {
  const params = useParams<{ caseId?: string }>();
  return normalizeCaseId(params?.caseId);
}
