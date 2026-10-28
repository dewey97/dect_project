"use client";

import { parseRuntimeHints } from "@/lib/cms/checkpoint-runtime";
import type { PublicCheckpointRow } from "@/lib/checkpoints/public-checkpoint";
import { getStorageItem } from "@/lib/storage";
import { caseStorageKey } from "@/lib/cases/case-id";
import { getActiveCaseId } from "@/lib/cases/case-characters";

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkpointId?: string;
  category?: "motive" | "contradiction" | "all";
  caseId?: string;
}

export interface CheckpointGroupData {
  checkpointId: string;
  title: string;
  dossier: string;
  hints: string[];
  motiveHints: string[];
  contradictionHints: string[];
  hasCategories: boolean;
}

/**
 * Chuẩn hóa checkpointId: hỗ trợ cả Case 000 legacy và case động
 */
export function normalizeCheckpointId(id?: string, caseId?: string): string {
  if (!id) return "";
  return id.trim();
}

/**
 * Tự động nhận diện checkpoint đang điều tra dở theo tương tác gần nhất và tiến trình thực tế.
 */
export function getLatestActiveCheckpointId(): string {
  if (typeof window !== "undefined") {
    const winCp = (window as any).__ACTIVE_INVESTIGATION_CHECKPOINT__;
    if (winCp) return normalizeCheckpointId(winCp);
  }

  // 1. Kiểm tra checkpoint người chơi vừa tương tác gần nhất
  const activeCp = getStorageItem("active_investigation_checkpoint");
  if (activeCp) return normalizeCheckpointId(activeCp);

  const lastInteracted = getStorageItem("last_interacted_checkpoint");
  if (lastInteracted) return normalizeCheckpointId(lastInteracted);

  return "";
}

/**
 * Gom nhóm hints từ Checkpoint Studio theo checkpoint_id,
 * tự động bóc tách các nhóm [ĐỘNG CƠ], [NGOẠI PHẠM], [MÂU THUẪN].
 */
export function buildGroupedCheckpointsMap(
  checkpoints: PublicCheckpointRow[],
): Map<string, CheckpointGroupData> {
  const map = new Map<string, CheckpointGroupData>();

  for (const row of checkpoints) {
    const id = normalizeCheckpointId(row.checkpoint_id || row.node_id || "");
    if (!id) continue;

    if (!map.has(id)) {
      map.set(id, {
        checkpointId: id,
        title: row.title || id,
        dossier: row.dossier || "",
        hints: [],
        motiveHints: [],
        contradictionHints: [],
        hasCategories: false,
      });
    }
    const entry = map.get(id)!;
    if (row.title) {
      entry.title = row.title;
    }
    if (row.dossier) {
      entry.dossier = row.dossier;
    }

    const hints = parseRuntimeHints(row.hints);
    for (const hint of hints) {
      if (hint.group !== "general") {
        entry.hasCategories = true;
      }
      if (!entry.hints.includes(hint.text)) {
        entry.hints.push(hint.text);
      }
      const target =
        hint.group === "motive"
          ? entry.motiveHints
          : hint.group === "contradiction"
            ? entry.contradictionHints
            : null;
      if (target && !target.includes(hint.text)) {
        target.push(hint.text);
      }
    }

    const alias = normalizeCheckpointId(row.node_id || "");
    if (alias && alias !== id && !map.has(alias)) {
      map.set(alias, entry);
    }
  }

  return map;
}

export function HintModal(_props: HintModalProps) {
  // Gợi ý đã được tích hợp trực tiếp vào bên dưới màn nhập mã (CheckpointHintSection).
  // Không còn modal nảy riêng.
  return null;
}
