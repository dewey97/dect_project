"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { DbCaseCheckpoint } from "@/lib/types/database";
import {
  toRowPayload,
  type CheckpointStudioDraft,
} from "@/lib/types/checkpoint-studio";
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

    const checkpointId = draft.checkpointId.trim();
    if (!checkpointId) {
      return { success: false, error: "Mã checkpoint không được để trống." };
    }
    if (!draft.caseId.trim()) {
      return { success: false, error: "Vụ án không hợp lệ." };
    }

    const supabase = await createClient();
    const payload = toRowPayload(draft);

    if (draft.id) {
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
        error: `Mã checkpoint "${draft.checkpointId.trim()}" đã tồn tại trong vụ án này.`,
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
    const { error } = await supabase
      .from("case_checkpoints")
      .delete()
      .eq("id", id);

    if (error) throw error;
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
