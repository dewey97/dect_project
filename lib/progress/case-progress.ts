import { caseStorageKey } from "@/lib/cases/case-id";
import { getStorageJson, setStorageJson } from "@/lib/storage";
import { slugifyVietnamese } from "@/lib/text";
import { emitInvestigationEvent } from "@/lib/investigation-events";

/**
 * Tiến độ mở bộ hồ sơ của một vụ án.
 *
 * Nguồn mở khóa duy nhất: `unlocksDossier` của checkpoint (Checkpoint Studio),
 * server trả về khi chấm đúng. Bộ hồ sơ khởi đầu (slot 0–1) luôn mở; cáo trạng
 * xong mở bộ kết luận. Phase và khay hồ sơ suy ra từ danh sách này.
 */

const UNLOCKED_DOSSIERS_KEY = "unlocked_dossiers";

/** Slot luôn mở từ đầu: hồ sơ ban đầu (0) và bộ đầu tiên (1). */
export const ALWAYS_OPEN_SLOT = 1;

export interface DossierRefTarget {
  dossier_key?: string | null;
  title?: string | null;
}

export interface DossierUnlockedDetail {
  caseId: string;
  refs: string[];
  /** true khi đến từ phòng chơi nhóm: không phát lại lên phòng. */
  fromRoom?: boolean;
}

/** "Bộ A" / "bo_a" / "BO-A" → "bo_a". */
export function normalizeDossierRef(ref: string): string {
  return slugifyVietnamese(ref || "");
}

export function isDossierRefMatch(
  ref: string,
  dossier: DossierRefTarget,
): boolean {
  const norm = normalizeDossierRef(ref);
  if (!norm) return false;
  return (
    norm === normalizeDossierRef(dossier.dossier_key || "") ||
    norm === normalizeDossierRef(dossier.title || "")
  );
}

export function getUnlockedDossiers(caseId: string): string[] {
  return getStorageJson<string[]>(
    caseStorageKey(caseId, UNLOCKED_DOSSIERS_KEY),
    [],
  ).map(normalizeDossierRef);
}

/**
 * Mở thêm bộ hồ sơ. Trả các ref mới (đã chuẩn hóa); rỗng khi không có gì mới.
 * Phát `DOSSIER_UNLOCKED` để màn hình đang mở tính lại phase.
 */
export function unlockDossiers(
  caseId: string,
  refs: (string | null | undefined)[],
  options: { fromRoom?: boolean } = {},
): string[] {
  const current = getUnlockedDossiers(caseId);
  const added = Array.from(
    new Set(
      refs
        .map((ref) => normalizeDossierRef(ref || ""))
        .filter((ref) => ref && !current.includes(ref)),
    ),
  );
  if (added.length === 0) return [];
  setStorageJson(caseStorageKey(caseId, UNLOCKED_DOSSIERS_KEY), [
    ...current,
    ...added,
  ]);
  emitInvestigationEvent("DOSSIER_UNLOCKED", {
    caseId,
    refs: added,
    fromRoom: options.fromRoom,
  } satisfies DossierUnlockedDetail);
  return added;
}

/** Bộ hồ sơ ở `slot` đã mở chưa. */
export function isDossierSlotOpen(
  dossier: DossierRefTarget,
  slot: number,
  unlockedRefs: string[],
  isIndictmentSolved: boolean,
): boolean {
  if (slot <= ALWAYS_OPEN_SLOT) return true;
  if (unlockedRefs.some((ref) => isDossierRefMatch(ref, dossier))) return true;
  // Tiến trình cũ dạng phase_N.
  if (unlockedRefs.includes(`phase_${slot}`)) return true;
  // Cáo trạng xong: mở mọi bộ còn lại (bộ kết luận).
  return isIndictmentSolved;
}

/** Phase cao nhất đã mở = slot lớn nhất trong các bộ hồ sơ đang mở. */
export function getUnlockedPhase(
  dossiers: { dossier: DossierRefTarget; slot: number }[],
  unlockedRefs: string[],
  isIndictmentSolved: boolean,
): number {
  return dossiers.reduce(
    (max, { dossier, slot }) =>
      isDossierSlotOpen(dossier, slot, unlockedRefs, isIndictmentSolved)
        ? Math.max(max, slot)
        : max,
    ALWAYS_OPEN_SLOT,
  );
}
