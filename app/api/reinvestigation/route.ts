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

export const dynamic = "force-dynamic";

const DATA_DIR = path.resolve(process.cwd(), "data");

const CASE_ID_PATTERN = /^[a-z0-9_]{1,64}$/;

/** Trả về null khi caseId không hợp lệ (chặn path traversal `../`). */
function getHotspotsFile(rawCaseId: unknown): string | null {
  const safeCaseId = String(rawCaseId || "case_000")
    .trim()
    .toLowerCase()
    .replace(/-/g, "_");
  if (!CASE_ID_PATTERN.test(safeCaseId)) return null;
  return path.join(DATA_DIR, `${safeCaseId}_hotspots.json`);
}

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// GET: Lấy cấu hình Hotspots đã lưu theo caseId
export async function GET(request: NextRequest) {
  try {
    ensureDirectoryExists();
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get("caseId") || "case_000";
    const filePath = getHotspotsFile(caseId);
    if (!filePath) {
      return defensiveErrorResponse(
        { success: false, error: "Invalid caseId" },
        400,
      );
    }

    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(content);
      return dynamicSuccessResponse({
        success: true,
        hotspots: parsed,
        caseId,
      });
    }
    return dynamicSuccessResponse({ success: true, hotspots: null, caseId });
  } catch (error: any) {
    console.error("Error reading hotspots file:", error);
    return defensiveErrorResponse(
      { success: false, error: error.message },
      500,
    );
  }
}

// POST: Lưu vĩnh viễn cấu hình Hotspots (vị trí + ảnh gán theo ID) theo caseId
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
    const { hotspots, caseId = "case_000" } = body;

    if (!Array.isArray(hotspots)) {
      return defensiveErrorResponse(
        { success: false, error: "hotspots must be an array" },
        400,
      );
    }

    const filePath = getHotspotsFile(caseId);
    if (!filePath) {
      return defensiveErrorResponse(
        { success: false, error: "Invalid caseId" },
        400,
      );
    }

    ensureDirectoryExists();
    fs.writeFileSync(filePath, JSON.stringify(hotspots, null, 2), "utf-8");

    return dynamicSuccessResponse({
      success: true,
      caseId,
      count: hotspots.length,
    });
  } catch (error: any) {
    console.error("Error writing hotspots file:", error);
    return defensiveErrorResponse(
      { success: false, error: error.message },
      500,
    );
  }
}
