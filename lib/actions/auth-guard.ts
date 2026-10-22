"use server";

import { checkIsAdmin as checkIsAdminServer } from "@/lib/auth/admin";

/**
 * Server Action cho client hỏi quyền admin của chính người đang đăng nhập.
 * `requireAdminAuth` không export ở đây để không thành endpoint công khai;
 * code server import trực tiếp từ `@/lib/auth/admin`.
 */
export async function checkIsAdmin(): Promise<boolean> {
  return checkIsAdminServer();
}
