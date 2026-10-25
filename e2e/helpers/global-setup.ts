import { cleanupE2ECases } from "./db-admin";

export default async function globalSetup() {
  try {
    await cleanupE2ECases("e2e_");
  } catch (err) {
    console.warn("[globalSetup] Lỗi dọn sạch dữ liệu e2e cũ:", err);
  }
}
