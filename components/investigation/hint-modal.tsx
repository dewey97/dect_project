"use client";

import { parseRuntimeHints } from "@/lib/cms/checkpoint-runtime";
import type { DbCaseCheckpoint } from "@/lib/types/database";
import { getStorageItem } from "@/lib/storage";

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkpointId?: string;
  category?: "motive" | "alibi" | "contradiction" | "all";
  caseId?: string;
}

export interface CheckpointGroupData {
  checkpointId: string;
  title: string;
  dossier: string;
  hints: string[];
  motiveHints: string[];
  alibiHints: string[];
  contradictionHints: string[];
  hasCategories: boolean;
}

/**
 * Chuẩn hóa checkpointId: hỗ trợ cả Case 000 legacy và case động
 */
export function normalizeCheckpointId(id?: string, caseId?: string): string {
  if (!id) return "";
  const clean = id.trim().toLowerCase();
  if (caseId && caseId !== "case-000") {
    return clean;
  }
  if (clean.includes("followup")) {
    if (clean.includes("vu") || clean.includes("1a"))
      return "cp-000-1a-followup";
    if (clean.includes("ha") || clean.includes("1c"))
      return "cp-000-1c-followup";
    return clean;
  }
  if (
    clean === "phone" ||
    clean === "cp-000-0" ||
    clean === "c0-pin-phone" ||
    clean.startsWith("phone")
  )
    return "cp-000-0";
  if (
    clean === "vu" ||
    clean === "vũ" ||
    clean === "cp-000-1a" ||
    clean.endsWith("-vu")
  )
    return "cp-000-1a";
  if (
    clean === "tung" ||
    clean === "tùng" ||
    clean === "cp-000-1b" ||
    clean.endsWith("-tung")
  )
    return "cp-000-1b";
  if (
    clean === "ha" ||
    clean === "hà" ||
    clean === "cp-000-1c" ||
    clean.endsWith("-ha")
  )
    return "cp-000-1c";
  if (
    clean === "indictment" ||
    clean === "cao-trang" ||
    clean === "cp-000-2b" ||
    clean.includes("indictment")
  )
    return "cp-000-2b";
  return clean;
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

  const lastSuspect = getStorageItem("last_viewed_suspect");
  if (lastSuspect) {
    const normSuspect = lastSuspect.toLowerCase().trim();
    if (normSuspect === "vu" || normSuspect.includes("vũ")) return "cp-000-1a";
    if (normSuspect === "tung" || normSuspect.includes("tùng"))
      return "cp-000-1b";
    if (normSuspect === "ha" || normSuspect.includes("hà")) return "cp-000-1c";
  }

  // 2. Kiểm tra tiến trình giải đố thực tế trong storage
  const isPhoneSolved = getStorageItem("phone_solved") === "true";
  if (!isPhoneSolved) return "cp-000-0";

  const isVuSolved = Boolean(getStorageItem("followup_vu"));
  if (!isVuSolved) return "cp-000-1a";

  const isTungSolved = Boolean(getStorageItem("followup_tung"));
  if (!isTungSolved) return "cp-000-1b";

  const isHaSolved = Boolean(getStorageItem("followup_ha"));
  if (!isHaSolved) return "cp-000-1c";

  const isIndictmentSolved = getStorageItem("indictment_solved") === "true";
  if (!isIndictmentSolved) return "cp-000-2b";

  return "cp-000-2b";
}

/**
 * Gom nhóm hints từ Checkpoint Studio theo checkpoint_id,
 * tự động bóc tách các nhóm [ĐỘNG CƠ], [NGOẠI PHẠM], [MÂU THUẪN].
 */
export function buildGroupedCheckpointsMap(
  checkpoints: DbCaseCheckpoint[],
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
        alibiHints: [],
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
          : hint.group === "alibi"
            ? entry.alibiHints
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
