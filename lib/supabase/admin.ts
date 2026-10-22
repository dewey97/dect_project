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
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_4DpTkT6yHYAPQjtkYFfObg_u1bGZrn6";

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
