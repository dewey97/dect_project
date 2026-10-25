import { cleanupE2ECases } from "./db-admin";

export default async function globalTeardown() {
  try {
    await cleanupE2ECases("e2e_");
  } catch (err) {
    console.warn("[globalTeardown] Lỗi dọn sạch dữ liệu e2e sau test suite:", err);
  }
}
