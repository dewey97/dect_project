import type { Metadata } from "next";
import { DossierStudioClient } from "@/components/admin/dossier-studio/dossier-studio-client";
import { getDossierDocuments } from "@/lib/actions/dossier-actions";
import { getCases } from "@/lib/actions/case-actions";
import {
  getCaseDossiers,
  getAllCaseDocumentsCatalog,
} from "@/lib/actions/dossier-config-actions";
import {
  getCaseEvidence,
  getCase360Config,
} from "@/lib/actions/evidence-actions";
import { normalizeCaseId } from "@/lib/cases/case-id";

export const metadata: Metadata = {
  title: "Hồ Sơ & Chứng Cứ Studio | Detective Case System",
  description:
    "Quản lý toàn diện hồ sơ tư pháp, lời khai, lý lịch, ảnh hiện trường và vật chứng trên một Canvas thống nhất",
};

export const dynamic = "force-dynamic";

export default async function DossierStudioPage({
  searchParams,
}: {
  searchParams: Promise<{ case?: string }>;
}) {
  const caseId = normalizeCaseId((await searchParams).case);
  const [
    lkRes,
    hsRes,
    casesRes,
    dossiersRes,
    catalogRes,
    evidenceRes,
    config360Res,
  ] = await Promise.all([
    getDossierDocuments(caseId, "loi_khai"),
    getDossierDocuments(caseId, "ly_lich"),
    getCases(),
    getCaseDossiers(caseId),
    getAllCaseDocumentsCatalog(caseId),
    getCaseEvidence(caseId),
    getCase360Config(caseId),
  ]);

  return (
    <DossierStudioClient
      initialCaseId={caseId}
      initialCases={casesRes.data || []}
      initialLkDocuments={lkRes.data || []}
      initialHsDocuments={hsRes.data || []}
      initialDossiers={dossiersRes || []}
      initialAvailableDocuments={catalogRes || []}
      initialEvidence={evidenceRes.data || []}
      initial360Config={config360Res.data || null}
    />
  );
}
