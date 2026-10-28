"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  DossierMode,
  PaperConfig,
  LoiKhaiData,
  LyLichData,
} from "@/types/dossier";
import { requireAdminAuth } from "@/lib/auth/admin";

export interface DbDossierDocument {
  id: string;
  case_id: string;
  mode: DossierMode;
  tag_code: string;
  subject_name: string;
  paper_config: PaperConfig;
  content: LoiKhaiData | LyLichData;
  created_at: string;
  updated_at: string;
}

/** Lấy danh sách hồ sơ theo case_id và mode (loi_khai / ly_lich) từ Supabase */
export async function getDossierDocuments(
  caseId: string = "case_000",
  mode?: DossierMode,
) {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("dossier_documents")
      .select("*")
      .eq("case_id", caseId)
      .order("created_at", { ascending: true });

    if (mode) {
      query = query.eq("mode", mode);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Sắp xếp theo sortOrder trong content (nếu có), nếu bằng nhau thì theo created_at
    const sorted = (data || []).sort(
      (a: DbDossierDocument, b: DbDossierDocument) => {
        const contentA = a.content as unknown as Record<string, unknown> | null;
        const contentB = b.content as unknown as Record<string, unknown> | null;
        const orderA =
          typeof contentA?.sortOrder === "number" ? contentA.sortOrder : 999999;
        const orderB =
          typeof contentB?.sortOrder === "number" ? contentB.sortOrder : 999999;
        if (orderA !== orderB) return orderA - orderB;
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      },
    );

    return { success: true, data: sorted as DbDossierDocument[] };
  } catch (error: unknown) {
    console.error("Error fetching dossier documents:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      data: [],
    };
  }
}

/** Lưu hoặc cập nhật hồ sơ vào Supabase */
export async function saveDossierDocument(params: {
  caseId?: string;
  mode: DossierMode;
  tagCode: string;
  subjectName: string;
  paperConfig: PaperConfig;
  content: LoiKhaiData | LyLichData;
}) {
  try {
    await requireAdminAuth();
    const supabase = await createClient();
    const caseId = params.caseId || "case_000";

    const payload = {
      case_id: caseId,
      mode: params.mode,
      tag_code: params.tagCode,
      subject_name: params.subjectName,
      paper_config: params.paperConfig,
      content: params.content,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("dossier_documents")
      .upsert(payload, { onConflict: "case_id,mode,tag_code" })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/studio/dossier");
    return { success: true, data: data as DbDossierDocument };
  } catch (error: unknown) {
    console.error("Error saving dossier document:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/** Lưu đồng loạt danh sách hồ sơ (Cả Lời Khai và Lý Lịch) vào Supabase */
export async function saveDossierDocumentsBatch(
  documents: {
    caseId?: string;
    mode: DossierMode;
    tagCode: string;
    subjectName: string;
    paperConfig: PaperConfig;
    content: LoiKhaiData | LyLichData;
  }[],
) {
  try {
    await requireAdminAuth();
    if (!documents.length) return { success: true, data: [] };
    const supabase = await createClient();

    const payload = documents.map((doc) => ({
      case_id: doc.caseId || "case_000",
      mode: doc.mode,
      tag_code: doc.tagCode,
      subject_name: doc.subjectName,
      paper_config: doc.paperConfig,
      content: doc.content,
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from("dossier_documents")
      .upsert(payload, { onConflict: "case_id,mode,tag_code" })
      .select();

    if (error) throw error;

    revalidatePath("/studio/dossier");
    return { success: true, data: (data || []) as DbDossierDocument[] };
  } catch (error: unknown) {
    console.error("Error batch saving dossier documents:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      data: [],
    };
  }
}

/** Lưu thứ tự danh sách hồ sơ sau khi bấm nút Đẩy Trái / Đẩy Phải */
export async function reorderDossierDocuments(
  orderedDocIds: {
    id: string;
    sortOrder: number;
    content: Record<string, unknown>;
  }[],
) {
  try {
    await requireAdminAuth();
    const supabase = await createClient();
    const updates = orderedDocIds.map((doc) => {
      const updatedContent = {
        ...doc.content,
        sortOrder: doc.sortOrder,
      };
      return supabase
        .from("dossier_documents")
        .update({
          content: updatedContent,
          updated_at: new Date().toISOString(),
        })
        .eq("id", doc.id);
    });

    await Promise.all(updates);
    revalidatePath("/studio/dossier");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error reordering dossier documents:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/** Xóa hồ sơ khỏi Supabase */
export async function deleteDossierDocument(id: string) {
  try {
    await requireAdminAuth();
    const supabase = await createClient();
    const { error } = await supabase
      .from("dossier_documents")
      .delete()
      .eq("id", id);

    if (error) throw error;
    revalidatePath("/studio/dossier");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting dossier document:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
