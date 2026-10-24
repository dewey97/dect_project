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
  evidences: "case_evidence",
  evidence: "case_evidence",
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
    let { data, error } = await supabase
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

    // Nếu tab photos chưa có dữ liệu trong phone_photos, đọc ảnh từ case_evidence
    if (tab === "photos" && (!data || data.length === 0)) {
      const { data: evPhotos } = await supabase
        .from("case_evidence")
        .select("*")
        .eq("case_slug", caseSlug)
        .in("kind", ["photo", "image"])
        .order("slot_index", { ascending: true });

      if (evPhotos && evPhotos.length > 0) {
        data = evPhotos;
      }
    }

    // Two-way aliasing cho ảnh và vật chứng tương thích hoàn toàn giao diện cũ
    const mapped = (data || []).map((item: Record<string, unknown>) => {
      if (tab === "photos") {
        const photoCode = String(
          item.photo_code || item.code || item.photo_id || "",
        ).trim();
        const label = String(item.label || item.title || "").trim();
        const imageUrl = String(
          item.image_url ||
            item.thumb_url ||
            item.file_url ||
            item.url ||
            item.drive_url ||
            "",
        ).trim();
        return {
          ...item,
          code: photoCode,
          photo_code: photoCode,
          photo_id: photoCode,
          label,
          title: label,
          image_url: imageUrl,
          url: imageUrl,
          drive_url: imageUrl,
          direct_cdn_url: imageUrl,
        };
      }

      if (tab === "evidences" || tab === "evidence") {
        const code = String(item.code || item.photo_code || "").trim();
        const title = String(item.title || item.label || "").trim();
        const fileUrl = String(item.file_url || item.url || "").trim();
        const thumbUrl = String(
          item.thumb_url || item.file_url || item.url || "",
        ).trim();
        const primaryUrl = thumbUrl || fileUrl;
        const description = String(
          item.description || item.preview || "",
        ).trim();
        const meta = (item.metadata as Record<string, unknown>) || {};
        const category =
          meta.category ||
          item.category ||
          (item.kind === "image" || item.kind === "photo"
            ? "PHOTO"
            : item.kind === "pdf"
              ? "DOCUMENT"
              : "EVIDENCE");

        return {
          ...item,
          code,
          photo_code: code,
          photo_id: code,
          label: title,
          title,
          file_url: fileUrl,
          thumb_url: thumbUrl,
          url: primaryUrl,
          drive_url: primaryUrl,
          image_url: primaryUrl,
          direct_cdn_url: primaryUrl,
          description,
          preview: description,
          category,
        };
      }

      if (tab === "notes") {
        const title = String(item.title || item.title_or_domain || "").trim();
        const body = String(
          item.body || item.content_or_url || item.content || "",
        ).trim();
        return {
          ...item,
          title,
          title_or_domain: title,
          body,
          content: body,
          content_or_url: body,
          timestamp: item.timestamp || item.created_at || "",
        };
      }

      if (tab === "browser" || tab === "safari") {
        const title = String(item.title || item.title_or_domain || "").trim();
        const url = String(item.url || item.content_or_url || "").trim();
        const visitedAt = String(
          item.visited_at || item.timestamp || "",
        ).trim();
        return {
          ...item,
          title,
          title_or_domain: title,
          url,
          content_or_url: url,
          visited_at: visitedAt,
          timestamp: visitedAt,
        };
      }

      if (tab === "bank" || tab === "banking") {
        const counterparty = String(
          item.counterparty || item.receiver || item.title_or_domain || "",
        ).trim();
        const note = String(item.note || item.content_or_url || "").trim();
        const amount = Number(item.amount) || 0;
        return {
          ...item,
          counterparty,
          receiver: counterparty,
          title_or_domain: counterparty,
          note,
          content_or_url: note,
          amount,
          timestamp: item.timestamp || item.created_at || "",
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
