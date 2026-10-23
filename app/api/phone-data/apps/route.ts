import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeCaseId } from "@/lib/cases/case-id";
import type { DbCasePhoneApp } from "@/lib/types/database";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Danh sách 15 app mặc định cho case_000 hoặc vụ án mới chưa cấu hình trong DB
const DEFAULT_APPS: Omit<DbCasePhoneApp, "id" | "created_at" | "updated_at">[] =
  [
    {
      case_slug: "case_000",
      app_type: "photos",
      display_name: "Ảnh",
      icon_url: "/images/cases/case_000/phone/icons/photos.png",
      slot_index: 0,
      is_dock: false,
      is_locked: false,
      unlock_checkpoint_id: null,
      config: {},
    },
    {
      case_slug: "case_000",
      app_type: "camera",
      display_name: "Camera",
      icon_url: "/images/cases/case_000/phone/icons/camera.png",
      slot_index: 1,
      is_dock: false,
      is_locked: false,
      unlock_checkpoint_id: null,
      config: {},
    },
    {
      case_slug: "case_000",
      app_type: "maps",
      display_name: "Bản đồ",
      icon_url: "/images/cases/case_000/phone/icons/maps.png",
      slot_index: 2,
      is_dock: false,
      is_locked: false,
      unlock_checkpoint_id: null,
      config: {},
    },
    {
      case_slug: "case_000",
      app_type: "notes",
      display_name: "Ghi chú",
      icon_url: "/images/cases/case_000/phone/icons/notes.png",
      slot_index: 3,
      is_dock: false,
      is_locked: false,
      unlock_checkpoint_id: null,
      config: {},
    },
    {
      case_slug: "case_000",
      app_type: "banking",
      display_name: "Ngân hàng",
      icon_url: "/images/cases/case_000/phone/icons/banking.svg",
      slot_index: 4,
      is_dock: false,
      is_locked: false,
      unlock_checkpoint_id: null,
      config: {},
    },
    {
      case_slug: "case_000",
      app_type: "flappybird",
      display_name: "Flappy Bird",
      icon_url: "/images/cases/case_000/phone/icons/flappybird.svg",
      slot_index: 5,
      is_dock: false,
      is_locked: false,
      unlock_checkpoint_id: null,
      config: {},
    },
    {
      case_slug: "case_000",
      app_type: "tetris",
      display_name: "Xếp Gạch",
      icon_url: "/images/cases/case_000/phone/icons/tetris.svg",
      slot_index: 6,
      is_dock: false,
      is_locked: false,
      unlock_checkpoint_id: null,
      config: {},
    },
    {
      case_slug: "case_000",
      app_type: "snake",
      display_name: "Snake '97",
      icon_url: "/images/cases/case_000/phone/icons/snake.svg",
      slot_index: 7,
      is_dock: false,
      is_locked: false,
      unlock_checkpoint_id: null,
      config: {},
    },
    {
      case_slug: "case_000",
      app_type: "game2048",
      display_name: "2048",
      icon_url: "/images/cases/case_000/phone/icons/game2048.svg",
      slot_index: 8,
      is_dock: false,
      is_locked: false,
      unlock_checkpoint_id: null,
      config: {},
    },
    {
      case_slug: "case_000",
      app_type: "minesweeper",
      display_name: "Dò Mìn",
      icon_url: "/images/cases/case_000/phone/icons/minesweeper.svg",
      slot_index: 9,
      is_dock: false,
      is_locked: false,
      unlock_checkpoint_id: null,
      config: {},
    },
    {
      case_slug: "case_000",
      app_type: "settings",
      display_name: "Cài đặt",
      icon_url: "/images/cases/case_000/phone/icons/settings.png",
      slot_index: 10,
      is_dock: false,
      is_locked: false,
      unlock_checkpoint_id: null,
      config: {},
    },
    {
      case_slug: "case_000",
      app_type: "phone",
      display_name: "Điện thoại",
      icon_url: "/images/cases/case_000/phone/icons/phone.png",
      slot_index: 0,
      is_dock: true,
      is_locked: false,
      unlock_checkpoint_id: null,
      config: {},
    },
    {
      case_slug: "case_000",
      app_type: "messages",
      display_name: "Tin nhắn",
      icon_url: "/images/cases/case_000/phone/icons/messages.png",
      slot_index: 1,
      is_dock: true,
      is_locked: false,
      unlock_checkpoint_id: null,
      config: {},
    },
    {
      case_slug: "case_000",
      app_type: "contacts",
      display_name: "Danh bạ",
      icon_url: "/images/cases/case_000/phone/icons/contacts.png",
      slot_index: 2,
      is_dock: true,
      is_locked: false,
      unlock_checkpoint_id: null,
      config: {},
    },
    {
      case_slug: "case_000",
      app_type: "safari",
      display_name: "Safari",
      icon_url: "/images/cases/case_000/phone/icons/safari.png",
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

  const fallback = DEFAULT_APPS.map((a, idx) => ({
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
