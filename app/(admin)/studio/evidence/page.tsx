import type { Metadata } from "next";
import { normalizeCaseId } from "@/lib/cases/case-id";
import { getCases } from "@/lib/actions/case-actions";
import {
  getCaseEvidence,
  getCase360Config,
} from "@/lib/actions/evidence-actions";
import { EvidenceStudioClient } from "@/components/admin/evidence-studio/evidence-studio-client";
import type {
  DbCase,
  DbCaseEvidence,
  DbCaseWithEvidenceConfig,
} from "@/lib/types/database";

export const metadata: Metadata = {
  title: "Evidence Studio | Detective Case System",
  description:
    "Quản lý hồ sơ chứng cứ, tài liệu PDF, vật chứng ảnh hiện trường và không gian 360 theo vụ án",
};

export const dynamic = "force-dynamic";

export default async function EvidenceStudioPage({
  searchParams,
}: {
  searchParams: Promise<{ case?: string }>;
}) {
  const resolvedParams = await searchParams;
  const caseId = normalizeCaseId(resolvedParams.case || "case_000");

  const [casesRes, evidenceRes, config360Res] = await Promise.all([
    getCases(),
    getCaseEvidence(caseId),
    getCase360Config(caseId),
  ]);

  const cases = (
    casesRes.success && casesRes.data ? casesRes.data : []
  ) as DbCase[];
  const initialEvidence = (
    evidenceRes.success && evidenceRes.data ? evidenceRes.data : []
  ) as DbCaseEvidence[];
  const initial360 = (
    config360Res.success && config360Res.data ? config360Res.data : null
  ) as DbCaseWithEvidenceConfig | null;

  return (
    <EvidenceStudioClient
      initialCaseId={caseId}
      initialCases={cases}
      initialEvidence={initialEvidence}
      initial360Config={initial360}
    />
  );
}
