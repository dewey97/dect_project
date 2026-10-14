import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const DEFAULT_SPREADSHEET_ID =
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID ||
  "1h2P9VaBC9PELUMhipo6ze1SkJIVv3IOm5SP3ynURm4Q";

function createGoogleAuth() {
  const inlineCredentials = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  if (inlineCredentials) {
    try {
      return new google.auth.GoogleAuth({
        credentials: JSON.parse(inlineCredentials),
        scopes: [SHEETS_SCOPE],
      });
    } catch (e) {
      console.error("Invalid GOOGLE_SERVICE_ACCOUNT_JSON format:", e);
    }
  }

  const relativeKeyPath =
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH || "google-service-account.json";

  const absoluteKeyPath = path.resolve(process.cwd(), relativeKeyPath);
  if (fs.existsSync(absoluteKeyPath)) {
    return new google.auth.GoogleAuth({
      keyFile: absoluteKeyPath,
      scopes: [SHEETS_SCOPE],
    });
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const auth = createGoogleAuth();
    if (!auth) {
      return NextResponse.json(
        {
          success: false,
          error: "Không tìm thấy Service Account credentials để ghi vào Google Sheet.",
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    const {
      caseId = "case_000",
      target = "auto", // 'auto' | 'evidences' | 'checkpoints'
      pin,
    } = body;

    if (!pin) {
      return NextResponse.json(
        { success: false, error: "Thiếu dữ liệu pin." },
        { status: 400 }
      );
    }

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = DEFAULT_SPREADSHEET_ID;

    // Phân loại ghi vào tab nào:
    // Nếu actionType là custom_question hoặc có câu hỏi -> checkpoints
    // Nếu là ảnh, dossier, sticky note -> evidences
    const isCheckpoint =
      target === "checkpoints" ||
      pin.actionType === "custom_question" ||
      Boolean(pin.question);

    if (isCheckpoint) {
      // Tab checkpoints headers:
      // case_id, checkpoint_id, dossier, title, question, type, answers, answers_id, hints, narrative
      const checkpointId = pin.checkpointId || pin.id || `cp_${Date.now()}`;
      const dossier = pin.dossier || "BỘ MỞ RỘNG (WEB PIN)";
      const title = pin.label || "Câu hỏi suy luận";
      const question = pin.question || pin.label || "";
      const type = pin.questionType || "text";
      const answers = pin.answers || "";
      const answersId = pin.unlockedEvidenceId || "";
      const hints = pin.hints || "";
      const narrative = pin.detail || "";

      const rowValues = [
        caseId,
        checkpointId,
        dossier,
        title,
        question,
        type,
        answers,
        answersId,
        hints,
        narrative,
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "checkpoints!A:J",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [rowValues],
        },
      });

      return NextResponse.json({
        success: true,
        tab: "checkpoints",
        checkpointId,
        message: `Đã đồng bộ checkpoint [${checkpointId}] lên Google Sheet tab checkpoints!`,
      });
    } else {
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
        valueInputOption: "USER_ENTERED",
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
  } catch (error: any) {
    console.error("Lỗi khi ghi vào Google Sheets:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Lỗi không xác định khi ghi vào Google Sheets.",
      },
      { status: 500 }
    );
  }
}
