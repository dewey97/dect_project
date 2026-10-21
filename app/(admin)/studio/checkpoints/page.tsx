import type { Metadata } from "next";
import { CheckpointStudioClient } from "@/components/admin/checkpoint-studio/checkpoint-studio-client";
import { getCases } from "@/lib/actions/case-actions";
import { getCheckpointsByCase } from "@/lib/actions/checkpoint-actions";
import {
  getCaseDossiers,
  getAllCaseDocumentsCatalog,
} from "@/lib/actions/dossier-config-actions";
import { normalizeCaseId } from "@/lib/cases/case-id";

export const metadata: Metadata = {
  title: "Checkpoint Studio | Detective Case System",
  description:
    "Biên tập checkpoint, đáp án, gợi ý, narrative và cấu hình AI check trong Admin Studio",
};

export const dynamic = "force-dynamic";

export default async function CheckpointStudioPage({
  searchParams,
}: {
  searchParams: Promise<{ case?: string }>;
}) {
  const caseId = normalizeCaseId((await searchParams).case);
  const [casesResult, checkpointsResult, dossiers, availableDocs] =
    await Promise.all([
      getCases(),
      getCheckpointsByCase(caseId),
      getCaseDossiers(caseId),
      getAllCaseDocumentsCatalog(caseId),
    ]);

  return (
    <CheckpointStudioClient
      initialCaseId={caseId}
      initialCases={casesResult.data || []}
      initialRows={checkpointsResult.data || []}
      initialDossiers={dossiers}
      initialAvailableDocuments={availableDocs}
    />
  );
}
