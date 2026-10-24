import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeCaseId } from "@/lib/cases/case-id";
import type { DbCasePhoneApp } from "@/lib/types/database";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Danh sách 8 ứng dụng hệ thống mặc định khi vụ án chưa cấu hình trong DB
const DEFAULT_SYSTEM_APPS: Omit<
  DbCasePhoneApp,
  "id" | "case_slug" | "created_at" | "updated_at"
>[] = [
  {
    app_type: "photos",
    display_name: "Ảnh",
    icon_url: "/images/phone/icons/photos.png",
    slot_index: 0,
    is_dock: false,
    is_locked: false,
    unlock_checkpoint_id: null,
    config: {},
  },
  {
    app_type: "camera",
    display_name: "Camera",
    icon_url: "/images/phone/icons/camera.png",
    slot_index: 1,
    is_dock: false,
    is_locked: false,
    unlock_checkpoint_id: null,
    config: {},
  },
  {
    app_type: "notes",
    display_name: "Ghi chú",
    icon_url: "/images/phone/icons/notes.png",
    slot_index: 2,
    is_dock: false,
    is_locked: false,
    unlock_checkpoint_id: null,
    config: {},
  },
  {
    app_type: "settings",
    display_name: "Cài đặt",
    icon_url: "/images/phone/icons/settings.png",
    slot_index: 3,
    is_dock: false,
    is_locked: false,
    unlock_checkpoint_id: null,
    config: {},
  },
  {
    app_type: "phone",
    display_name: "Điện thoại",
    icon_url: "/images/phone/icons/phone.png",
    slot_index: 0,
    is_dock: true,
    is_locked: false,
    unlock_checkpoint_id: null,
    config: {},
  },
  {
    app_type: "messages",
    display_name: "Tin nhắn",
    icon_url: "/images/phone/icons/messages.png",
    slot_index: 1,
    is_dock: true,
    is_locked: false,
    unlock_checkpoint_id: null,
    config: {},
  },
  {
    app_type: "contacts",
    display_name: "Danh bạ",
    icon_url: "/images/phone/icons/contacts.png",
    slot_index: 2,
    is_dock: true,
    is_locked: false,
    unlock_checkpoint_id: null,
    config: {},
  },
  {
    app_type: "safari",
    display_name: "Safari",
    icon_url: "/images/phone/icons/safari.png",
    slot_index: 3,
    is_dock: true,
    is_locked: false,
    unlock_checkpoint_id: null,
    config: {},
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawCaseId =
    searchParams.get("caseId") || searchParams.get("case_id") || "case_000";
  const caseSlug = normalizeCaseId(rawCaseId);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("case_phone_apps")
      .select("*")
      .eq("case_slug", caseSlug)
      .order("is_dock", { ascending: true })
      .order("slot_index", { ascending: true });

    if (!error && data && data.length > 0) {
      return NextResponse.json({
        success: true,
        caseId: caseSlug,
        data,
        source: "supabase",
      });
    }
  } catch {
    // Fallback an toàn khi bảng chưa migrate
  }

  const fallback = DEFAULT_SYSTEM_APPS.map((a, idx) => ({
    ...a,
    id: `app-fallback-${idx}`,
    case_slug: caseSlug,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  return NextResponse.json({
    success: true,
    caseId: caseSlug,
    data: fallback,
    source: "default",
  });
}
