import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeCaseId } from "@/lib/cases/case-id";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const TAB_TABLE_MAP: Record<string, string> = {
  contacts: "phone_contacts",
  calls: "phone_calls",
  messages: "phone_messages",
  photos: "phone_photos",
  notes: "phone_notes",
  banking: "phone_bank_transactions",
  bank: "phone_bank_transactions",
  safari: "phone_browser_history",
  browser: "phone_browser_history",
};

export async function GET(
  request: Request,
  props: { params: Promise<{ tab: string }> },
) {
  const params = await props.params;
  const tab = (params.tab || "").trim().toLowerCase();
  const tableName = TAB_TABLE_MAP[tab];

  if (!tableName) {
    return NextResponse.json(
      { success: false, error: `Phân hệ '${tab}' không hợp lệ.` },
      { status: 400 },
    );
  }

  const { searchParams } = new URL(request.url);
  const rawCaseId =
    searchParams.get("caseId") || searchParams.get("case_id") || "case_000";
  const caseSlug = normalizeCaseId(rawCaseId);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .eq("case_slug", caseSlug)
      .order("slot_index", { ascending: true });

    if (error) {
      return NextResponse.json({
        success: false,
        caseId: caseSlug,
        tab,
        error: error.message,
        data: [],
      });
    }

    // Two-way aliasing cho ảnh và vật chứng tương thích hoàn toàn giao diện cũ
    const mapped = (data || []).map((item: Record<string, unknown>) => {
      if (tab === "photos") {
        const photoCode = String(item.photo_code || item.code || "").trim();
        const label = String(item.label || item.title || "").trim();
        const imageUrl = String(
          item.image_url || item.url || item.drive_url || "",
        ).trim();
        return {
          ...item,
          code: photoCode,
          photo_code: photoCode,
          label,
          title: label,
          image_url: imageUrl,
          url: imageUrl,
          drive_url: imageUrl,
        };
      }
      return item;
    });

    return NextResponse.json({
      success: true,
      caseId: caseSlug,
      tab,
      totalCount: mapped.length,
      data: mapped,
      source: "supabase",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      success: false,
      caseId: caseSlug,
      tab,
      error: message,
      data: [],
    });
  }
}
