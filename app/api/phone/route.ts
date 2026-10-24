import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * 410 GONE: Endpoint /api/phone (Google Sheets) đã ngừng hoạt động và bị gỡ khỏi runtime.
 * Toàn bộ dữ liệu điện thoại và chứng cứ vụ án hiện nạp trực tiếp từ Supabase qua:
 * - /api/phone-data/[tab]
 * - Server actions (evidence-actions, case-actions)
 */
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error:
        "Endpoint /api/phone (Google Sheets) đã ngừng hoạt động (410 Gone). Runtime hiện nạp trực tiếp qua /api/phone-data/[tab] và Supabase.",
      deprecated: true,
      source: "deprecated_runtime",
    },
    { status: 410 },
  );
}

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error:
        "Endpoint /api/phone (Google Sheets) đã ngừng hoạt động (410 Gone). Runtime hiện nạp trực tiếp qua /api/phone-data/[tab] và Supabase.",
      deprecated: true,
      source: "deprecated_runtime",
    },
    { status: 410 },
  );
}
