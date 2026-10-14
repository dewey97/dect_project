import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { google } from "googleapis";
import { getClientIp, checkRateLimit } from "@/lib/security/rate-limiter";
import {
  defensiveErrorResponse,
  rateLimitResponse,
  dynamicSuccessResponse,
} from "@/lib/security/defensive-cache";

export const dynamic = "force-dynamic";

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DATA_DIR = path.resolve(process.cwd(), "data");
const PENDING_FILE = path.join(DATA_DIR, "waitlist_pending.json");

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Lưu dự phòng cục bộ vào tệp JSON để không bao giờ thất thoát email
 * kể cả khi chưa cấu hình Google Sheet hoặc mất mạng tạm thời.
 */
function saveLocalPending(entry: { email: string; source: string; timestamp: string; ip: string }) {
  try {
    ensureDirectoryExists();
    let entries: any[] = [];
    if (fs.existsSync(PENDING_FILE)) {
      try {
        entries = JSON.parse(fs.readFileSync(PENDING_FILE, "utf-8"));
      } catch {
        entries = [];
      }
    }
    // Tránh trùng lặp email cùng nguồn trong file lưu tạm
    const exists = entries.some(
      (e) => e.email.toLowerCase() === entry.email.toLowerCase() && e.source === entry.source
    );
    if (!exists) {
      entries.push(entry);
      fs.writeFileSync(PENDING_FILE, JSON.stringify(entries, null, 2), "utf-8");
    }
  } catch (err) {
    console.error("[WAITLIST] Failed to write local pending entry:", err);
  }
}

/**
 * Khởi tạo Google Auth an toàn
 */
function createGoogleAuth(): InstanceType<typeof google.auth.GoogleAuth> | null {
  const inlineCredentials = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  if (inlineCredentials) {
    try {
      return new google.auth.GoogleAuth({
        credentials: JSON.parse(inlineCredentials),
        scopes: [SHEETS_SCOPE],
      });
    } catch (e) {
      console.error("[WAITLIST] Invalid GOOGLE_SERVICE_ACCOUNT_JSON:", e);
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

export async function POST(req: Request) {
  try {
    // 1. Kiểm tra giới hạn tần suất (tối đa 5 lần submit / phút / IP)
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(`waitlist:${clientIp}`, {
      limit: 5,
      windowMs: 60_000,
    });

    if (!rateCheck.allowed) {
      return rateLimitResponse(
        rateCheck.retryAfterSeconds,
        "Bạn đã gửi yêu cầu quá thường xuyên. Vui lòng thử lại sau vài giây."
      );
    }

    // 2. Validate input
    const body = await req.json().catch(() => null);
    const email = body?.email?.trim();
    const source = body?.source?.trim() || "landing_hero";

    if (!email || !EMAIL_REGEX.test(email)) {
      return defensiveErrorResponse(
        { success: false, error: "Định dạng email không hợp lệ. Vui lòng kiểm tra lại." },
        400
      );
    }

    const timestamp = new Date().toISOString();
    const entry = { email, source, timestamp, ip: clientIp };

    // 3. Luôn lưu bản sao dự phòng cục bộ
    saveLocalPending(entry);

    // 4. Nếu đã cấu hình WAITLIST_SHEET_ID -> ghi thẳng vào Google Sheet
    const sheetId = process.env.WAITLIST_SHEET_ID?.trim();
    if (sheetId) {
      const auth = createGoogleAuth();
      if (auth) {
        try {
          const sheets = google.sheets({ version: "v4", auth });
          const tabName = process.env.WAITLIST_SHEET_TAB || "Waitlist";
          await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: `'${tabName}'!A:D`,
            valueInputOption: "USER_ENTERED",
            requestBody: {
              values: [[timestamp, email, source, clientIp]],
            },
          });
          console.log(`[WAITLIST] Successfully appended ${email} to Google Sheet (${sheetId})`);
        } catch (sheetError) {
          console.error("[WAITLIST] Error appending to Google Sheet (saved to local backup):", sheetError);
        }
      } else {
        console.warn("[WAITLIST] WAITLIST_SHEET_ID is set but Google Auth credentials not found. Saved locally.");
      }
    } else {
      console.log(`[WAITLIST] Registered: ${email} [${source}] (Waiting for WAITLIST_SHEET_ID link)`);
    }

    return dynamicSuccessResponse({
      success: true,
      message: "Đăng ký thành công! Hồ sơ của bạn đã được niêm phong vào danh sách ưu tiên.",
    });
  } catch (err: any) {
    console.error("[WAITLIST] Internal error:", err);
    return defensiveErrorResponse(
      { success: false, error: "Có lỗi xảy ra trên máy chủ. Vui lòng thử lại sau." },
      500
    );
  }
}
