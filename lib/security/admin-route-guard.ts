import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth/admin";

/**
 * Chặn Route Handler cho admin. Trả về response lỗi nếu không đủ quyền,
 * hoặc `null` khi request hợp lệ:
 *
 *   const denied = await denyIfNotAdmin();
 *   if (denied) return denied;
 */
export async function denyIfNotAdmin(): Promise<NextResponse | null> {
  try {
    await requireAdminAuth();
    return null;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    return NextResponse.json(
      { success: false, error: message },
      {
        status: message.startsWith("Unauthorized") ? 401 : 403,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
