import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DbCaseCheckpoint } from "@/lib/types/database";
import { normalizeCaseId } from "@/lib/cases/case-id";
import { toPublicCheckpointRow } from "@/lib/checkpoints/public-checkpoint";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Runtime checkpoint feed cho gameplay — đọc `case_checkpoints` bằng service
 * role rồi lọc bỏ đáp án (`toPublicCheckpointRow`). Client không đọc bảng gốc.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const caseId = normalizeCaseId(searchParams.get("caseId") || "case_000");

  try {
    const { data, error } = await createAdminClient()
      .from("case_checkpoints")
      .select("*")
      .eq("case_id", caseId)
      .order("dossier", { ascending: true })
      .order("checkpoint_id", { ascending: true });

    if (error) throw error;

    const rows = ((data || []) as DbCaseCheckpoint[]).map(
      toPublicCheckpointRow,
    );
    const res = NextResponse.json({
      success: true,
      caseId,
      totalCount: rows.length,
      data: rows,
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
      { success: false, caseId, data: [], error: message },
      { status: 500 },
    );
    res.headers.set("Cache-Control", "no-store");
    return res;
  }
}
