import type { Metadata } from "next";
import { CharactersStudioClient } from "@/components/admin/character-studio/characters-studio-client";
import { getCases } from "@/lib/actions/case-actions";
import { getCharactersByCase } from "@/lib/actions/character-actions";
import { normalizeCaseId } from "@/lib/cases/case-id";

export const metadata: Metadata = {
  title: "Nhân vật | Detective Case System",
  description:
    "Quản lý nhân vật, nạn nhân, nghi phạm và số điện thoại theo từng vụ án",
};

export const dynamic = "force-dynamic";

export default async function CharactersStudioPage({
  searchParams,
}: {
  searchParams: Promise<{ case?: string }>;
}) {
  const caseId = normalizeCaseId((await searchParams).case);
  const [casesResult, charactersResult] = await Promise.all([
    getCases(),
    getCharactersByCase(caseId),
  ]);

  return (
    <CharactersStudioClient
      key={caseId}
      initialCaseId={caseId}
      cases={casesResult.data || []}
      initialCharacters={charactersResult.data}
      loadError={charactersResult.error}
    />
  );
}
