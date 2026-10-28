import type {
  Checkpoint,
  CheckpointOptionItem,
  EpilogueStoryRuntime,
} from "@/lib/types";
import type { CheckpointHintGroup } from "@/lib/types/checkpoint-studio";
import type { PublicCheckpointRow } from "@/lib/checkpoints/public-checkpoint";
import { asString, asStringArray } from "@/lib/text";

/**
 * Chuyển row checkpoint đã lọc (`/api/checkpoints`) thành model runtime
 * `Checkpoint` cho gameplay. Row không chứa đáp án.
 */

export interface RuntimeCheckpointHint {
  group: CheckpointHintGroup;
  text: string;
}

function asHintGroup(value: unknown): CheckpointHintGroup {
  return value === "motive" || value === "contradiction" || value === "general"
    ? value
    : "general";
}

export function parseRuntimeHints(raw: unknown): RuntimeCheckpointHint[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item): RuntimeCheckpointHint | null => {
      if (!item || typeof item !== "object") return null;
      const hint = item as Record<string, unknown>;
      const text = asString(hint.text);
      if (!text) return null;
      return { group: asHintGroup(hint.group), text };
    })
    .filter((item): item is RuntimeCheckpointHint => item !== null);
}

function parseAvailableEvidences(raw: unknown): CheckpointOptionItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item): CheckpointOptionItem | null => {
      if (typeof item === "string") {
        const code = item.trim();
        return code ? { id: code, code, label: code } : null;
      }
      if (!item || typeof item !== "object") return null;
      const option = item as Record<string, unknown>;
      const id = asString(option.id) || asString(option.code);
      const code = asString(option.code) || id;
      if (!id && !code) return null;
      return {
        id: id || code,
        code: code || id,
        label: asString(option.label) || code || id,
        description: asString(option.description) || undefined,
      };
    })
    .filter((item): item is CheckpointOptionItem => item !== null);
}

function parseEpilogueStories(
  raw: unknown,
): EpilogueStoryRuntime[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined;
  const stories = raw
    .map((s, idx): EpilogueStoryRuntime | null => {
      if (!s || typeof s !== "object") return null;
      const item = s as Record<string, unknown>;
      return {
        id: asString(item.id) || `epilogue-${idx}`,
        title: asString(item.title) || `Hậu Án ${idx + 1}`,
        monologue: asString(item.monologue) || asString(item.text),
      };
    })
    .filter((s): s is EpilogueStoryRuntime => s !== null && s.monologue !== "");
  return stories.length > 0 ? stories : undefined;
}

/** Kiểu ô nhập: ưu tiên cột question_type, rồi inputType trong config, rồi suy từ dữ liệu. */
function resolveQuestionType(row: PublicCheckpointRow): string | undefined {
  const cfg = row.answer_config;
  const explicit = asString(row.question_type) || asString(cfg.inputType);
  if (explicit) return explicit;
  const type = asString(row.type).toLowerCase();
  if (["time", "choice", "code", "text", "evidence_picker"].includes(type)) {
    return type;
  }
  if (cfg.textMatchInputs?.length) return "text_match_3";
  if (cfg.options?.length) return "choice";
  if (cfg.availableEvidences?.length || cfg.hasMotive || cfg.hasContradiction) {
    return "evidence_picker";
  }
  return type || undefined;
}

export function toRuntimeCheckpoint(row: PublicCheckpointRow): Checkpoint {
  const cfg = row.answer_config;
  const hintsList = parseRuntimeHints(row.hints).map((hint) => hint.text);
  const availableEvidences = parseAvailableEvidences(cfg.availableEvidences);
  const narrative = asString(row.narrative);
  const textMatchInputs = (cfg.textMatchInputs || []).filter((i) => i.id);

  return {
    id: row.checkpoint_id,
    caseId: row.case_id,
    title: row.title || "",
    question: row.question || "",
    hint: hintsList[0] || "",
    hintsList,
    options: asStringArray(cfg.options),
    status: "locked",
    kind: asString(row.kind) || undefined,
    subjectKey: asString(row.subject_key) || undefined,
    type: row.type || "evidence_picker",
    questionType: resolveQuestionType(row),
    photoCodes: asStringArray(cfg.photoCodes),
    textMatchConfig:
      textMatchInputs.length > 0 ? { inputs: textMatchInputs } : undefined,
    pickerConfig:
      availableEvidences.length > 0 || cfg.hasMotive || cfg.hasContradiction
        ? {
            ...(availableEvidences.length > 0 ? { availableEvidences } : {}),
            hasMotive: Boolean(cfg.hasMotive),
            hasContradiction: Boolean(cfg.hasContradiction),
          }
        : undefined,
    epilogueStories: parseEpilogueStories(cfg.epilogueStories),
    storyConfig: narrative
      ? {
          monologue: narrative,
          date: row.dossier || "",
          subtitle: row.title || "",
        }
      : undefined,
    dossier: row.dossier || undefined,
    unlocksDossier: cfg.unlocksDossier,
    followupOf: asString(row.followup_of) || cfg.followupOf || undefined,
    dependsOn: asStringArray(row.depends_on),
    nodeId: asString(row.node_id) || row.checkpoint_id,
  };
}

export function toRuntimeCheckpoints(
  rows: PublicCheckpointRow[],
): Checkpoint[] {
  return rows.map(toRuntimeCheckpoint);
}
