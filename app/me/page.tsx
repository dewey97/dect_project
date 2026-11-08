import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * Route /me cũ đã được hợp nhất vào Kho Vụ Án (tab Kho của bạn).
 * Chuyển hướng người dùng sang /cases?tab=my_cases.
 */
export default function MePage() {
  redirect("/cases?tab=my_cases");
}
