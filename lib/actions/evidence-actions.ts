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


/** Lưu đồng loạt danh sách chứng cứ vào Supabase */
export async function upsertMultipleCaseEvidence(
  caseId: string,
  evidenceList: Partial<DbCaseEvidence>[],
) {
  try {
    await requireAdminAuth();
    if (!evidenceList.length) return { success: true, data: [] };
    const slug = normalizeCaseId(caseId);
    const supabase = await createClient();

    const payload = evidenceList.map((item) => {
      const cleanItem = { ...item };
      if (!cleanItem.id || cleanItem.id.startsWith("temp-")) {
        delete cleanItem.id;
      }
      return {
        ...cleanItem,
        case_slug: slug,
        code: cleanItem.code || ("ev_" + Date.now()),
        title: cleanItem.title || "Chưa đặt tên",
        kind: cleanItem.kind || "photo",
        metadata: cleanItem.metadata || {},
        updated_at: new Date().toISOString(),
      };
    });

    const { data, error } = await supabase
      .from("case_evidence")
      .upsert(payload, { onConflict: "case_slug,code" })
      .select();

    if (error) throw error;
    revalidatePath("/studio/dossier");
    return { success: true, data: (data || []) as DbCaseEvidence[] };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg, data: [] };
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


// ── 7. Trích xuất & Đồng bộ ảnh / vật chứng từ Google Sheets Live CMS ──

export async function syncEvidenceFromGoogleSheet(caseId: string = "case_000") {
  try {
    await requireAdminAuth();
    const slug = normalizeCaseId(caseId);
    const { createGoogleAuth } = await import("@/lib/google/auth");
    const { google } = await import("googleapis");
    const auth = createGoogleAuth("https://www.googleapis.com/auth/spreadsheets.readonly");
    if (!auth) {
      return { success: false, error: "Không tìm thấy cấu hình Google Service Account (google-service-account.json)" };
    }

    const sheets = google.sheets({ version: "v4", auth });
    const sheetId = process.env.GOOGLE_SHEETS_ID || "1h2P9VaBC9PELUMhipo6ze1SkJIVv3IOm5SP3ynURm4Q";

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "evidences!A1:Z100",
    });

    const rows = res.data.values || [];
    if (rows.length < 2) {
      return { success: false, error: "Không tìm thấy dữ liệu trong tab evidences của Google Sheets" };
    }

    const supabase = await createClient();
    const { data: studioDocs } = await supabase
      .from("dossier_documents")
      .select("tag_code")
      .eq("case_id", slug);
    const studioCodes = new Set((studioDocs || []).map((d) => (d.tag_code || "").trim().toUpperCase()));

    const updates: Partial<DbCaseEvidence>[] = [];

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      const code = (r[1] || "").trim();
      if (!code) continue;

      const title = (r[3] || code).trim();
      const driveUrl = (r[7] || "").trim();
      const description = (r[8] || "").trim();
      const cat = (r[4] || "").toUpperCase();

      // Loại trừ avatar hoặc marker hiện trường
      if (code.startsWith("avatar_") || code === "crime_scene") continue;

      // Loại trừ lời khai / lý lịch (soạn riêng trong Studio)
      const tLower = title.toLowerCase();
      if (
        tLower.includes("lời khai") ||
        tLower.includes("lý lịch") ||
        tLower.includes("trích lục") ||
        tLower.includes("biên bản lấy lời khai") ||
        studioCodes.has(code.toUpperCase())
      ) {
        continue;
      }

      // Trích xuất Drive ID thành proxy link
      const driveMatch = driveUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || driveUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      const driveId = driveMatch?.[1];
      const proxyUrl = driveId ? `/api/image-proxy?id=${driveId}` : (driveUrl || null);

      const isPdf = cat === "DOCUMENT" || tLower.includes("pdf") || tLower.includes("báo cáo") || tLower.includes("biên bản");
      const kind = isPdf ? "pdf" : "photo";

      updates.push({
        case_slug: slug,
        code,
        title,
        kind,
        file_url: driveUrl || null,
        thumb_url: proxyUrl,
        description: description || null,
        updated_at: new Date().toISOString(),
      });
    }

    for (const item of updates) {
      const payload: any = {
        case_slug: item.case_slug,
        code: item.code,
        title: item.title,
        kind: item.kind,
        description: item.description,
        updated_at: item.updated_at,
      };
      if (item.file_url) payload.file_url = item.file_url;
      if (item.thumb_url) payload.thumb_url = item.thumb_url;

      await supabase
        .from("case_evidence")
        .upsert(payload, { onConflict: "case_slug,code" });
    }

    revalidatePath("/studio/dossier");
    return { success: true, count: updates.length };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg };
  }
}
