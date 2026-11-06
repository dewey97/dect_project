"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import {
  Crosshair,
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";
import {
  saveReinvestigationHotspots,
  type ReinvestigateHotspotConfig,
} from "@/lib/actions/board-actions";
import type { DbCaseEvidence } from "@/lib/types/database";
import { Scene360Viewer } from "@/components/investigation/scene-360-viewer";
import { toast } from "@/components/ui/toast";
import { cn, normalizeImageUrl } from "@/lib/utils";

type Spot = ReinvestigateHotspotConfig;

const DEFAULT_SOUND = "sat_soat.mp3";
const input =
  "h-8 w-full rounded border border-zinc-800 bg-zinc-950 px-2.5 text-xs text-zinc-200 focus:border-amber-500 focus:outline-none";
const label = "space-y-1 text-[11px] font-medium text-zinc-400";

const clamp = (v: number) =>
  Math.round(Math.min(100, Math.max(0, v)) * 10) / 10;
const renumber = (list: Spot[]) => list.map((s, i) => ({ ...s, num: i + 1 }));

/**
 * Hotspots of the crime-scene revisit, placed on the flat 360 image.
 * x / y are percentages of that image, the same values Scene360Viewer maps to
 * yaw / pitch. Click the image to add a spot, drag a marker to move it.
 */
export function HotspotEditor({
  caseId,
  imageUrl,
  fallbackImageUrl,
  initialHotspots,
  evidence,
}: {
  caseId: string;
  imageUrl: string | null;
  fallbackImageUrl: string | null;
  initialHotspots: Spot[];
  evidence: DbCaseEvidence[];
}) {
  const [spots, setSpots] = useState<Spot[]>(initialHotspots);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialHotspots[0]?.id ?? null,
  );
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const dragIdRef = useRef<string | null>(null);
  const movedRef = useRef(false);

  // Same fallback as Scene360Viewer: the panorama when the 360 image fails.
  const [flatImage, setFlatImage] = useState(imageUrl || fallbackImageUrl);
  const usingFallback = Boolean(imageUrl && flatImage !== imageUrl);
  const imgRef = useRef<HTMLImageElement>(null);
  const useFallback = () => {
    if (fallbackImageUrl && flatImage !== fallbackImageUrl) setFlatImage(fallbackImageUrl);
  };
  // The image can fail before hydration, when onError is not attached yet.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth === 0) useFallback();
  });
  const photos = evidence.filter(
    (e) => e.file_url && (e.kind === "photo" || e.kind === "image"),
  );

  const change = (next: Spot[]) => {
    setSpots(next);
    setDirty(true);
  };
  const update = (id: string, patch: Partial<Spot>) =>
    change(spots.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const pointToPercent = (e: { clientX: number; clientY: number }) => {
    const rect = surfaceRef.current!.getBoundingClientRect();
    return {
      x: clamp(((e.clientX - rect.left) / rect.width) * 100),
      y: clamp(((e.clientY - rect.top) / rect.height) * 100),
    };
  };

  const addAt = (x: number, y: number) => {
    const spot: Spot = {
      id: `spot-${Date.now().toString(36)}`,
      num: spots.length + 1,
      title: `Điểm #${spots.length + 1}`,
      x,
      y,
      imageUrl: "",
      soundFile: DEFAULT_SOUND,
      soundCaption: "*Sột soạt...*",
    };
    change([...spots, spot]);
    setSelectedId(spot.id);
  };

  const remove = (id: string) => {
    change(renumber(spots.filter((s) => s.id !== id)));
    if (selectedId === id) setSelectedId(null);
  };

  // Click on empty image: add a spot. Drag a marker: move it.
  const onSurfaceClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }
    const { x, y } = pointToPercent(e);
    addAt(x, y);
  };
  const onMarkerDown = (e: PointerEvent, id: string) => {
    e.stopPropagation();
    dragIdRef.current = id;
    movedRef.current = false;
    setSelectedId(id);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onSurfaceMove = (e: PointerEvent) => {
    if (!dragIdRef.current) return;
    movedRef.current = true;
    update(dragIdRef.current, pointToPercent(e));
  };
  const onSurfaceUp = () => {
    dragIdRef.current = null;
    movedRef.current = false;
  };

  const pickEvidence = (id: string, code: string) => {
    const ev = photos.find((p) => p.code === code);
    if (!ev) {
      update(id, { photoId: undefined });
      return;
    }
    update(id, {
      photoId: ev.code,
      // Drive share links become proxy URLs, as gameplay does.
      imageUrl: normalizeImageUrl(ev.file_url || ""),
      driveUrl: ev.file_url?.includes("drive.google.com") ? ev.file_url : undefined,
      title: ev.title || undefined,
    });
  };

  const save = async () => {
    setSaving(true);
    const res = await saveReinvestigationHotspots(caseId, renumber(spots));
    setSaving(false);
    if (res.success) {
      setDirty(false);
      toast.success("Đã lưu hotspot khám xét");
    } else {
      toast.error(res.error || "Lưu hotspot thất bại");
    }
  };

  const selected = spots.find((s) => s.id === selectedId) ?? null;

  return (
    <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
            <Crosshair className="size-4 text-amber-400" />
            Hotspot khám xét ({spots.length})
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Bấm lên ảnh để thêm điểm, kéo điểm để dời. Người chơi bấm vào điểm
            sẽ thấy ảnh vật chứng và nghe âm thanh.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPreview((v) => !v)}
            disabled={!flatImage}
            className="flex h-9 items-center gap-1.5 rounded border border-zinc-700 bg-zinc-800 px-3 text-xs text-zinc-200 hover:bg-zinc-700 disabled:opacity-50"
          >
            {preview ? (
              <EyeOff className="size-3.5" />
            ) : (
              <Eye className="size-3.5" />
            )}
            {preview ? "Về ảnh phẳng" : "Xem thử 360"}
          </button>
          <button
            type="button"
            onClick={() => addAt(50, 50)}
            className="flex h-9 items-center gap-1.5 rounded border border-zinc-700 bg-zinc-800 px-3 text-xs text-zinc-200 hover:bg-zinc-700"
          >
            <Plus className="size-3.5" /> Thêm điểm
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving || !dirty}
            className="flex h-9 items-center gap-1.5 rounded bg-amber-600 px-3 text-xs font-medium text-white hover:bg-amber-500 disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            {dirty ? "Lưu hotspot" : "Đã lưu"}
          </button>
        </div>
      </div>

      {usingFallback && (
        <p className="text-xs text-amber-300">
          Không tải được ảnh 360 ({imageUrl}), đang hiện ảnh panorama. Kiểm tra lại đường dẫn ảnh 360 ở trên.
        </p>
      )}

      {!flatImage ? (
        <p className="rounded-lg border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-500">
          Thêm ảnh 360 hoặc panorama ở trên rồi lưu, sau đó đặt hotspot.
        </p>
      ) : preview ? (
        <div className="relative h-[420px] w-full overflow-hidden rounded-lg border border-zinc-800 bg-black">
          <Scene360Viewer
            imageUrl={imageUrl || undefined}
            fallbackImageUrl={fallbackImageUrl || undefined}
            hotspots={spots}
          />
        </div>
      ) : (
        <div
          ref={surfaceRef}
          onClick={onSurfaceClick}
          onPointerMove={onSurfaceMove}
          onPointerUp={onSurfaceUp}
          className="relative aspect-[2/1] w-full cursor-crosshair touch-none select-none overflow-hidden rounded-lg border border-zinc-800 bg-black"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={flatImage}
            alt="Ảnh hiện trường trải phẳng"
            draggable={false}
            ref={imgRef}
            onError={useFallback}
            className="pointer-events-none size-full object-fill"
          />
          {spots.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Hotspot ${s.num}: ${s.title || ""}`}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => onMarkerDown(e, s.id)}
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
              className={cn(
                "absolute flex size-7 -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center rounded-full border-2 text-[11px] font-bold shadow-lg active:cursor-grabbing",
                s.id === selectedId
                  ? "border-white bg-amber-500 text-zinc-950"
                  : "border-amber-300/80 bg-black/70 text-amber-200",
              )}
            >
              {s.num}
            </button>
          ))}
        </div>
      )}

      {spots.length > 0 && (
        <div className="grid gap-4 md:grid-cols-[12rem_1fr]">
          <ul className="space-y-1">
            {spots.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(s.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs",
                    s.id === selectedId
                      ? "bg-amber-500/15 text-amber-200"
                      : "text-zinc-300 hover:bg-zinc-800",
                  )}
                >
                  <span className="font-mono text-zinc-500">#{s.num}</span>
                  <span className="truncate">{s.title || "Chưa đặt tên"}</span>
                </button>
              </li>
            ))}
          </ul>

          {selected ? (
            <div className="grid gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 sm:grid-cols-2">
              <label className={label}>
                <span>Tên điểm</span>
                <input
                  className={input}
                  value={selected.title || ""}
                  onChange={(e) =>
                    update(selected.id, { title: e.target.value })
                  }
                />
              </label>
              <label className={label}>
                <span>Vật chứng (lấy ảnh và tên)</span>
                <select
                  className={input}
                  value={selected.photoId || ""}
                  onChange={(e) => pickEvidence(selected.id, e.target.value)}
                >
                  <option value="">Không gắn vật chứng</option>
                  {selected.photoId &&
                    !photos.some((p) => p.code === selected.photoId) && (
                      <option value={selected.photoId}>
                        {selected.photoId} (không có trong vật chứng)
                      </option>
                    )}
                  {photos.map((p) => (
                    <option key={p.id} value={p.code}>
                      {p.code} · {p.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className={`${label} sm:col-span-2`}>
                <span>Ảnh hiện ra khi bấm (URL)</span>
                <input
                  className={input}
                  value={selected.imageUrl}
                  onChange={(e) =>
                    update(selected.id, { imageUrl: e.target.value })
                  }
                />
              </label>
              <label className={label}>
                <span>Âm thanh (tên file trong public/audio)</span>
                <input
                  className={input}
                  value={selected.soundFile}
                  onChange={(e) =>
                    update(selected.id, { soundFile: e.target.value })
                  }
                />
              </label>
              <label className={label}>
                <span>Chú thích âm thanh</span>
                <input
                  className={input}
                  value={selected.soundCaption}
                  onChange={(e) =>
                    update(selected.id, { soundCaption: e.target.value })
                  }
                />
              </label>
              <div className="flex items-center justify-between sm:col-span-2">
                <span className="font-mono text-[11px] text-zinc-500">
                  Vị trí: {selected.x}% ngang · {selected.y}% dọc
                </span>
                <button
                  type="button"
                  onClick={() => remove(selected.id)}
                  className="flex h-8 items-center gap-1.5 rounded px-2.5 text-xs text-red-300 hover:bg-red-950/40"
                >
                  <Trash2 className="size-3.5" /> Xóa điểm
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-500">Chọn một điểm để sửa.</p>
          )}
        </div>
      )}
    </section>
  );
}
