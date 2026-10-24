import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeCaseId } from "@/lib/cases/case-id";

export const dynamic = "force-dynamic";

/**
 * API đọc danh sách các bộ hồ sơ của một vụ án (công khai).
 * GET /api/case-dossiers?case=case_000
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const caseParam =
    searchParams.get("case") ||
    searchParams.get("case_id") ||
    searchParams.get("caseId") ||
    "case_000";
  const caseSlug = normalizeCaseId(caseParam);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("case_dossiers")
      .select("*")
      .eq("case_id", caseSlug)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
