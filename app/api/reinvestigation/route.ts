import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getClientIp, checkRateLimit } from "@/lib/security/rate-limiter";
import {
  defensiveErrorResponse,
  rateLimitResponse,
  dynamicSuccessResponse,
} from "@/lib/security/defensive-cache";
import { denyIfNotAdmin } from "@/lib/security/admin-route-guard";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const DATA_DIR = path.resolve(process.cwd(), "data");

const CASE_ID_PATTERN = /^[a-z0-9_]{1,64}$/;

function getSafeCaseId(rawCaseId: unknown): string | null {
  const safeCaseId = String(rawCaseId || "case_000")
    .trim()
    .toLowerCase()
    .replace(/-/g, "_");
  if (!CASE_ID_PATTERN.test(safeCaseId)) return null;
  return safeCaseId;
}

/** Trả về null khi caseId không hợp lệ (chặn path traversal `../`). */
function getHotspotsFile(safeCaseId: string): string {
  return path.join(DATA_DIR, `${safeCaseId}_hotspots.json`);
}

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// GET: Lấy cấu hình Hotspots đã lưu theo caseId (ưu tiên Supabase, fallback file cục bộ)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawCaseId = searchParams.get("caseId") || "case_000";
    const caseId = getSafeCaseId(rawCaseId);
    if (!caseId) {
      return defensiveErrorResponse(
        { success: false, error: "Invalid caseId" },
        400,
      );
    }

    // 1. Ưu tiên đọc từ Supabase bảng reinvestigation_hotspots
    try {
      const supabase = await createClient();
      const { data: row, error: dbError } = await supabase
        .from("reinvestigation_hotspots")
        .select("hotspots")
        .eq("case_slug", caseId)
        .maybeSingle();

      if (!dbError && row && Array.isArray(row.hotspots)) {
        return dynamicSuccessResponse({
          success: true,
          hotspots: row.hotspots,
          caseId,
          source: "database",
        });
      }
    } catch (dbErr) {
      console.warn(
        "[API /api/reinvestigation] DB fetch fallback to file:",
        dbErr,
      );
    }

    // 2. Fallback đọc file cục bộ nếu DB chưa có
    ensureDirectoryExists();
    const filePath = getHotspotsFile(caseId);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(content);
      return dynamicSuccessResponse({
        success: true,
        hotspots: parsed,
        caseId,
        source: "file",
      });
    }

    return dynamicSuccessResponse({ success: true, hotspots: null, caseId });
  } catch (error: any) {
    console.error("Error reading hotspots data:", error);
    return defensiveErrorResponse(
      { success: false, error: error.message },
      500,
    );
  }
}

// POST: Lưu cấu hình Hotspots vào Supabase và backup file cục bộ
export async function POST(request: NextRequest) {
  const denied = await denyIfNotAdmin();
  if (denied) return denied;

  try {
    // Giới hạn tần suất lưu cấu hình (tối đa 15 lần / phút / IP)
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`reinvestigation-save:${clientIp}`, {
      limit: 15,
      windowMs: 60_000,
    });

    if (!rateCheck.allowed) {
      return rateLimitResponse(
        rateCheck.retryAfterSeconds,
        "Bạn đang lưu cấu hình quá thường xuyên. Vui lòng thử lại sau vài giây.",
      );
    }

    const body = await request.json();
    const { hotspots, caseId: rawCaseId = "case_000" } = body;

    if (!Array.isArray(hotspots)) {
      return defensiveErrorResponse(
        { success: false, error: "hotspots must be an array" },
        400,
      );
    }

    const caseId = getSafeCaseId(rawCaseId);
    if (!caseId) {
      return defensiveErrorResponse(
        { success: false, error: "Invalid caseId" },
        400,
      );
    }

    // 1. Lưu vào Supabase bảng reinvestigation_hotspots
    try {
      const supabase = await createClient();
      const { error: dbError } = await supabase
        .from("reinvestigation_hotspots")
        .upsert(
          {
            case_slug: caseId,
            hotspots,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "case_slug" },
        );
      if (dbError) {
        console.error("[API /api/reinvestigation] DB upsert warning:", dbError);
      }
    } catch (dbErr) {
      console.error("[API /api/reinvestigation] DB connection error:", dbErr);
    }

    // 2. Lưu bản sao dự phòng cục bộ
    ensureDirectoryExists();
    const filePath = getHotspotsFile(caseId);
    fs.writeFileSync(filePath, JSON.stringify(hotspots, null, 2), "utf-8");

    return dynamicSuccessResponse({
      success: true,
      caseId,
      count: hotspots.length,
    });
  } catch (error: any) {
    console.error("Error writing hotspots data:", error);
    return defensiveErrorResponse(
      { success: false, error: error.message },
      500,
    );
  }
}
