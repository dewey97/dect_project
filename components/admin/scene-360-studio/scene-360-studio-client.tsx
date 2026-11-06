"use client";

import { useRouter } from "next/navigation";
import { Rotate3d } from "lucide-react";
import { Scene360Editor } from "./scene-360-editor";
import { HotspotEditor } from "./hotspot-editor";
import type { ReinvestigateHotspotConfig } from "@/lib/actions/board-actions";
import type { DbCaseEvidence } from "@/lib/types/database";

interface Scene360StudioClientProps {
  caseId: string;
  cases: { slug: string; title: string }[];
  initialConfig: {
    panorama_url?: string | null;
    scene_360_url?: string | null;
  } | null;
  initialHotspots: ReinvestigateHotspotConfig[];
  evidence: DbCaseEvidence[];
}

/** Studio page "Hiện Trường 360": pick a case, edit its panorama sources. */
export function Scene360StudioClient({
  caseId,
  cases,
  initialConfig,
  initialHotspots,
  evidence,
}: Scene360StudioClientProps) {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
            <Rotate3d className="size-7 text-amber-400" />
            Hiện Trường 360
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Ảnh dùng cho bước khám xét lại hiện trường của người chơi.
          </p>
        </div>
        <span className="rounded-md border border-amber-500/25 bg-amber-500/10 px-3 py-1.5 text-sm text-amber-200">
          Case: {cases.find((c) => c.slug === caseId)?.title ?? caseId}
        </span>
      </header>

      <Scene360Editor
        key={caseId}
        caseId={caseId}
        initialConfig={initialConfig}
        onSave={() => router.refresh()}
      />

      <HotspotEditor
        caseId={caseId}
        imageUrl={initialConfig?.scene_360_url ?? null}
        fallbackImageUrl={initialConfig?.panorama_url ?? null}
        initialHotspots={initialHotspots}
        evidence={evidence}
      />
    </div>
  );
}
