import type { DbCaseCheckpoint } from "@/lib/types/database";
import { normalizeForMatch } from "@/lib/text";

/**
 * Đồ thị phụ thuộc checkpoint cho Checkpoint Studio.
 *
 * Cạnh có hướng: prerequisite (`source`) → checkpoint phụ thuộc (`target`).
 * Dữ liệu lưu ở `case_checkpoints.depends_on` (mảng `checkpoint_id`).
 * Runtime gameplay vẫn đọc Google Sheets; module này chỉ dùng trong Studio.
 */

export interface CheckpointGraphEdge {
  source: string;
  target: string;
  /** true = gợi ý từ followup_of / requiredEvidenceIds, chưa lưu. */
  inferred?: boolean;
}

export interface CheckpointGraphPosition {
  x: number;
  y: number;
}

export type DependencyValidation =
  | { ok: true; dependencies: Record<string, string[]> }
  | { ok: false; error: string };

function normalize(value: string): string {
  return normalizeForMatch(value);
}

function tokens(value: string): string[] {
  return normalize(value)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function readStringArray(
  config: Record<string, unknown> | null | undefined,
  key: string,
): string[] {
  const value = config?.[key];
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Tìm checkpoint được một khóa CMS tham chiếu tới (ví dụ `followup_of`).
 * Khớp theo mã chính xác hoặc toàn bộ token của mã/tiêu đề; không hardcode
 * tên nhân vật hay tên bộ hồ sơ để vụ án mới có thể tùy biến dữ liệu.
 */
function findReferencedCheckpoint(
  checkpoints: DbCaseCheckpoint[],
  rawKey: string,
  excludeId?: string,
): DbCaseCheckpoint | undefined {
  const key = normalize(rawKey);
  const keyTokens = tokens(rawKey);
  if (!key || keyTokens.length === 0) return undefined;

  const candidates = checkpoints.filter((checkpoint) => {
    if (checkpoint.checkpoint_id === excludeId) return false;
    if (checkpoint.followup_of) return false;
    if (checkpoint.checkpoint_id.toLowerCase().includes("followup"))
      return false;
    return true;
  });

  const exactId = candidates.find(
    (checkpoint) => normalize(checkpoint.checkpoint_id) === key,
  );
  if (exactId) return exactId;

  return candidates.find((checkpoint) => {
    // Không dùng `question`: câu hỏi mở có thể nhắc nhiều nhân vật và gây
    // khớp nhầm. Chỉ dùng định danh và tiêu đề của checkpoint.
    const haystack = tokens(
      [
        checkpoint.checkpoint_id,
        checkpoint.title,
        checkpoint.suspect_label || "",
      ].join(" "),
    );
    return keyTokens.every((token) => haystack.includes(token));
  });
}

function edgeKey(edge: CheckpointGraphEdge): string {
  return `${edge.source}->${edge.target}`;
}

function dedupeEdges(edges: CheckpointGraphEdge[]): CheckpointGraphEdge[] {
  const seen = new Set<string>();
  return edges.filter((edge) => {
    const key = edgeKey(edge);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Cạnh đã lưu từ `depends_on`, bỏ qua tham chiếu treo. */
export function buildDependencyEdges(
  checkpoints: DbCaseCheckpoint[],
): CheckpointGraphEdge[] {
  const ids = new Set(
    checkpoints.map((checkpoint) => checkpoint.checkpoint_id),
  );
  const edges: CheckpointGraphEdge[] = [];

  for (const checkpoint of checkpoints) {
    for (const dependency of checkpoint.depends_on || []) {
      if (!ids.has(dependency) || dependency === checkpoint.checkpoint_id) {
        continue;
      }
      edges.push({
        source: dependency,
        target: checkpoint.checkpoint_id,
        inferred: false,
      });
    }
  }

  return dedupeEdges(edges);
}

/**
 * Gợi ý cạnh từ dữ liệu CMS hiện có. Chỉ trả về cạnh chưa tồn tại và
 * không tạo cycle; người dùng phải bấm áp dụng mới ghi vào `depends_on`.
 */
export function suggestDependencyEdges(
  checkpoints: DbCaseCheckpoint[],
): CheckpointGraphEdge[] {
  const existing = new Set(buildDependencyEdges(checkpoints).map(edgeKey));
  const suggestions: CheckpointGraphEdge[] = [];

  const add = (source?: string, target?: string) => {
    if (!source || !target || source === target) return;
    const edge = { source, target, inferred: true };
    const key = edgeKey(edge);
    if (existing.has(key)) return;
    if (
      wouldCreateCycle(
        [...buildDependencyEdges(checkpoints), ...suggestions],
        edge,
      )
    ) {
      return;
    }
    existing.add(key);
    suggestions.push(edge);
  };

  for (const checkpoint of checkpoints) {
    if (checkpoint.followup_of) {
      const parent = findReferencedCheckpoint(
        checkpoints,
        checkpoint.followup_of,
        checkpoint.checkpoint_id,
      );
      add(parent?.checkpoint_id, checkpoint.checkpoint_id);
    }

    const required = readStringArray(
      checkpoint.answer_config,
      "requiredEvidenceIds",
    );
    for (const requirement of required) {
      const parent = findReferencedCheckpoint(
        checkpoints,
        requirement,
        checkpoint.checkpoint_id,
      );
      add(parent?.checkpoint_id, checkpoint.checkpoint_id);
    }
  }

  return suggestions;
}

function hasCycle(edges: CheckpointGraphEdge[]): boolean {
  const adjacency = new Map<string, string[]>();
  for (const edge of edges) {
    if (!edge.source || !edge.target) continue;
    const next = adjacency.get(edge.source) || [];
    next.push(edge.target);
    adjacency.set(edge.source, next);
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();

  const visit = (node: string): boolean => {
    if (visiting.has(node)) return true;
    if (visited.has(node)) return false;
    visiting.add(node);
    for (const next of adjacency.get(node) || []) {
      if (visit(next)) return true;
    }
    visiting.delete(node);
    visited.add(node);
    return false;
  };

  for (const node of adjacency.keys()) {
    if (visit(node)) return true;
  }
  return false;
}

/** Kiểm tra thêm một cạnh có tạo cycle không. */
export function wouldCreateCycle(
  edges: CheckpointGraphEdge[],
  candidate: CheckpointGraphEdge,
): boolean {
  if (candidate.source === candidate.target) return true;
  return hasCycle([...edges, candidate]);
}

/**
 * Validate batch cập nhật phụ thuộc: tham chiếu tồn tại, không self-edge,
 * không trùng và không cycle.
 */
export function validateDependencyUpdates(
  checkpoints: DbCaseCheckpoint[],
  updates: Array<{ checkpointId: string; dependsOn: string[] }>,
): DependencyValidation {
  const ids = new Set(
    checkpoints.map((checkpoint) => checkpoint.checkpoint_id),
  );
  const merged = new Map<string, string[]>();

  for (const checkpoint of checkpoints) {
    merged.set(checkpoint.checkpoint_id, checkpoint.depends_on || []);
  }

  for (const update of updates) {
    if (!ids.has(update.checkpointId)) {
      return {
        ok: false,
        error: `Checkpoint "${update.checkpointId}" không tồn tại trong vụ án.`,
      };
    }

    const unique = Array.from(new Set(update.dependsOn.map((id) => id.trim())));
    for (const dependency of unique) {
      if (!dependency) continue;
      if (dependency === update.checkpointId) {
        return {
          ok: false,
          error: `Checkpoint "${update.checkpointId}" không thể phụ thuộc chính nó.`,
        };
      }
      if (!ids.has(dependency)) {
        return {
          ok: false,
          error: `Không tìm thấy checkpoint phụ thuộc "${dependency}".`,
        };
      }
    }
    merged.set(update.checkpointId, unique.filter(Boolean));
  }

  const edges = dedupeEdges(
    Array.from(merged.entries()).flatMap(([target, sources]) =>
      sources.map((source) => ({ source, target })),
    ),
  );

  if (hasCycle(edges)) {
    return { ok: false, error: "Đồ thị checkpoint có vòng lặp phụ thuộc." };
  }

  return { ok: true, dependencies: Object.fromEntries(merged) };
}

/**
 * Layout theo tầng (longest-path level). Không cần Dagre/ELK cho quy mô
 * vài chục checkpoint. Node trong cùng tầng xếp theo dossier rồi mã.
 */
export function layoutCheckpointGraph(
  checkpoints: DbCaseCheckpoint[],
  edges: CheckpointGraphEdge[],
): Record<string, CheckpointGraphPosition> {
  const ids = checkpoints.map((checkpoint) => checkpoint.checkpoint_id);
  const adjacency = new Map<string, string[]>();
  const indegree = new Map<string, number>();

  for (const id of ids) {
    adjacency.set(id, []);
    indegree.set(id, 0);
  }

  for (const edge of edges) {
    if (!ids.includes(edge.source) || !ids.includes(edge.target)) continue;
    adjacency.get(edge.source)!.push(edge.target);
    indegree.set(edge.target, (indegree.get(edge.target) || 0) + 1);
  }

  const level = new Map<string, number>(ids.map((id) => [id, 0]));
  const queue = ids.filter((id) => (indegree.get(id) || 0) === 0);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentLevel = level.get(current) || 0;
    for (const next of adjacency.get(current) || []) {
      level.set(next, Math.max(level.get(next) || 0, currentLevel + 1));
      indegree.set(next, (indegree.get(next) || 0) - 1);
      if ((indegree.get(next) || 0) === 0) queue.push(next);
    }
  }

  // Gom checkpoint theo bộ hồ sơ thành từng lane ngang. Trong lane, trục X
  // theo tầng phụ thuộc, trục Y theo thứ tự node.
  const byDossier = new Map<string, DbCaseCheckpoint[]>();
  for (const checkpoint of checkpoints) {
    const key = checkpoint.dossier?.trim() || "Chưa xếp bộ";
    const list = byDossier.get(key) || [];
    list.push(checkpoint);
    byDossier.set(key, list);
  }

  const positions: Record<string, CheckpointGraphPosition> = {};
  let laneY = 110;

  for (const nodes of byDossier.values()) {
    nodes.sort((a, b) => {
      const levelA = level.get(a.checkpoint_id) || 0;
      const levelB = level.get(b.checkpoint_id) || 0;
      if (levelA !== levelB) return levelA - levelB;
      return a.checkpoint_id.localeCompare(b.checkpoint_id);
    });

    nodes.forEach((checkpoint, index) => {
      const nodeLevel = level.get(checkpoint.checkpoint_id) || 0;
      positions[checkpoint.checkpoint_id] = {
        x: nodeLevel * 340,
        y: laneY + index * 150,
      };
    });

    laneY += nodes.length * 150 + 130;
  }

  return positions;
}

export type CheckpointIssueKind =
  | "missing_dependency"
  | "missing_question"
  | "missing_answer"
  | "missing_narrative";

export interface CheckpointIssue {
  kind: CheckpointIssueKind;
  label: string;
}

/** Cảnh báo chất lượng dữ liệu hiển thị trên node flow. */
export function getCheckpointIssues(
  checkpoint: DbCaseCheckpoint,
  allCheckpoints: DbCaseCheckpoint[],
): CheckpointIssue[] {
  const issues: CheckpointIssue[] = [];
  const ids = new Set(allCheckpoints.map((item) => item.checkpoint_id));

  for (const dependency of checkpoint.depends_on || []) {
    if (!ids.has(dependency)) {
      const nodeLabel = allCheckpoints.find(
        (item) =>
          item.checkpoint_id === dependency || item.node_id === dependency,
      );
      issues.push({
        kind: "missing_dependency",
        label: `Thiếu tiền đề ${nodeLabel?.node_id?.trim() || dependency}`,
      });
    }
  }

  if (!checkpoint.question.trim()) {
    issues.push({ kind: "missing_question", label: "Chưa có câu hỏi" });
  }

  if (checkpoint.type === "evidence_picker") {
    const config = checkpoint.answer_config || {};
    const hasAnswer = [
      "motiveEvidenceIds",
      "contradictionEvidenceIds",
      "requiredEvidenceIds",
      "validSuspects",
    ].some((key) => readStringArray(config, key).length > 0);
    if (!hasAnswer) {
      issues.push({ kind: "missing_answer", label: "Chưa có đáp án" });
    }
  }

  if (!checkpoint.narrative?.trim()) {
    issues.push({ kind: "missing_narrative", label: "Chưa có narrative" });
  }

  return issues;
}

export function getDependents(
  checkpoints: DbCaseCheckpoint[],
  checkpointId: string,
): string[] {
  return checkpoints
    .filter((checkpoint) => checkpoint.depends_on?.includes(checkpointId))
    .map((checkpoint) => checkpoint.checkpoint_id);
}
