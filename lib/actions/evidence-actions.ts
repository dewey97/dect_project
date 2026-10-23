"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdminAuth } from "@/lib/auth/admin";
import { normalizeCaseId } from "@/lib/cases/case-id";
import { revalidatePath } from "next/cache";
import type {
  DbCaseEvidence,
  DbCaseWithEvidenceConfig,
} from "@/lib/types/database";

// ── 1. Đọc danh sách chứng cứ vụ án ──

export async function getCaseEvidence(caseId: string) {
  try {
    const slug = normalizeCaseId(caseId);
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("case_evidence")
      .select("*")
      .eq("case_slug", slug)
      .order("phase", { ascending: true })
      .order("slot_index", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw error;
    return { success: true, data: (data || []) as DbCaseEvidence[] };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg, data: [] as DbCaseEvidence[] };
  }
}

export async function getCaseEvidenceByCode(caseId: string, code: string) {
  try {
    const slug = normalizeCaseId(caseId);
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("case_evidence")
      .select("*")
      .eq("case_slug", slug)
      .eq("code", code)
      .maybeSingle();

    if (error) throw error;
    return { success: true, data: data as DbCaseEvidence | null };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg, data: null };
  }
}

// ── 2. Thêm / Cập nhật chứng cứ ──

export async function upsertCaseEvidence(
  evidence: Partial<DbCaseEvidence> & {
    case_slug: string;
    code: string;
    title: string;
  },
) {
  try {
    await requireAdminAuth();
    const slug = normalizeCaseId(evidence.case_slug);
    const supabase = await createClient();

    const payload = {
      ...evidence,
      case_slug: slug,
      metadata: evidence.metadata || {},
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("case_evidence")
      .upsert(payload, { onConflict: "case_slug,code" })
      .select()
      .single();

    if (error) throw error;
    revalidatePath("/(admin)/studio/evidence", "page");
    return { success: true, data: data as DbCaseEvidence };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg };
  }
}

// ── 3. Xóa chứng cứ ──

export async function deleteCaseEvidence(id: string) {
  try {
    await requireAdminAuth();
    const supabase = await createClient();
    const { error } = await supabase
      .from("case_evidence")
      .delete()
      .eq("id", id);

    if (error) throw error;
    revalidatePath("/(admin)/studio/evidence", "page");
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg };
  }
}

// ── 4. Cấu hình ảnh Hiện trường 360 & Panorama của vụ án ──

export async function getCase360Config(caseId: string) {
  try {
    const slug = normalizeCaseId(caseId);
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cases")
      .select("id, slug, title, panorama_url, scene_360_url")
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw error;
    return {
      success: true,
      data: data as (DbCaseWithEvidenceConfig & { title: string }) | null,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg, data: null };
  }
}

export async function updateCase360Config(
  caseId: string,
  config: { panorama_url?: string | null; scene_360_url?: string | null },
) {
  try {
    await requireAdminAuth();
    const slug = normalizeCaseId(caseId);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("cases")
      .update({
        ...config,
        updated_at: new Date().toISOString(),
      })
      .eq("slug", slug)
      .select("id, slug, panorama_url, scene_360_url")
      .single();

    if (error) throw error;
    revalidatePath("/(admin)/studio/evidence", "page");
    return { success: true, data };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg };
  }
}

// ── 5. Tải file tài liệu / hình ảnh lên Storage Bucket 'evidence-assets' ──

export async function uploadEvidenceAsset(formData: FormData) {
  try {
    await requireAdminAuth();
    const file = formData.get("file") as File | null;
    const caseId = (formData.get("caseId") as string) || "case_000";
    const subfolder = (formData.get("subfolder") as string) || "misc";

    if (!file) {
      return { success: false, error: "Tệp tin không được để trống" };
    }

    const slug = normalizeCaseId(caseId);
    const supabase = await createClient();

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `cases/${slug}/${subfolder}/${Date.now()}_${safeName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("evidence-assets")
      .upload(filePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: pubData } = supabase.storage
      .from("evidence-assets")
      .getPublicUrl(filePath);

    return {
      success: true,
      url: pubData.publicUrl,
      path: filePath,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg };
  }
}

// ── 6. Nhân bản chứng cứ sang vụ án mới (duplicateEvidenceData) ──

export async function duplicateEvidenceData(
  sourceSlug: string,
  targetSlug: string,
) {
  try {
    await requireAdminAuth();
    const fromSlug = normalizeCaseId(sourceSlug);
    const toSlug = normalizeCaseId(targetSlug);
    const supabase = await createClient();

    // 1. Sao chép case_evidence
    const { data: evidenceItems, error: fetchErr } = await supabase
      .from("case_evidence")
      .select("*")
      .eq("case_slug", fromSlug);

    if (fetchErr) throw fetchErr;

    let clonedCount = 0;
    if (evidenceItems && evidenceItems.length > 0) {
      const cloned = (evidenceItems as DbCaseEvidence[]).map(
        ({ id: _id, created_at: _c, updated_at: _u, ...rest }) => ({
          ...rest,
          case_slug: toSlug,
        }),
      );
      const { error: insertErr } = await supabase
        .from("case_evidence")
        .insert(cloned);

      if (insertErr) throw insertErr;
      clonedCount = cloned.length;
    }

    // 2. Sao chép panorama_url & scene_360_url từ vụ nguồn nếu có
    const { data: sourceCase } = await supabase
      .from("cases")
      .select("panorama_url, scene_360_url")
      .eq("slug", fromSlug)
      .maybeSingle();

    if (sourceCase && (sourceCase.panorama_url || sourceCase.scene_360_url)) {
      await supabase
        .from("cases")
        .update({
          panorama_url: sourceCase.panorama_url,
          scene_360_url: sourceCase.scene_360_url,
          updated_at: new Date().toISOString(),
        })
        .eq("slug", toSlug);
    }

    return { success: true, count: clonedCount };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg, count: 0 };
  }
}
