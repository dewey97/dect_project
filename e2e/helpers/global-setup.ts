import { cleanupE2ECases } from "./db-admin";

export default async function globalSetup() {
  const port = process.env.E2E_PORT || process.env.PORT || 3101;
  // Warm-up /login để Next.js pre-compile route trước khi browser chạy vào auth.setup.ts
  try {
    await fetch(`http://localhost:${port}/login`, { method: "GET" }).catch(() => {});
  } catch {
    // server might be starting up
  }

  try {
    await cleanupE2ECases("e2e_");
  } catch (err) {
    console.warn("[globalSetup] Lỗi dọn sạch dữ liệu e2e cũ:", err);
  }
}
