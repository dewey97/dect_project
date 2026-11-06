"use client";

import { useRouter } from "next/navigation";
import { Rotate3d } from "lucide-react";
import { Scene360Editor } from "./scene-360-editor";

interface Scene360StudioClientProps {
  caseId: string;
  cases: { slug: string; title: string }[];
  initialConfig: {
    panorama_url?: string | null;
    scene_360_url?: string | null;
  } | null;
}

/** Studio page "Hiện Trường 360": pick a case, edit its panorama sources. */
export function Scene360StudioClient({
  caseId,
  cases,
  initialConfig,
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
        <label className="space-y-1 text-xs font-medium text-zinc-400">
          <span>Vụ án</span>
          <select
            value={caseId}
            onChange={(e) =>
              router.push(
                `/studio/scene-360?case=${encodeURIComponent(e.target.value)}`,
              )
            }
            className="h-9 min-w-56 rounded-md border border-white/10 bg-zinc-900/60 px-2.5 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none"
          >
            {cases.length === 0 && <option value={caseId}>{caseId}</option>}
            {cases.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
      </header>

      <Scene360Editor
        key={caseId}
        caseId={caseId}
        initialConfig={initialConfig}
        onSave={() => router.refresh()}
      />
    </div>
  );
}
