import type {
  AnnotationStroke,
  CanvasStickyNote,
  RoomInvestigationState,
} from "../types/room";

/**
 * Merge tiến trình phòng phía server (spec 5.3). Logic thuần.
 *
 * Luật:
 * - Mảng tiến trình: hợp (union), không bao giờ mất phần tử.
 * - `phoneInputs`, `annotations`: gộp theo key; key mới đè key cũ.
 * - Boolean tiến trình: chỉ chuyển false → true.
 * - `teamNotes`, `canvasNotes`: last-write-wins (giữ hành vi v1, ghi ở TECHDEBT).
 * - `indictmentSolved`, `solvedCulprit`: chỉ route `/api/rooms/conclusion` được ghi,
 *   `sanitizeProgressPatch` loại khỏi patch của client.
 */

export const EMPTY_ROOM_STATE: RoomInvestigationState = {
  completedCheckpoints: [],
  phoneSolved: false,
  phoneInputs: {},
  investigatedSuspects: [],
  solvedFollowups: [],
  unlockedDossiers: [],
  reinvestigateOpened: false,
  indictmentSolved: false,
  solvedCulprit: null,
  annotations: {},
  teamNotes: "",
  canvasNotes: [],
};

const ARRAY_KEYS = [
  "completedCheckpoints",
  "investigatedSuspects",
  "solvedFollowups",
  "unlockedDossiers",
] as const;

const BOOLEAN_KEYS = ["phoneSolved", "reinvestigateOpened"] as const;

const MAX_ID_LENGTH = 128;
const MAX_ARRAY_ITEMS = 500;
const MAX_MAP_KEYS = 500;
const MAX_TEXT_LENGTH = 20_000;
const MAX_STICKY_NOTES = 200;
const MAX_STROKES_PER_DOC = 2_000;

export type ProgressPatch = Partial<
  Omit<
    RoomInvestigationState,
    "indictmentSolved" | "solvedCulprit" | "lastAction"
  >
>;

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function cleanIdList(v: unknown): string[] | null {
  if (!Array.isArray(v)) return null;
  const out: string[] = [];
  for (const item of v) {
    if (
      typeof item === "string" &&
      item.length > 0 &&
      item.length <= MAX_ID_LENGTH
    ) {
      out.push(item);
    }
    if (out.length >= MAX_ARRAY_ITEMS) break;
  }
  return out;
}

/**
 * Lọc patch client gửi lên: chỉ giữ key cho phép, đúng kiểu, trong giới hạn kích thước.
 * Trả null nếu không còn gì để ghi.
 */
export function sanitizeProgressPatch(raw: unknown): ProgressPatch | null {
  if (!isPlainObject(raw)) return null;
  const patch: ProgressPatch = {};

  for (const key of ARRAY_KEYS) {
    const list = cleanIdList(raw[key]);
    if (list && list.length > 0) patch[key] = list;
  }

  for (const key of BOOLEAN_KEYS) {
    if (raw[key] === true) patch[key] = true;
  }

  if (isPlainObject(raw.phoneInputs)) {
    const inputs: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw.phoneInputs).slice(
      0,
      MAX_MAP_KEYS,
    )) {
      if (
        k.length <= MAX_ID_LENGTH &&
        typeof v === "string" &&
        v.length <= 256
      ) {
        inputs[k] = v;
      }
    }
    if (Object.keys(inputs).length > 0) patch.phoneInputs = inputs;
  }

  if (isPlainObject(raw.annotations)) {
    const annotations: Record<string, AnnotationStroke[]> = {};
    for (const [k, v] of Object.entries(raw.annotations).slice(
      0,
      MAX_MAP_KEYS,
    )) {
      if (k.length <= MAX_ID_LENGTH && Array.isArray(v)) {
        annotations[k] = (v as AnnotationStroke[])
          .filter((s) => isPlainObject(s) && Array.isArray(s.points))
          .slice(0, MAX_STROKES_PER_DOC);
      }
    }
    if (Object.keys(annotations).length > 0) patch.annotations = annotations;
  }

  if (typeof raw.teamNotes === "string") {
    patch.teamNotes = raw.teamNotes.slice(0, MAX_TEXT_LENGTH);
  }

  if (Array.isArray(raw.canvasNotes)) {
    patch.canvasNotes = (raw.canvasNotes as CanvasStickyNote[])
      .filter((n) => isPlainObject(n) && typeof n.id === "string")
      .slice(0, MAX_STICKY_NOTES)
      .map((n) => ({
        ...n,
        content: typeof n.content === "string" ? n.content.slice(0, 2_000) : "",
      }));
  }

  return Object.keys(patch).length > 0 ? patch : null;
}

/** Chuẩn hóa `state_json` đọc từ DB (có thể thiếu field, hoặc là `{}` của phòng mới). */
export function normalizeRoomState(raw: unknown): RoomInvestigationState {
  const s = isPlainObject(raw) ? (raw as Partial<RoomInvestigationState>) : {};
  return {
    ...EMPTY_ROOM_STATE,
    ...s,
    completedCheckpoints: cleanIdList(s.completedCheckpoints) ?? [],
    investigatedSuspects: cleanIdList(s.investigatedSuspects) ?? [],
    solvedFollowups: cleanIdList(s.solvedFollowups) ?? [],
    unlockedDossiers: cleanIdList(s.unlockedDossiers) ?? [],
    phoneInputs: isPlainObject(s.phoneInputs)
      ? (s.phoneInputs as Record<string, string>)
      : {},
    annotations: isPlainObject(s.annotations)
      ? (s.annotations as Record<string, AnnotationStroke[]>)
      : {},
    canvasNotes: Array.isArray(s.canvasNotes) ? s.canvasNotes : [],
    teamNotes: typeof s.teamNotes === "string" ? s.teamNotes : "",
    phoneSolved: s.phoneSolved === true,
    reinvestigateOpened: s.reinvestigateOpened === true,
    indictmentSolved: s.indictmentSolved === true,
    solvedCulprit: typeof s.solvedCulprit === "string" ? s.solvedCulprit : null,
  };
}

function union(a: string[], b: string[]): string[] {
  return Array.from(new Set([...a, ...b]));
}

/** Gộp patch vào state hiện tại. Không sửa tham số đầu vào. */
export function mergeRoomState(
  current: RoomInvestigationState,
  patch: ProgressPatch,
): RoomInvestigationState {
  const next: RoomInvestigationState = { ...current };

  for (const key of ARRAY_KEYS) {
    const add = patch[key];
    if (add && add.length > 0) next[key] = union(current[key] ?? [], add);
  }

  for (const key of BOOLEAN_KEYS) {
    if (patch[key] === true) next[key] = true;
  }

  if (patch.phoneInputs) {
    next.phoneInputs = { ...current.phoneInputs, ...patch.phoneInputs };
  }
  if (patch.annotations) {
    next.annotations = { ...(current.annotations ?? {}), ...patch.annotations };
  }
  if (patch.teamNotes !== undefined) next.teamNotes = patch.teamNotes;
  if (patch.canvasNotes !== undefined) next.canvasNotes = patch.canvasNotes;

  // Bỏ field v1 không còn dùng (thay bằng room_events).
  delete next.lastAction;
  return next;
}

/** Những gì patch thật sự thêm mới (để sinh room_events). */
export function progressDelta(
  before: RoomInvestigationState,
  after: RoomInvestigationState,
): {
  newCheckpoints: string[];
  newDossiers: string[];
  phoneJustSolved: boolean;
} {
  const had = (list: string[] | undefined) => new Set(list ?? []);
  const cps = had(before.completedCheckpoints);
  const dossiers = had(before.unlockedDossiers);
  return {
    newCheckpoints: after.completedCheckpoints.filter((id) => !cps.has(id)),
    newDossiers: (after.unlockedDossiers ?? []).filter(
      (id) => !dossiers.has(id),
    ),
    phoneJustSolved: !before.phoneSolved && after.phoneSolved,
  };
}
