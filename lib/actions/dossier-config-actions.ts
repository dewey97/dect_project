"use server";

import { createClient } from "@/lib/supabase/server";
import type { DbCaseDossier } from "@/lib/types/database";
import { requireAdminAuth } from "@/lib/auth/admin";

export interface AvailableDocumentItem {
  code: string;
  title: string;
  category: "loi_khai" | "ly_lich" | "evidence";
  description?: string;
}

/** Lấy toàn bộ danh sách Bộ Hồ Sơ của vụ án từ bảng case_dossiers */
export async function getCaseDossiers(caseId: string = "case_000"): Promise<DbCaseDossier[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("case_dossiers")
      .select("*")
      .eq("case_id", caseId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[getCaseDossiers] Error fetching dossiers:", error);
      return [];
    }

    return (data || []) as DbCaseDossier[];
  } catch (err) {
    console.error("[getCaseDossiers] Unexpected error:", err);
    return [];
  }
}

/** Lưu hoặc cập nhật cấu hình Bộ Hồ Sơ (danh sách mã tài liệu, tiêu đề, mô tả) */
export async function saveCaseDossier(
  caseId: string,
  payload: {
    dossierKey: string;
    title: string;
    documentCodes: string[];
    description?: string;
    flowPosition?: { x: number; y: number } | null;
  },
): Promise<{ ok: boolean; error?: string; dossier?: DbCaseDossier }> {
  try {
    await requireAdminAuth();
    const supabase = await createClient();

    const upsertData = {
      case_id: caseId,
      dossier_key: payload.dossierKey.trim().toLowerCase(),
      title: payload.title.trim(),
      document_codes: Array.from(new Set(payload.documentCodes.map((c) => c.trim()).filter(Boolean))),
      description: payload.description?.trim() || null,
      flow_position: payload.flowPosition || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("case_dossiers")
      .upsert(upsertData, { onConflict: "case_id,dossier_key" })
      .select("*")
      .single();

    if (error) {
      console.error("[saveCaseDossier] Error upserting dossier:", error);
      return { ok: false, error: error.message };
    }

    return { ok: true, dossier: data as DbCaseDossier };
  } catch (err: any) {
    console.error("[saveCaseDossier] Unexpected error:", err);
    return { ok: false, error: err?.message || "Lỗi không xác định khi lưu bộ hồ sơ" };
  }
}

/** Xóa một bộ hồ sơ khỏi vụ án */
export async function deleteCaseDossier(
  caseId: string,
  dossierKey: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdminAuth();
    const supabase = await createClient();
    const { error } = await supabase
      .from("case_dossiers")
      .delete()
      .eq("case_id", caseId)
      .eq("dossier_key", dossierKey);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Lỗi khi xóa bộ hồ sơ" };
  }
}

/** Lấy danh mục tất cả tài liệu có trong Dossier Studio để hiển thị checklist lựa chọn */
export async function getAllCaseDocumentsCatalog(
  caseId: string = "case_000",
): Promise<AvailableDocumentItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("dossier_documents")
      .select("tag_code, subject_name, mode, content")
      .eq("case_id", caseId)
      .order("tag_code", { ascending: true });

    if (error) {
      console.error("[getAllCaseDocumentsCatalog] Error:", error);
      return [];
    }

    const list: AvailableDocumentItem[] = (data || []).map((doc: any) => {
      const code = (doc.tag_code || "").trim();
      const rawContent = doc.content || {};
      const title =
        doc.mode === "ly_lich"
          ? (doc.subject_name ? `Lý lịch: ${doc.subject_name}` : `Lý lịch #${code}`)
          : (rawContent.docTitle || (doc.subject_name ? `Lời khai: ${doc.subject_name}` : `Lời khai #${code}`));

      return {
        code,
        title,
        category: doc.mode as "loi_khai" | "ly_lich",
        description: rawContent.reasonText || rawContent.caseSubtitle,
      };
    });

    return list;
  } catch (err) {
    console.error("[getAllCaseDocumentsCatalog] Error:", err);
    return [];
  }
}
