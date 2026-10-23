import { google } from "googleapis";
import { createGoogleAuth } from "@/lib/google/auth";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { denyIfNotAdmin } from "@/lib/security/admin-route-guard";

export const dynamic = "force-dynamic";

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const DEFAULT_SPREADSHEET_ID =
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID ||
  "1h2P9VaBC9PELUMhipo6ze1SkJIVv3IOm5SP3ynURm4Q";

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

    const auth = createGoogleAuth(SHEETS_SCOPE);
    if (!auth) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Không tìm thấy Service Account credentials để ghi vào Google Sheet.",
        },
        { status: 500 },
      );
    }

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = DEFAULT_SPREADSHEET_ID;

    {
      // Tab evidences headers:
      // case_id, code, bộ hồ sơ, label, category, pin_on_board, is_suspect, drive_url, description
      const code = pin.id || `pin_${Date.now()}`;
      const dossier = pin.pinType === "dossier" ? "HỒ SƠ" : "TANG VẬT BẢNG";
      const label = pin.label || "Vật chứng ghim";
      const category = pin.pinType || "note";
      const pinOnBoard = "TRUE";
      const isSuspect = "FALSE";
      const driveUrl = pin.photoUrl || pin.noteTextureUrl || "";
      const description = pin.detail || "";

      const rowValues = [
        caseId,
        code,
        dossier,
        label,
        category,
        pinOnBoard,
        isSuspect,
        driveUrl,
        description,
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "evidences!A:I",
        valueInputOption: "RAW",
        requestBody: {
          values: [rowValues],
        },
      });

      return NextResponse.json({
        success: true,
        tab: "evidences",
        code,
        message: `Đã đồng bộ vật chứng [${label}] lên Google Sheet tab evidences!`,
      });
    }
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
