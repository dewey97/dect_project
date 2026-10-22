import type { DbCaseCheckpoint, DbCaseCharacter } from "@/lib/types/database";

export interface CaseLintIssue {
  level: "error" | "warning" | "info";
  checkpointId?: string;
  characterKey?: string;
  rule:
    | "cycle_detected"
    | "missing_dependency"
    | "missing_answer"
    | "unreachable_node"
    | "missing_victim"
    | "suspect_without_interrogation"
    | "unknown_evidence_code";
  message: string;
}

export interface CaseLintResult {
  isValid: boolean;
  issues: CaseLintIssue[];
  errorCount: number;
  warningCount: number;
}

/**
 * Linter kiểm tra tính toàn vẹn của kịch bản vụ án (Checkpoints, Characters, Graph, Evidences).
 * Hỗ trợ GM phát hiện sớm lỗi logic trước khi xuất bản vụ án mới (C2).
 */
export function lintCase(params: {
  checkpoints: DbCaseCheckpoint[];
  characters?: DbCaseCharacter[];
  availableEvidenceCodes?: string[];
}): CaseLintResult {
  const { checkpoints, characters = [], availableEvidenceCodes = [] } = params;
  const issues: CaseLintIssue[] = [];

  const cpMap = new Map<string, DbCaseCheckpoint>();
  for (const cp of checkpoints) {
    cpMap.set(cp.checkpoint_id, cp);
  }

  // 1. Kiểm tra nạn nhân (Case phải có ít nhất 1 victim)
  if (characters.length > 0) {
    const hasVictim = characters.some((c) => c.role === "victim");
    if (!hasVictim) {
      issues.push({
        level: "warning",
        rule: "missing_victim",
        message: "Vụ án chưa thiết lập nhân vật đóng vai trò nạn nhân (victim).",
      });
    }

    // 2. Kiểm tra nghi phạm có checkpoint thẩm tra tương ứng
    const suspects = characters.filter((c) => c.role === "suspect");
    for (const suspect of suspects) {
      const sKey = (suspect.key || "").toLowerCase().trim();
      const hasInterrogation = checkpoints.some(
        (cp) =>
          cp.kind === "suspect_interrogation" &&
          (cp.subject_key || "").toLowerCase().trim() === sKey,
      );
      if (!hasInterrogation) {
        issues.push({
          level: "info",
          characterKey: suspect.key,
          rule: "suspect_without_interrogation",
          message: `Nghi phạm "${suspect.name}" (${suspect.key}) chưa có checkpoint thẩm tra (kind: suspect_interrogation).`,
        });
      }
    }
  }

  // 3. Kiểm tra đồ thị phụ thuộc (Missing dependencies & Cycle detection)
  const adj = new Map<string, string[]>();
  for (const cp of checkpoints) {
    const deps = cp.depends_on || [];
    adj.set(cp.checkpoint_id, deps);

    for (const dep of deps) {
      if (!cpMap.has(dep)) {
        issues.push({
          level: "error",
          checkpointId: cp.checkpoint_id,
          rule: "missing_dependency",
          message: `Checkpoint phụ thuộc vào "${dep}" nhưng không tìm thấy checkpoint này trong vụ án.`,
        });
      }
    }
  }

  // Thuật toán DFS phát hiện Cycle (chu trình phụ thuộc)
  const visited = new Map<string, 0 | 1 | 2>(); // 0: unvisited, 1: visiting, 2: visited
  const cycleNodes = new Set<string>();

  function dfsDetectCycle(nodeId: string, path: string[]) {
    visited.set(nodeId, 1);
    const deps = adj.get(nodeId) || [];
    for (const dep of deps) {
      if (!cpMap.has(dep)) continue;
      const state = visited.get(dep) || 0;
      if (state === 1) {
        cycleNodes.add(dep);
        cycleNodes.add(nodeId);
        issues.push({
          level: "error",
          checkpointId: nodeId,
          rule: "cycle_detected",
          message: `Phát hiện chu trình phụ thuộc vòng quanh: ${path.join(" -> ")} -> ${dep}`,
        });
      } else if (state === 0) {
        dfsDetectCycle(dep, [...path, dep]);
      }
    }
    visited.set(nodeId, 2);
  }

  for (const cp of checkpoints) {
    if (!visited.has(cp.checkpoint_id)) {
      dfsDetectCycle(cp.checkpoint_id, [cp.checkpoint_id]);
    }
  }

  // 3.1. Kiểm tra tính tiếp cận (Unreachable Nodes - Node không tới được từ khởi đầu)
  const forwardAdj = new Map<string, string[]>();
  for (const cp of checkpoints) {
    forwardAdj.set(cp.checkpoint_id, []);
  }
  for (const cp of checkpoints) {
    for (const dep of cp.depends_on || []) {
      if (forwardAdj.has(dep)) {
        forwardAdj.get(dep)!.push(cp.checkpoint_id);
      }
    }
  }

  const reachableSet = new Set<string>();
  const queue: string[] = [];

  // Các node khởi đầu (không có dependencies) được coi là reachable từ đầu game
  for (const cp of checkpoints) {
    if (!cp.depends_on || cp.depends_on.length === 0) {
      reachableSet.add(cp.checkpoint_id);
      queue.push(cp.checkpoint_id);
    }
  }

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const nextNodes = forwardAdj.get(curr) || [];
    for (const next of nextNodes) {
      if (!reachableSet.has(next)) {
        reachableSet.add(next);
        queue.push(next);
      }
    }
  }

  for (const cp of checkpoints) {
    if (!reachableSet.has(cp.checkpoint_id)) {
      issues.push({
        level: "warning",
        checkpointId: cp.checkpoint_id,
        rule: "unreachable_node",
        message: `Node "${cp.checkpoint_id}" không có đường dẫn tới từ bất kỳ node khởi đầu nào (unreachable node).`,
      });
    }
  }

  // 4. Kiểm tra cấu hình đáp án theo kind
  for (const cp of checkpoints) {
    const cfg = (cp.answer_config || {}) as Record<string, any>;
    const kind = cp.kind || cp.type;

    if (kind === "followup") {
      const inputType = cfg.input_type || cfg.inputType || "text";
      const correctAnswer = cfg.correct_answer || cfg.correctAnswer;
      if (inputType === "choice") {
        const options = cfg.options || [];
        if (!Array.isArray(options) || options.length < 2) {
          issues.push({
            level: "error",
            checkpointId: cp.checkpoint_id,
            rule: "missing_answer",
            message: "Câu hỏi trắc nghiệm (choice) cần ít nhất 2 phương án lựa chọn trong options.",
          });
        }
      }
      if (!correctAnswer && inputType !== "text") {
        issues.push({
          level: "warning",
          checkpointId: cp.checkpoint_id,
          rule: "missing_answer",
          message: `Câu hỏi đào sâu (${inputType}) chưa thiết lập đáp án đúng (correct_answer).`,
        });
      }
    } else if (kind === "phone_lookup") {
      const inputs = cfg.text_match_inputs || cfg.textMatchInputs;
      if (!Array.isArray(inputs) || inputs.length === 0) {
        issues.push({
          level: "warning",
          checkpointId: cp.checkpoint_id,
          rule: "missing_answer",
          message: "Tra cứu danh bạ (phone_lookup) chưa cấu hình danh sách trường số điện thoại.",
        });
      }
    } else if (kind === "suspect_interrogation") {
      const motive = cfg.motive_evidence_ids || cfg.motiveEvidenceIds || [];
      const contradiction =
        cfg.contradiction_evidence_ids || cfg.contradictionEvidenceIds || [];
      if (motive.length === 0 && contradiction.length === 0) {
        issues.push({
          level: "warning",
          checkpointId: cp.checkpoint_id,
          rule: "missing_answer",
          message: "Thẩm tra nghi phạm chưa cấu hình mã chứng cứ động cơ hoặc mâu thuẫn.",
        });
      }
    } else if (kind === "indictment") {
      const suspects = cfg.valid_suspects || cfg.validSuspects || [];
      const required =
        cfg.required_evidence_ids || cfg.requiredEvidenceIds || [];
      if (suspects.length === 0) {
        issues.push({
          level: "error",
          checkpointId: cp.checkpoint_id,
          rule: "missing_answer",
          message: "Cáo trạng (indictment) chưa chỉ định hung thủ hợp lệ (valid_suspects).",
        });
      }
      if (required.length === 0) {
        issues.push({
          level: "warning",
          checkpointId: cp.checkpoint_id,
          rule: "missing_answer",
          message: "Cáo trạng chưa chỉ định danh sách mã chứng cứ bắt buộc (required_evidence_ids).",
        });
      }
    }

    // 5. Kiểm tra mã chứng cứ có tồn tại trên catalogue (nếu danh mục evidences được cung cấp)
    if (availableEvidenceCodes.length > 0) {
      const codesToCheck = [
        ...(cfg.required_evidence_ids || cfg.requiredEvidenceIds || []),
        ...(cfg.motive_evidence_ids || cfg.motiveEvidenceIds || []),
        ...(cfg.contradiction_evidence_ids ||
          cfg.contradictionEvidenceIds ||
          []),
        ...(cfg.photo_codes || cfg.photoCodes || []),
      ];

      const cleanPool = new Set(
        availableEvidenceCodes.map((c) =>
          c.trim().toLowerCase().replace(/[^a-z0-9]/g, ""),
        ),
      );

      for (const code of codesToCheck) {
        const clean = String(code).trim().toLowerCase().replace(/[^a-z0-9]/g, "");
        if (clean && !cleanPool.has(clean)) {
          issues.push({
            level: "info",
            checkpointId: cp.checkpoint_id,
            rule: "unknown_evidence_code",
            message: `Mã chứng cứ "${code}" không tìm thấy trong danh mục vật chứng của vụ án.`,
          });
        }
      }
    }
  }

  const errorCount = issues.filter((i) => i.level === "error").length;
  const warningCount = issues.filter((i) => i.level === "warning").length;

  return {
    isValid: errorCount === 0,
    issues,
    errorCount,
    warningCount,
  };
}
