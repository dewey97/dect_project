import type { Metadata } from "next";
import { getCases } from "@/lib/actions/case-actions";
import {
  getCase360Config,
  getCaseEvidence,
} from "@/lib/actions/evidence-actions";
import { getReinvestigationHotspots } from "@/lib/actions/board-actions";
import { getStudioCaseId } from "@/lib/studio/active-case";
import { Scene360StudioClient } from "@/components/admin/scene-360-studio/scene-360-studio-client";

export const metadata: Metadata = {
  title: "Hiện Trường 360 | Detective Case System",
  description:
    "Ảnh cầu 360, panorama dự phòng và hotspot cho bước khám xét lại hiện trường",
};

export const dynamic = "force-dynamic";

export default async function Scene360StudioPage({
  searchParams,
}: {
  searchParams: Promise<{ case?: string }>;
}) {
  const caseId = await getStudioCaseId((await searchParams).case);
  const [casesRes, configRes, hotspotsRes, evidenceRes] = await Promise.all([
    getCases(),
    getCase360Config(caseId),
    getReinvestigationHotspots(caseId),
    getCaseEvidence(caseId),
  ]);

  return (
    <Scene360StudioClient
      key={caseId}
      caseId={caseId}
      cases={(casesRes.data || []).map((c) => ({
        slug: c.slug,
        title: c.title,
      }))}
      initialConfig={configRes.success ? (configRes.data ?? null) : null}
      initialHotspots={hotspotsRes.hotspots}
      evidence={evidenceRes.success ? (evidenceRes.data ?? []) : []}
    />
  );
}
