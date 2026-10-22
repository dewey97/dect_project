"use server";

import { createClient } from "@/lib/supabase/server";
import type { DbCase, CaseStatus } from "@/lib/types/database";
import { revalidatePath } from "next/cache";
import { isValidCaseId, normalizeCaseId } from "@/lib/cases/case-id";
import { requireAdminAuth } from "@/lib/auth/admin";

/** Lấy thống kê tổng quan cho Dashboard */
export async function getDashboardStats() {
  try {
    await requireAdminAuth();
    const supabase = await createClient();

    // Đếm tổng số players
    const { count: playersCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "player");

    // Đếm tổng số vụ án
    const { count: casesCount } = await supabase
      .from("cases")
      .select("*", { count: "exact", head: true });

    // Đếm tổng số phiên chơi đang diễn ra
    const { count: activeSessionsCount } = await supabase
      .from("play_sessions")
      .select("*", { count: "exact", head: true })
      .eq("status", "PLAYING");

    return {
      success: true,
      data: {
        totalPlayers: playersCount || 0,
        totalCases: casesCount || 0,
        activeSessions: activeSessionsCount || 0,
      },
    };
  } catch (error: unknown) {
    console.error("Error fetching dashboard stats:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/** Lấy danh sách toàn bộ Vụ án (Cho trang /studio/cases) */
export async function getCases() {
  try {
    await requireAdminAuth();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cases")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data: data as DbCase[] };
  } catch (error: unknown) {
    console.error("Error fetching cases:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      data: [],
    };
  }
}

/** Tạo Vụ án mới (Bản nháp) */
export async function createCaseDraft(title: string = "Untitled Mystery") {
  try {
    await requireAdminAuth();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cases")
      .insert([{ title, status: "DRAFT" }])
      .select()
      .single();

    if (error) throw error;
    revalidatePath("/studio/cases");
    return { success: true, data: data as DbCase };
  } catch (error: unknown) {
    console.error("Error creating case draft:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/** Xóa Vụ án */
export async function deleteCase(caseId: string) {
  try {
    await requireAdminAuth();
    const supabase = await createClient();
    const { error } = await supabase.from("cases").delete().eq("id", caseId);

    if (error) throw error;

    revalidatePath("/studio/cases");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting case:", error);
    const errObj = error as { code?: string; message?: string } | null;
    return {
      success: false,
      error:
        errObj?.code === "23503"
          ? "Vụ án còn checkpoint, hồ sơ hoặc nhân vật. Xóa nội dung trước khi xóa vụ án."
          : errObj?.message || String(error),
    };
  }
}

/** Nhân bản Vụ án (Metadata) */
export async function duplicateCase(caseId: string) {
  try {
    await requireAdminAuth();
    const supabase = await createClient();

    // 1. Fetch case gốc
    const { data: c, error } = await supabase
      .from("cases")
      .select("*")
      .eq("id", caseId)
      .single();
    if (error) throw error;

    // 2. Insert case mới
    const { data: newCase, error: insertError } = await supabase
      .from("cases")
      .insert([
        {
          title: `Copy of ${c.title}`,
          synopsis: c.synopsis,
          full_story: c.full_story,
          difficulty: c.difficulty,
          status: "DRAFT",
          cover_image_url: c.cover_image_url,
        },
      ])
      .select()
      .single();
    if (insertError) throw insertError;

    revalidatePath("/studio/cases");
    return { success: true, data: newCase };
  } catch (error: unknown) {
    console.error("Error duplicating case:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/** Tạo một vụ án mới hoàn chỉnh với 2 node cơ bản: Hồ sơ ban đầu và Hậu án */
export async function createNewCase(title: string, customCaseId?: string) {
  try {
    await requireAdminAuth();
    const supabase = await createClient();

    if (!title.trim()) {
      return { success: false, error: "Vui lòng nhập tên vụ án." };
    }
    if (customCaseId?.trim() && !isValidCaseId(customCaseId)) {
      return {
        success: false,
        error:
          "Mã vụ án chỉ gồm chữ thường, số và dấu gạch dưới (vd: case_002).",
      };
    }

    // 1. Tạo bản ghi trong cases
    const { data: newCase, error: insertError } = await supabase
      .from("cases")
      .insert([
        {
          title: title.trim(),
          status: "DRAFT",
          // Bỏ trống slug để DB tự cấp mã tuần tự (trigger assign_case_slug).
          ...(customCaseId?.trim()
            ? { slug: normalizeCaseId(customCaseId) }
            : {}),
        },
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    // 2. Mã vụ án do DB cấp
    const normalizedCaseId = (newCase as DbCase).slug;

    // 3. Tự động sinh 2 node cốt lõi: Hồ sơ ban đầu và Hậu án
    const { error: seedError } = await supabase
      .from("case_checkpoints")
      .insert([
        {
          case_id: normalizedCaseId,
          checkpoint_id: "cp-start",
          title: "Hồ sơ ban đầu",
          type: "choice",
          kind: "choice",
          question: "Nghiên cứu tài liệu khởi đầu vụ án.",
          answer_config: {},
          hints: [],
        },
        {
          case_id: normalizedCaseId,
          checkpoint_id: "cp-epilogue",
          title: "Hậu án",
          type: "epilogue",
          kind: "epilogue",
          question: "Tổng kết vụ án",
          answer_config: {
            epilogueStories: [
              {
                id: "cp-epilogue-1",
                title: "Phần 1: Sự thật phơi bày",
                monologue: "",
              },
            ],
          },
          hints: [],
          depends_on: ["cp-start"],
        },
      ]);
    if (seedError) throw seedError;

    revalidatePath("/studio/checkpoints");
    revalidatePath("/studio/cases");

    return {
      success: true,
      data: newCase as DbCase,
      caseId: normalizedCaseId,
    };
  } catch (error: unknown) {
    console.error("Error creating new case:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Không tạo được vụ án mới.",
    };
  }
}
