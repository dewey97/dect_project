import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { DbCaseCheckpoint } from "@/lib/types/database";
import { normalizeCaseId } from "@/lib/cases/case-id";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Runtime checkpoint feed — đọc trực tiếp Checkpoint Studio (Supabase).
 * Nguồn duy nhất: bảng `case_checkpoints`.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const caseId = normalizeCaseId(searchParams.get("caseId") || "case_000");
  const isPublicOnly = searchParams.get("mode") === "public";

  try {
    const supabase = await createClient();

    // Nếu yêu cầu chế độ public hoặc bảng view migration 27 đã có:
    if (isPublicOnly) {
      const publicViewQuery = await supabase
        .from("case_checkpoints_public")
        .select("*")
        .eq("case_id", caseId)
        .order("dossier", { ascending: true })
        .order("checkpoint_id", { ascending: true });

      if (!publicViewQuery.error && publicViewQuery.data) {
        const res = NextResponse.json({
          success: true,
          caseId,
          totalCount: publicViewQuery.data.length,
          data: publicViewQuery.data as DbCaseCheckpoint[],
        });
        res.headers.set(
          "Cache-Control",
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        );
        return res;
      }
    }

    // Thử truy vấn có kind và subject_key (migration 26).
    // Nếu DB chưa chạy migration 26 (code 42703: undefined column),
    // fallback sang truy vấn cũ để đảm bảo tương thích ngược.
    let data: Partial<DbCaseCheckpoint>[] | null = null;

    const modernQuery = await supabase
      .from("case_checkpoints")
      .select(
        "id, case_id, checkpoint_id, node_id, dossier, title, question, type, kind, subject_key, question_type, unlocked_evidence_id, followup_of, suspect_label, evidence_step_label, depends_on, answer_config, hints, narrative, ai_context, ai_valid_cases, ai_invalid_cases, created_at, updated_at",
      )
      .eq("case_id", caseId)
      .order("dossier", { ascending: true })
      .order("checkpoint_id", { ascending: true });

    if (
      modernQuery.error &&
      (modernQuery.error.code === "42703" ||
        modernQuery.error.message?.includes("kind"))
    ) {
      const legacyQuery = await supabase
        .from("case_checkpoints")
        .select(
          "id, case_id, checkpoint_id, node_id, dossier, title, question, type, question_type, unlocked_evidence_id, followup_of, suspect_label, evidence_step_label, depends_on, answer_config, hints, narrative, ai_context, ai_valid_cases, ai_invalid_cases, created_at, updated_at",
        )
        .eq("case_id", caseId)
        .order("dossier", { ascending: true })
        .order("checkpoint_id", { ascending: true });

      if (legacyQuery.error) throw legacyQuery.error;
      // Polyfill kind & subject_key cho code client trước migration
      data = (legacyQuery.data || []).map((row) => ({
        ...row,
        kind: row.type || "text",
        subject_key: null,
      }));
    } else if (modernQuery.error) {
      throw modernQuery.error;
    } else {
      data = modernQuery.data;
    }

    const res = NextResponse.json({
      success: true,
      caseId,
      totalCount: (data || []).length,
      data: (data || []) as DbCaseCheckpoint[],
    });
    res.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    return res;
  } catch (error: unknown) {
    console.error("Error loading Studio checkpoints:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Không tải được checkpoint từ Studio.";
    const res = NextResponse.json(
      {
        success: false,
        caseId,
        data: [],
        error: message,
      },
      { status: 500 },
    );
    res.headers.set("Cache-Control", "no-store");
    return res;
  }
}
