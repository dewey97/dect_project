import type { Metadata } from "next";
import { getCases } from "@/lib/actions/case-actions";
import { getCase360Config } from "@/lib/actions/evidence-actions";
import { normalizeCaseId } from "@/lib/cases/case-id";
import { Scene360StudioClient } from "@/components/admin/scene-360-studio/scene-360-studio-client";

export const metadata: Metadata = {
  title: "Hiện Trường 360 | Detective Case System",
  description:
    "Ảnh cầu 360 và panorama dự phòng cho bước khám xét lại hiện trường",
};

export const dynamic = "force-dynamic";

export default async function Scene360StudioPage({
  searchParams,
}: {
  searchParams: Promise<{ case?: string }>;
}) {
  const caseId = normalizeCaseId((await searchParams).case);
  const [casesRes, configRes] = await Promise.all([
    getCases(),
    getCase360Config(caseId),
  ]);

  return (
    <Scene360StudioClient
      caseId={caseId}
      cases={(casesRes.data || []).map((c) => ({
        slug: c.slug,
        title: c.title,
      }))}
      initialConfig={configRes.success ? (configRes.data ?? null) : null}
    />
  );
}
