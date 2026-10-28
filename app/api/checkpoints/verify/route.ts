import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeCaseId } from "@/lib/cases/case-id";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";
import {
  gradeCheckpoint,
  type CheckpointSubmission,
} from "@/lib/checkpoints/server-grader";
import type { DbCaseCheckpoint } from "@/lib/types/database";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Endpoint chấm điểm checkpoint server-side.
 * Giấu hoàn toàn answer_config khỏi client runtime.
 * Rate limit: 30 requests / phút / IP.
 */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateKey = `verify_cp:${ip}`;
  const rateResult = checkRateLimit(rateKey, { limit: 30, windowMs: 60_000 });

  if (!rateResult.allowed) {
    const res = NextResponse.json(
      {
        success: false,
        error: "Quá nhiều yêu cầu giải đố. Vui lòng thử lại sau giây lát.",
        retryAfter: rateResult.retryAfterSeconds,
      },
      { status: 429 },
    );
    res.headers.set("Retry-After", String(rateResult.retryAfterSeconds));
    res.headers.set("Cache-Control", "no-store");
    return res;
  }

  try {
    const body = (await request.json()) as Partial<CheckpointSubmission>;
    const rawCaseId = body.caseId || "case_000";
    const checkpointId = body.checkpointId;

    if (!checkpointId) {
      return NextResponse.json(
        { success: false, error: "Thiếu checkpointId." },
        { status: 400 },
      );
    }

    const caseId = normalizeCaseId(rawCaseId);
    const supabase = createAdminClient();

    // Lấy checkpoint đầy đủ từ DB (bao gồm answer_config nội bộ)
    const { data: checkpoint, error: fetchErr } = await supabase
      .from("case_checkpoints")
      .select("*")
      .eq("case_id", caseId)
      .eq("checkpoint_id", checkpointId)
      .maybeSingle();

    if (fetchErr) {
      console.error("DB error fetching checkpoint for grading:", fetchErr);
      return NextResponse.json(
        { success: false, error: "Lỗi truy vấn cơ sở dữ liệu." },
        { status: 500 },
      );
    }

    if (!checkpoint) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy checkpoint." },
        { status: 404 },
      );
    }

    const grade = gradeCheckpoint(checkpoint as DbCaseCheckpoint, {
      caseId,
      checkpointId,
      answer: body.answer,
      selectedCodes: body.selectedCodes,
      motiveCodes: body.motiveCodes,
      contradictionCodes: body.contradictionCodes,
      inputs: body.inputs,
      suspect: body.suspect,
      motive: body.motive,
    });

    const res = NextResponse.json({
      success: true,
      caseId,
      checkpointId,
      correct: grade.correct,
      feedback: grade.feedback,
      culprit: grade.culprit,
      unlocksDossier: grade.unlocksDossier,
      stageResults: grade.stageResults,
    });

    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return res;
  } catch (error: unknown) {
    console.error("Error in /api/checkpoints/verify:", error);
    const message =
      error instanceof Error ? error.message : "Lỗi xử lý yêu cầu chấm điểm.";
    const res = NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 },
    );
    res.headers.set("Cache-Control", "no-store");
    return res;
  }
}
