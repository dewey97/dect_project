import { cleanupE2ECases, getAdminClient } from "./db-admin";

export default async function globalSetup() {
  const port = process.env.E2E_PORT || process.env.PORT || 3101;

  // B18-4: Kiểm tra kết nối Supabase trước khi chạy test suite
  const admin = getAdminClient();
  if (admin) {
    try {
      const url = (admin as any).supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = (admin as any).supabaseKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (url && key) {
        const healthRes = await fetch(`${url}/auth/v1/health`, {
          headers: { apikey: key },
          signal: AbortSignal.timeout(10_000),
        }).catch((err) => {
          throw new Error(`Không thể kết nối Supabase Auth: ${err?.message || err}`);
        });

        if (!healthRes.ok) {
          throw new Error(`Supabase Auth endpoint trả về mã lỗi HTTP ${healthRes.status}`);
        }
      }

      const { error } = await admin
        .from("cases")
        .select("id")
        .limit(1);

      if (error) {
        throw new Error(`Truy vấn Supabase cases thất bại: ${error.message} (${error.code})`);
      }
    } catch (err: any) {
      console.error(`\n❌ [B18-4 CRITICAL] Supabase không truy cập được: ${err?.message || err}\n`);
      throw new Error(`Supabase không truy cập được: ${err?.message || err}`);
    }
  }

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
