import { createClient } from "@/lib/supabase/server";

/**
 * Helper thuần server-side kiểm tra quyền quản trị viên (Admin / Super Admin).
 * Không dùng directive 'use server' để không bị lộ thành HTTP endpoint công khai.
 */
export async function requireAdminAuth() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Unauthorized: Bạn chưa đăng nhập.");
  }

  // Ưu tiên kiểm tra quyền admin trực tiếp từ app_metadata của tài khoản
  if (
    user.app_metadata?.role === "super_admin" ||
    user.app_metadata?.role === "admin"
  ) {
    return { user, profile: { role: "admin" } };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Forbidden: Bạn không có quyền truy cập Admin Studio.");
  }

  return { user, profile };
}

/**
 * Kiểm tra trạng thái admin (không ném lỗi)
 */
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    if (
      user.app_metadata?.role === "super_admin" ||
      user.app_metadata?.role === "admin"
    ) {
      return true;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    return profile?.role === "admin";
  } catch {
    return false;
  }
}
