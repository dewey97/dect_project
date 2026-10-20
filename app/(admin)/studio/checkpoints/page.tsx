import type { Metadata } from "next";
import { CheckpointStudioClient } from "@/components/admin/checkpoint-studio/checkpoint-studio-client";
import { getCases } from "@/lib/actions/case-actions";
import { getCheckpointsByCase } from "@/lib/actions/checkpoint-actions";

export const metadata: Metadata = {
  title: "Checkpoint Studio | Detective Case System",
  description:
    "Biên tập checkpoint, đáp án, gợi ý, narrative và cấu hình AI check trong Admin Studio",
};

export const dynamic = "force-dynamic";

export default async function CheckpointStudioPage() {
  const [casesResult, checkpointsResult] = await Promise.all([
    getCases(),
    getCheckpointsByCase("case_000"),
  ]);

  return (
    <CheckpointStudioClient
      initialCaseId="case_000"
      initialCases={casesResult.data || []}
      initialRows={checkpointsResult.data || []}
    />
  );
}
