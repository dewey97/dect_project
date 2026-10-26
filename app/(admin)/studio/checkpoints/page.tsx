import type { Metadata } from "next";
import { CheckpointStudioClient } from "@/components/admin/checkpoint-studio/checkpoint-studio-client";
import { getCases } from "@/lib/actions/case-actions";
import { getCheckpointsByCase } from "@/lib/actions/checkpoint-actions";
import { getCharactersByCase } from "@/lib/actions/character-actions";
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
  searchParams: Promise<{ case?: string; view?: string }>;
}) {
  const sp = await searchParams;
  const caseId = normalizeCaseId(sp.case);
  const initialView = sp.view === "board" ? "board" : "flow";
  const [casesResult, checkpointsResult, dossiers, availableDocs, charactersResult] =
    await Promise.all([
      getCases(),
      getCheckpointsByCase(caseId),
      getCaseDossiers(caseId),
      getAllCaseDocumentsCatalog(caseId),
      getCharactersByCase(caseId),
    ]);

  const initialCharacters = (charactersResult.data || []).map((c) => ({
    id: c.id,
    case_slug: c.case_slug,
    key: c.key,
    name: c.name,
    role: c.role,
    avatar_url: c.avatar_url,
  })) as typeof charactersResult.data;

  return (
    <CheckpointStudioClient
      initialCaseId={caseId}
      initialView={initialView}
      initialCases={casesResult.data || []}
      initialRows={checkpointsResult.data || []}
      initialDossiers={dossiers}
      initialAvailableDocuments={availableDocs}
      initialCharacters={initialCharacters || []}
    />
  );
}
