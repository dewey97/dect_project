import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function getAdminClient(): SupabaseClient | null {
  try {
    process.loadEnvFile(".env.local");
  } catch {}
  try {
    process.loadEnvFile(".env");
  } catch {}

  // B14-9: Ưu tiên dùng Supabase Test Branch nếu được cấu hình
  const url =
    process.env.E2E_SUPABASE_URL ||
    (process.env.ALLOW_E2E_PRODUCTION_SEED === "true"
      ? process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
      : undefined);

  const key =
    process.env.E2E_SUPABASE_SERVICE_ROLE_KEY ||
    (process.env.ALLOW_E2E_PRODUCTION_SEED === "true"
      ? process.env.SUPABASE_SERVICE_ROLE_KEY
      : undefined);

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Kiểm tra xem môi trường E2E DB có an toàn để ghi dữ liệu không.
 * Nếu chưa cấu hình E2E_SUPABASE_URL và không bật ALLOW_E2E_PRODUCTION_SEED=true,
 * hàm trả về false để các spec tự skip tránh ghi rác lên production.
 */
export function isE2EDbAvailable(): boolean {
  try {
    process.loadEnvFile(".env.local");
  } catch {}
  if (process.env.E2E_SUPABASE_URL && process.env.E2E_SUPABASE_SERVICE_ROLE_KEY) {
    return true;
  }
  if (process.env.ALLOW_E2E_PRODUCTION_SEED === "true" && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return true;
  }
  return false;
}

/**
 * Dọn sạch mọi file trong các bucket storage có tiền tố e2e/
 */
export async function cleanupE2EStorage(prefix = "e2e") {
  const supabase = getAdminClient();
  if (!supabase) return;

  const buckets = ["avatars", "phone-assets", "evidence-assets"];
  for (const bucket of buckets) {
    try {
      const { data: files } = await supabase.storage.from(bucket).list(prefix, {
        limit: 100,
      });
      if (files && files.length > 0) {
        const paths = files.map((f) => `${prefix}/${f.name}`);
        await supabase.storage.from(bucket).remove(paths);
      }
    } catch (err) {
      console.warn(`[cleanupE2EStorage] Không thể xóa storage ${bucket}/${prefix}:`, err);
    }
  }
}

/**
 * Dọn sạch mọi case test có slug khớp prefix (mặc định 'e2e_%').
 * Chạy trong globalSetup và beforeAll/afterAll để không sót rác trên production.
 */
export async function cleanupE2ECases(prefix = "e2e_") {
  const supabase = getAdminClient();
  if (!supabase) return;

  // 1. Tìm các case khớp prefix
  const { data: cases, error: listError } = await supabase
    .from("cases")
    .select("slug")
    .like("slug", `${prefix}%`);

  if (!listError && cases && cases.length > 0) {
    const slugs = cases.map((c: { slug: string }) => c.slug);

    // 2. Dọn các bảng con
    await supabase.from("case_board_nodes").delete().in("case_slug", slugs);
    await supabase.from("case_checkpoints").delete().in("case_id", slugs);
    await supabase.from("case_characters").delete().in("case_slug", slugs);
    await supabase.from("case_evidence").delete().in("case_slug", slugs);
    await supabase.from("case_dossiers").delete().in("case_id", slugs);
    await supabase.from("case_phone_apps").delete().in("case_slug", slugs);
    await supabase.from("phone_contacts").delete().in("case_slug", slugs);
    await supabase.from("phone_calls").delete().in("case_slug", slugs);
    await supabase.from("phone_messages").delete().in("case_slug", slugs);
    await supabase.from("phone_notes").delete().in("case_slug", slugs);
    await supabase.from("phone_browser_history").delete().in("case_slug", slugs);
    await supabase.from("phone_bank_transactions").delete().in("case_slug", slugs);
    await supabase.from("boardgame_pins").delete().in("case_slug", slugs);
    await supabase.from("boardgame_connections").delete().in("case_slug", slugs);
    await supabase.from("reinvestigation_hotspots").delete().in("case_id", slugs);

    // 3. Xóa chính case
    await supabase.from("cases").delete().in("slug", slugs);
  }

  // 4. Dọn sạch file storage e2e/
  await cleanupE2EStorage("e2e");
}

/**
 * Xóa một case test cụ thể theo slug.
 */
export async function deleteTestCase(slug: string) {
  if (!slug.startsWith("e2e_")) {
    throw new Error(`[deleteTestCase REFUSED] Chỉ được xóa case test có prefix 'e2e_'. Nhận được slug='${slug}'`);
  }
  const supabase = getAdminClient();
  if (!supabase) return;
  await supabase.from("case_board_nodes").delete().eq("case_slug", slug);
  await supabase.from("case_checkpoints").delete().eq("case_id", slug);
  await supabase.from("case_characters").delete().eq("case_slug", slug);
  await supabase.from("case_evidence").delete().eq("case_slug", slug);
  await supabase.from("case_dossiers").delete().eq("case_id", slug);
  await supabase.from("case_phone_apps").delete().eq("case_slug", slug);
  await supabase.from("phone_contacts").delete().eq("case_slug", slug);
  await supabase.from("phone_calls").delete().eq("case_slug", slug);
  await supabase.from("phone_messages").delete().eq("case_slug", slug);
  await supabase.from("phone_notes").delete().eq("case_slug", slug);
  await supabase.from("phone_browser_history").delete().eq("case_slug", slug);
  await supabase.from("phone_bank_transactions").delete().eq("case_slug", slug);
  await supabase.from("boardgame_pins").delete().eq("case_slug", slug);
  await supabase.from("boardgame_connections").delete().eq("case_slug", slug);
  await supabase.from("reinvestigation_hotspots").delete().eq("case_id", slug);
  await supabase.from("cases").delete().eq("slug", slug);
}

/**
 * Seed một case test đầy đủ (case, characters, checkpoints, board nodes)
 * để kiểm tra tính năng render bảng động.
 */
export async function seedTestCase(slug: string, title = "Vụ Án Tạm E2E") {
  if (!slug.startsWith("e2e_")) {
    throw new Error(`[seedTestCase REFUSED] Chỉ được seed case test có prefix 'e2e_'. Nhận được slug='${slug}'`);
  }
  const supabase = getAdminClient();
  if (!supabase) throw new Error("Supabase client is not available for seedTestCase");

  // Tạo case
  const { error: cErr } = await supabase.from("cases").upsert({
    slug,
    title,
    summary: "Vụ án tự động sinh cho bài test E2E B12-6",
    status: "DRAFT",
    difficulty: "EASY",
  });
  if (cErr) throw cErr;

  // Tạo characters: 1 nạn nhân, 2 nghi phạm
  const { error: chErr } = await supabase.from("case_characters").upsert([
    {
      case_slug: slug,
      key: "victim_test",
      name: "Hoàng Minh Test",
      role: "victim",
      avatar_url: "/images/avatar_placeholder.svg",
    },
    {
      case_slug: slug,
      key: "suspect_a",
      name: "Đặng Thị Hoa",
      role: "suspect",
      avatar_url: "/images/avatar_placeholder.svg",
    },
    {
      case_slug: slug,
      key: "suspect_b",
      name: "Phan Văn Nam",
      role: "suspect",
      avatar_url: "/images/avatar_placeholder.svg",
    },
  ]);
  if (chErr) throw chErr;

  // Tạo checkpoint cáo trạng
  const { error: cpErr } = await supabase.from("case_checkpoints").upsert({
    id: `cp_${slug}_indictment`,
    case_id: slug,
    title: "Cáo trạng kết thúc",
    kind: "indictment",
    order_index: 99,
    board_config: {
      position: { desktop: { x: 500, y: 500 }, mobile: { x: 200, y: 400 } },
    },
  });
  if (cpErr) throw cpErr;

  // Tạo 5 board nodes hệ thống
  const { error: bnErr } = await supabase.from("case_board_nodes").upsert([
    {
      id: `${slug}:victim:victim_test`,
      case_slug: slug,
      node_kind: "victim",
      title: "Nạn nhân Hoàng Minh Test",
      subject_key: "victim_test",
      slot_index: 0,
      config: { position: { desktop: { x: 100, y: 100 } } },
    },
    {
      id: `${slug}:victim_phone:victim_test`,
      case_slug: slug,
      node_kind: "victim_phone",
      title: "Điện thoại Hoàng Minh Test",
      subject_key: "victim_test",
      slot_index: 1,
      config: { position: { desktop: { x: 100, y: 300 } } },
    },
    {
      id: `${slug}:reinvestigate:scene`,
      case_slug: slug,
      node_kind: "reinvestigate",
      title: "Khám nghiệm hiện trường",
      slot_index: 2,
      config: { position: { desktop: { x: 300, y: 100 } } },
    },
    {
      id: `${slug}:suspects_hub:hub`,
      case_slug: slug,
      node_kind: "suspects_hub",
      title: "Danh sách nghi phạm",
      slot_index: 3,
      config: { position: { desktop: { x: 300, y: 300 } } },
    },
    {
      id: `${slug}:evidence_hub:hub`,
      case_slug: slug,
      node_kind: "evidence_hub",
      title: "Hồ sơ vật chứng",
      slot_index: 4,
      config: { position: { desktop: { x: 500, y: 300 } } },
    },
  ]);
  if (bnErr) throw bnErr;
}


export async function cleanupCaseTronTimV2(slug = "case_tron_tim_v2", setDraftOnly = false) {
  const supabase = getAdminClient();
  if (!supabase) return;

  if (setDraftOnly) {
    await supabase.from("cases").update({ status: "DRAFT" }).eq("slug", slug);
    return;
  }

  await supabase.from("reinvestigation_hotspots").delete().eq("case_id", slug);
  await supabase.from("phone_messages").delete().eq("case_slug", slug);
  await supabase.from("phone_calls").delete().eq("case_slug", slug);
  await supabase.from("phone_contacts").delete().eq("case_slug", slug);
  await supabase.from("case_evidence").delete().eq("case_slug", slug);
  await supabase.from("case_dossiers").delete().eq("case_id", slug);
  await supabase.from("case_checkpoints").delete().eq("case_id", slug);
  await supabase.from("case_board_nodes").delete().eq("case_slug", slug);
  await supabase.from("case_characters").delete().eq("case_slug", slug);
  await supabase.from("cases").delete().eq("slug", slug);
}
