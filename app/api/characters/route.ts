import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeCaseId } from "@/lib/cases/case-id";
import type { DbCaseCharacter } from "@/lib/types/database";

export const dynamic = "force-dynamic";

/** Danh sách nhân vật của một vụ án (Case Bible) cho runtime gameplay. */
export async function GET(request: Request) {
  const caseId = normalizeCaseId(
    new URL(request.url).searchParams.get("caseId"),
  );

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("case_characters")
      .select("*")
      .eq("case_slug", caseId)
      .order("slot_index", { ascending: true });

    if (error) throw error;

    return NextResponse.json(
      { success: true, caseId, data: (data || []) as DbCaseCharacter[] },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error: unknown) {
    console.error("Error loading case characters:", error);
    return NextResponse.json(
      {
        success: false,
        caseId,
        data: [],
        error:
          error instanceof Error ? error.message : "Không tải được nhân vật.",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
