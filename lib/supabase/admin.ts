import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Admin Client (Server-Only).
 * Sử dụng SUPABASE_SERVICE_ROLE_KEY để thực thi các tác vụ vượt qua RLS
 * (chấm điểm checkpoint, cập nhật hệ thống, batch sync).
 *
 * Tuyệt đối CẤM import vào Client Component.
 */
export function createAdminClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://zalyxhmwwmfyexoilejp.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Missing SUPABASE_SERVICE_ROLE_KEY. Server-side grading requires service role key in production.",
      );
    }
    console.warn(
      "[Supabase Admin] CẢNH BÁO: SUPABASE_SERVICE_ROLE_KEY chưa được cấu hình. Tạm dùng ANON_KEY cho môi trường local/dev.",
    );
    const fallbackKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "sb_publishable_4DpTkT6yHYAPQjtkYFfObg_u1bGZrn6";
    return createClient(url, fallbackKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
