import { NextRequest } from "next/server";
import { getClientIp, checkRateLimit } from "@/lib/security/rate-limiter";
import {
  defensiveErrorResponse,
  rateLimitResponse,
  dynamicSuccessResponse,
} from "@/lib/security/defensive-cache";
import { denyIfNotAdmin } from "@/lib/security/admin-route-guard";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const CASE_ID_PATTERN = /^[a-z0-9_]{1,64}$/;

function getSafeCaseId(rawCaseId: unknown): string | null {
  const safeCaseId = String(rawCaseId || "")
    .trim()
    .toLowerCase()
    .replace(/-/g, "_");
  if (!safeCaseId || !CASE_ID_PATTERN.test(safeCaseId)) return null;
  return safeCaseId;
}

// GET: Lấy cấu hình Hotspots đã lưu theo caseId từ Supabase reinvestigation_hotspots
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawCaseId =
      searchParams.get("case") ||
      searchParams.get("caseId") ||
      searchParams.get("case_id");
    const caseId = getSafeCaseId(rawCaseId);
    if (!caseId) {
      return defensiveErrorResponse(
        { success: false, error: "Invalid or missing caseId" },
        400,
      );
    }

    const supabase = await createClient();
    const { data: row, error: dbError } = await supabase
      .from("reinvestigation_hotspots")
      .select("hotspots")
      .eq("case_slug", caseId)
      .maybeSingle();

    if (dbError) {
      console.error("[API /api/reinvestigation] DB error:", dbError);
      return defensiveErrorResponse(
        { success: false, error: dbError.message },
        500,
      );
    }

    const hotspots = row && Array.isArray(row.hotspots) ? row.hotspots : [];
    return dynamicSuccessResponse({
      success: true,
      hotspots,
      caseId,
      source: "database",
    });
  } catch (error: unknown) {
    console.error("Error reading hotspots data:", error);
    const message =
      error instanceof Error ? error.message : "Error reading hotspots data";
    return defensiveErrorResponse({ success: false, error: message }, 500);
  }
}

// POST: Lưu cấu hình Hotspots vào Supabase bảng reinvestigation_hotspots
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
    const { hotspots, caseId: rawCaseId } = body;

    if (!Array.isArray(hotspots)) {
      return defensiveErrorResponse(
        { success: false, error: "hotspots must be an array" },
        400,
      );
    }

    const caseId = getSafeCaseId(rawCaseId);
    if (!caseId) {
      return defensiveErrorResponse(
        { success: false, error: "Invalid or missing caseId" },
        400,
      );
    }

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
      console.error("[API /api/reinvestigation] DB upsert error:", dbError);
      return defensiveErrorResponse(
        { success: false, error: dbError.message },
        500,
      );
    }

    return dynamicSuccessResponse({
      success: true,
      caseId,
      count: hotspots.length,
    });
  } catch (error: unknown) {
    console.error("Error writing hotspots data:", error);
    const message =
      error instanceof Error ? error.message : "Error writing hotspots data";
    return defensiveErrorResponse({ success: false, error: message }, 500);
  }
}
