"use client";

import type { DbCaseCheckpoint } from "@/lib/types/database";
import { caseStorageKey } from "@/lib/cases/case-id";
import { setStorageItem } from "@/lib/storage";

/**
 * Tìm toàn bộ các checkpoint tiên quyết (tổ tiên) cần hoàn thành trước targetCpId
 */
export function getPrerequisiteCheckpoints(
  targetId: string,
  checkpoints: DbCaseCheckpoint[],
): DbCaseCheckpoint[] {
  const cpMap = new Map(checkpoints.map((c) => [c.checkpoint_id, c]));
  const ancestors = new Set<string>();
  const queue = [targetId];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const cp = cpMap.get(curr);
    if (!cp) continue;
    for (const dep of cp.depends_on || []) {
      if (!ancestors.has(dep)) {
        ancestors.add(dep);
        queue.push(dep);
      }
    }
  }

  return Array.from(ancestors)
    .map((id) => cpMap.get(id)!)
    .filter(Boolean);
}

/**
 * Thiết lập tiến trình chơi thử (Playtest) từ một node X bất kỳ (C4).
 * Tự động ghi localStorage các mốc trung gian của toàn bộ node tiên quyết,
 * sau đó mở `/evidence/web?case_id=...` trên tab mới.
 */
export function launchPlaytestFromCheckpoint(params: {
  caseId: string;
  targetCheckpoint: DbCaseCheckpoint;
  allCheckpoints: DbCaseCheckpoint[];
}): void {
  const { caseId, targetCheckpoint, allCheckpoints } = params;
  const ancestors = getPrerequisiteCheckpoints(
    targetCheckpoint.checkpoint_id,
    allCheckpoints,
  );

  // 1. Luôn coi như đã qua intro
  setStorageItem(caseStorageKey(caseId, "intro_seen"), "true");

  const investigatedSuspects: string[] = [];
  const solvedFollowups: string[] = [];
  const unlockedDossiers: string[] = ["ban_dau", "bo_a"];

  for (const cp of ancestors) {
    const kind = cp.kind || cp.type;
    const cfg = (cp.answer_config || {}) as Record<string, any>;
    const sKey = (cp.subject_key || "").toLowerCase().trim();

    if (kind === "phone_lookup") {
      setStorageItem(caseStorageKey(caseId, "phone_solved"), "true");
      setStorageItem(
        caseStorageKey(caseId, "phone_inputs"),
        JSON.stringify({
          phone1: "0988200991",
          phone2: "0978552109",
          phone3: "0984112568",
        }),
      );
    } else if (kind === "suspect_interrogation") {
      if (sKey && !investigatedSuspects.includes(sKey)) {
        investigatedSuspects.push(sKey);
      }
    } else if (kind === "followup") {
      if (sKey && !solvedFollowups.includes(sKey)) {
        solvedFollowups.push(sKey);
      }
    } else if (kind === "indictment") {
      setStorageItem(caseStorageKey(caseId, "indictment_solved"), "true");
      setStorageItem(caseStorageKey(caseId, "indictment_culprit"), sKey || "culprit");
      unlockedDossiers.push("ket_luan");
    }

    const unlocksDossier =
      cfg.unlocksDossier || cfg.unlocks_dossier || cp.dossier;
    if (unlocksDossier && !unlockedDossiers.includes(unlocksDossier)) {
      unlockedDossiers.push(unlocksDossier);
    }
  }

  if (investigatedSuspects.length > 0) {
    setStorageItem(
      caseStorageKey(caseId, "investigated_suspects"),
      JSON.stringify(investigatedSuspects),
    );
  }

  if (solvedFollowups.length > 0) {
    setStorageItem(
      caseStorageKey(caseId, "solved_followups"),
      JSON.stringify(solvedFollowups),
    );
  }

  if (unlockedDossiers.length > 0) {
    setStorageItem(
      caseStorageKey(caseId, "unlocked_dossiers"),
      JSON.stringify(unlockedDossiers),
    );
  }

  // Khám xét hiện trường mở sẵn
  setStorageItem(caseStorageKey(caseId, "reinvestigate_unlocked"), "true");

  // Nếu mục tiêu chính là Hậu án (Epilogue)
  if (
    targetCheckpoint.kind === "epilogue" ||
    targetCheckpoint.type === "epilogue"
  ) {
    setStorageItem(caseStorageKey(caseId, "indictment_solved"), "true");
    setStorageItem(caseStorageKey(caseId, "indictment_culprit"), "culprit");
    if (!unlockedDossiers.includes("ket_luan")) {
      unlockedDossiers.push("ket_luan");
      setStorageItem(
        caseStorageKey(caseId, "unlocked_dossiers"),
        JSON.stringify(unlockedDossiers),
      );
    }
  }

  // Mở tab chơi thử
  if (typeof window !== "undefined") {
    window.open(`/evidence/web?case_id=${encodeURIComponent(caseId)}`, "_blank");
  }
}
