"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { DbCaseCheckpoint } from "@/lib/types/database";
import {
  toRowPayload,
  type CheckpointDependencyUpdate,
  type CheckpointPositionUpdate,
  type CheckpointStudioDraft,
} from "@/lib/types/checkpoint-studio";
import { validateDependencyUpdates } from "@/lib/cms/checkpoint-graph";
import { requireAdminAuth } from "./auth-guard";

const STUDIO_PATH = "/studio/checkpoints";

type CheckpointListResult =
  | { success: true; data: DbCaseCheckpoint[] }
  | { success: false; error: string; data: DbCaseCheckpoint[] };

type CheckpointRowResult =
  { success: true; data: DbCaseCheckpoint } | { success: false; error: string };

type CheckpointMutationResult =
  { success: true } | { success: false; error: string };

/** Lấy danh sách checkpoint của một vụ án từ bảng case_checkpoints. */
export async function getCheckpointsByCase(
  caseId: string = "case_000",
): Promise<CheckpointListResult> {
  try {
    await requireAdminAuth();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("case_checkpoints")
      .select("*")
      .eq("case_id", caseId)
      .order("dossier", { ascending: true })
      .order("checkpoint_id", { ascending: true });

    if (error) throw error;

    return { success: true, data: (data || []) as DbCaseCheckpoint[] };
  } catch (error: any) {
    console.error("Error fetching checkpoints:", error);
    return {
      success: false,
      error: error.message || "Không tải được danh sách checkpoint.",
      data: [],
    };
  }
}

/** Tạo mới hoặc cập nhật một checkpoint trong Studio. */
export async function saveCheckpoint(
  draft: CheckpointStudioDraft,
): Promise<CheckpointRowResult> {
  try {
    await requireAdminAuth();

    if (draft.type !== "evidence_picker") {
      return {
        success: false,
        error: `Loại ${draft.type || "(trống)"} chưa hỗ trợ biên tập trong V1.`,
      };
    }

    const checkpointId = draft.checkpointId.trim() || draft.nodeId.trim();
    if (!checkpointId) {
      return { success: false, error: "Node ID không được để trống." };
    }
    if (!draft.caseId.trim()) {
      return { success: false, error: "Vụ án không hợp lệ." };
    }

    const supabase = await createClient();
    const payload = toRowPayload(draft);

    if (draft.id) {
      const { data: existing, error: existingError } = await supabase
        .from("case_checkpoints")
        .select("case_id, checkpoint_id")
        .eq("id", draft.id)
        .single();

      if (existingError) throw existingError;
      if (existing.checkpoint_id !== checkpointId) {
        return {
          success: false,
          error:
            "Mã checkpoint không thể đổi sau khi tạo vì đang được đồ thị phụ thuộc tham chiếu.",
        };
      }
      if (existing.case_id !== payload.case_id) {
        return { success: false, error: "Không thể đổi vụ án của checkpoint." };
      }

      const { data, error } = await supabase
        .from("case_checkpoints")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", draft.id)
        .select()
        .single();

      if (error) throw error;
      revalidatePath(STUDIO_PATH);
      return { success: true, data: data as DbCaseCheckpoint };
    }

    const { data, error } = await supabase
      .from("case_checkpoints")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    revalidatePath(STUDIO_PATH);
    return { success: true, data: data as DbCaseCheckpoint };
  } catch (error: any) {
    if (error?.code === "23505") {
      return {
        success: false,
        error: `Node "${draft.nodeId.trim() || draft.checkpointId.trim()}" đã tồn tại trong vụ án này.`,
      };
    }
    console.error("Error saving checkpoint:", error);
    return {
      success: false,
      error: error.message || "Không lưu được checkpoint.",
    };
  }
}

/** Xóa một checkpoint khỏi Studio. */
export async function deleteCheckpoint(
  id: string,
): Promise<CheckpointMutationResult> {
  try {
    await requireAdminAuth();

    if (!id) {
      return { success: false, error: "Thiếu ID checkpoint." };
    }

    const supabase = await createClient();
    const { data: existing, error: existingError } = await supabase
      .from("case_checkpoints")
      .select("case_id, checkpoint_id")
      .eq("id", id)
      .single();

    if (existingError) throw existingError;

    const { error } = await supabase
      .from("case_checkpoints")
      .delete()
      .eq("id", id);

    if (error) throw error;

    // Dọn tham chiếu treo trong depends_on của các checkpoint cùng vụ án.
    const { data: dependents, error: dependentsError } = await supabase
      .from("case_checkpoints")
      .select("id, depends_on")
      .eq("case_id", existing.case_id)
      .contains("depends_on", [existing.checkpoint_id]);

    if (dependentsError) {
      console.error("Error loading dependents after delete:", dependentsError);
    } else if (dependents?.length) {
      const results = await Promise.all(
        dependents.map((row) =>
          supabase
            .from("case_checkpoints")
            .update({
              depends_on: (row.depends_on || []).filter(
                (dependency: string) => dependency !== existing.checkpoint_id,
              ),
              updated_at: new Date().toISOString(),
            })
            .eq("id", row.id),
        ),
      );
      const cleanupError = results.find((result) => result.error)?.error;
      if (cleanupError) {
        console.error(
          "Error cleaning dependencies after delete:",
          cleanupError,
        );
      }
    }

    revalidatePath(STUDIO_PATH);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting checkpoint:", error);
    return {
      success: false,
      error: error.message || "Không xóa được checkpoint.",
    };
  }
}

/** Lưu vị trí node trên Flow view cho một batch checkpoint. */
export async function updateCheckpointPositions(
  caseId: string,
  updates: CheckpointPositionUpdate[],
): Promise<CheckpointMutationResult> {
  try {
    await requireAdminAuth();

    if (!caseId.trim()) {
      return { success: false, error: "Vụ án không hợp lệ." };
    }
    if (!updates.length) {
      return { success: true };
    }

    const valid = updates.filter(
      (update) =>
        update.checkpointId.trim() &&
        Number.isFinite(update.position.x) &&
        Number.isFinite(update.position.y),
    );
    if (valid.length !== updates.length) {
      return { success: false, error: "Vị trí node không hợp lệ." };
    }

    const supabase = await createClient();
    const results = await Promise.all(
      valid.map((update) =>
        supabase
          .from("case_checkpoints")
          .update({
            flow_position: {
              x: Math.round(update.position.x),
              y: Math.round(update.position.y),
            },
            updated_at: new Date().toISOString(),
          })
          .eq("case_id", caseId)
          .eq("checkpoint_id", update.checkpointId),
      ),
    );

    const writeError = results.find((result) => result.error)?.error;
    if (writeError) throw writeError;

    revalidatePath(STUDIO_PATH);
    return { success: true };
  } catch (error: any) {
    console.error("Error updating checkpoint positions:", error);
    return {
      success: false,
      error: error.message || "Không lưu được vị trí node.",
    };
  }
}

/**
 * Ghi quan hệ phụ thuộc cho một batch checkpoint. Chỉ dùng trong Studio.
 */
export async function updateCheckpointDependencies(
  caseId: string,
  updates: CheckpointDependencyUpdate[],
): Promise<CheckpointMutationResult> {
  try {
    await requireAdminAuth();

    if (!caseId.trim()) {
      return { success: false, error: "Vụ án không hợp lệ." };
    }
    if (!updates.length) {
      return { success: true };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("case_checkpoints")
      .select("*")
      .eq("case_id", caseId);

    if (error) throw error;

    const rows = (data || []) as DbCaseCheckpoint[];
    const validation = validateDependencyUpdates(rows, updates);
    if (!validation.ok) {
      return { success: false, error: validation.error };
    }

    const results = await Promise.all(
      updates.map((update) =>
        supabase
          .from("case_checkpoints")
          .update({
            depends_on: validation.dependencies[update.checkpointId] || [],
            updated_at: new Date().toISOString(),
          })
          .eq("case_id", caseId)
          .eq("checkpoint_id", update.checkpointId),
      ),
    );

    const writeError = results.find((result) => result.error)?.error;
    if (writeError) throw writeError;

    revalidatePath(STUDIO_PATH);
    return { success: true };
  } catch (error: any) {
    console.error("Error updating checkpoint dependencies:", error);
    return {
      success: false,
      error: error.message || "Không lưu được quan hệ phụ thuộc.",
    };
  }
}
