import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { denyIfNotAdmin } from "@/lib/security/admin-route-guard";
import { normalizeCaseId } from "@/lib/cases/case-id";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const denied = await denyIfNotAdmin();
  if (denied) return denied;

  try {
    const body = await req.json();
    const {
      caseId = "case_000",
      target = "auto", // 'auto' | 'evidences' | 'checkpoints'
      pin,
    } = body;

    if (!pin) {
      return NextResponse.json(
        { success: false, error: "Thiếu dữ liệu pin." },
        { status: 400 },
      );
    }

    // Phân loại ghi:
    // custom question -> Checkpoint Studio (Supabase)
    // ảnh, dossier, sticky note -> tab evidences (Google Sheets)
    const isCheckpoint =
      target === "checkpoints" ||
      pin.actionType === "custom_question" ||
      Boolean(pin.question);

    if (isCheckpoint) {
      const checkpointId = String(
        pin.checkpointId || pin.id || `cp_${Date.now()}`,
      ).trim();
      const rawAnswers = String(pin.answers || "").trim();
      const hints = String(pin.hints || "")
        .split(/\r?\n/)
        .map((text) => text.trim())
        .filter(Boolean)
        .map((text) => ({ group: "general", text }));

      const supabase = await createClient();
      const { error } = await supabase.from("case_checkpoints").upsert(
        {
          case_id: String(caseId).trim().toLowerCase().replace(/-/g, "_"),
          checkpoint_id: checkpointId,
          node_id: checkpointId,
          dossier: pin.dossier || "BỘ MỞ RỘNG (WEB PIN)",
          title: pin.label || "Câu hỏi suy luận",
          question: pin.question || pin.label || "",
          type: pin.questionType || "text",
          question_type: pin.questionType || "text",
          unlocked_evidence_id: pin.unlockedEvidenceId || null,
          answer_config: {
            rawAnswers,
            options: [],
            correctAnswer: null,
            validSuspects: [],
            validMotives: [],
            requiredEvidenceIds: [],
            optionalEvidenceIds: [],
            motiveEvidenceIds: [],
            optionalMotiveIds: [],
            alibiEvidenceIds: [],
            optionalAlibiIds: [],
            contradictionEvidenceIds: [],
            optionalContradictionIds: [],
            textMatchInputs: [],
            photoCodes: [],
            availableEvidences: [],
          },
          hints,
          narrative: pin.detail || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "case_id,checkpoint_id" },
      );

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 },
        );
      }

      return NextResponse.json({
        success: true,
        tab: "checkpoints",
        checkpointId,
        message: `Đã đồng bộ checkpoint [${checkpointId}] vào Checkpoint Studio!`,
      });
    }

    // Tab evidences: Ghi trực tiếp vào Supabase case_evidence (Cắt bỏ Google Sheets runtime)
    const code = String(pin.id || `pin_${Date.now()}`).trim();
    const label = String(pin.label || "Vật chứng ghim").trim();
    const kind =
      pin.pinType === "dossier" ? "pdf" : pin.photoUrl ? "photo" : "object";
    const driveUrl = pin.photoUrl || pin.noteTextureUrl || null;
    const description = pin.detail || "";
    const caseSlug = normalizeCaseId(caseId);

    const supabase = await createClient();
    const { error: evError } = await supabase.from("case_evidence").upsert(
      {
        case_slug: caseSlug,
        code,
        title: label,
        kind,
        file_url: driveUrl,
        thumb_url: driveUrl,
        phase: 1,
        description,
        slot_index: 0,
        metadata: {
          pinType: pin.pinType || "note",
          pinOnBoard: true,
          dossier: pin.pinType === "dossier" ? "HỒ SƠ" : "TANG VẬT BẢNG",
        },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "case_slug,code" },
    );

    if (evError) {
      return NextResponse.json(
        { success: false, error: evError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      tab: "evidences",
      code,
      message: `Đã đồng bộ vật chứng [${label}] vào Supabase case_evidence!`,
    });
  } catch (error: unknown) {
    console.error("Lỗi khi đồng bộ pin:", error);
    const errorMsg =
      error instanceof Error
        ? error.message
        : "Lỗi không xác định khi đồng bộ pin.";
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 },
    );
  }
}
