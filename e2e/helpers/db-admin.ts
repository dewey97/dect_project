import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function getAdminClient(): SupabaseClient {
  try {
    process.loadEnvFile(".env.local");
  } catch {}
  try {
    process.loadEnvFile(".env");
  } catch {}

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "https://zalyxhmwwmfyexoilejp.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY in .env.local for E2E db-admin helper",
    );
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Dọn sạch mọi case test có slug khớp prefix (mặc định 'e2e_%').
 * Chạy trong globalSetup và beforeAll/afterAll để không sót rác trên production.
 */
export async function cleanupE2ECases(prefix = "e2e_") {
  const supabase = getAdminClient();

  // 1. Tìm các case khớp prefix
  const { data: cases, error: listError } = await supabase
    .from("cases")
    .select("slug")
    .like("slug", `${prefix}%`);

  if (listError) {
    console.warn("[E2E cleanup] Không thể query danh sách cases:", listError.message);
    return;
  }

  if (!cases || cases.length === 0) return;

  const slugs = cases.map((c) => c.slug);

  // 2. Xóa các bảng phụ thuộc trước
  await supabase.from("case_board_nodes").delete().in("case_slug", slugs);
  await supabase.from("case_checkpoints").delete().in("case_id", slugs);
  await supabase.from("case_characters").delete().in("case_slug", slugs);

  // 3. Xóa bảng cases
  const { error: delError } = await supabase
    .from("cases")
    .delete()
    .in("slug", slugs);

  if (delError) {
    console.warn("[E2E cleanup] Lỗi khi xóa cases:", delError.message);
  }
}

/**
 * Xóa một case cụ thể theo slug.
 */
export async function deleteTestCase(slug: string) {
  const supabase = getAdminClient();
  await supabase.from("case_board_nodes").delete().eq("case_slug", slug);
  await supabase.from("case_checkpoints").delete().eq("case_id", slug);
  await supabase.from("case_characters").delete().eq("case_slug", slug);
  await supabase.from("cases").delete().eq("slug", slug);
}

/**
 * Đảm bảo một case tồn tại trong database (upsert bằng service_role key).
 */
export async function ensureTestCase(slug: string, title = "Vụ Án Tạm E2E", status = "DRAFT") {
  const supabase = getAdminClient();
  const { error } = await supabase.from("cases").upsert({ slug, title, status }, { onConflict: "slug" });
  if (error) throw new Error(`ensureTestCase failed: ${error.message}`);
}

/**
 * Hàm tương thích chạy câu lệnh SQL đơn giản cho E2E helpers.
 */
export async function executeSql(query: string) {
  const supabase = getAdminClient();
  const trimmed = query.trim();
  const upper = trimmed.toUpperCase();

  if (upper.startsWith("INSERT INTO PUBLIC.CASES")) {
    const slugMatch = trimmed.match(/'([^']+)',\s*'([^']+)',\s*'([^']+)'/);
    if (slugMatch) {
      const [, slug, title, status] = slugMatch;
      await ensureTestCase(slug, title, status);
      return;
    }
  }

  if (upper.startsWith("DELETE FROM PUBLIC.CASES")) {
    const slugMatch = trimmed.match(/slug\s*=\s*'([^']+)'/i);
    if (slugMatch) {
      await deleteTestCase(slugMatch[1]);
      return;
    }
  }
}

/**
 * Seed dữ liệu một case kiểm thử hoàn chỉnh.
 */
export async function seedTestCase(slug: string, title = "Vụ Án Bí Ẩn Test Board") {
  const supabase = getAdminClient();

  // 1. Insert cases
  const { error: caseErr } = await supabase.from("cases").insert({
    slug,
    title,
    status: "DRAFT",
  });
  if (caseErr) throw new Error(`seedTestCase (cases) failed: ${caseErr.message}`);

  // 2. Insert characters
  const { error: charErr } = await supabase.from("case_characters").insert([
    {
      case_slug: slug,
      key: "victim_test",
      name: "Nạn Nhân Phan Hoàng Nam",
      role: "victim",
      slot_index: 0,
    },
    {
      case_slug: slug,
      key: "suspect_alpha",
      name: "Nghi Phạm Đỗ Mạnh Hùng",
      role: "suspect",
      slot_index: 1,
    },
    {
      case_slug: slug,
      key: "suspect_beta",
      name: "Nghi Phạm Mai Thúy Hạnh",
      role: "suspect",
      slot_index: 2,
    },
  ]);
  if (charErr) throw new Error(`seedTestCase (characters) failed: ${charErr.message}`);

  // 3. Insert checkpoint indictment
  const { error: cpErr } = await supabase.from("case_checkpoints").insert({
    case_id: slug,
    checkpoint_id: "cp_test_indictment",
    title: "Luận tội thủ phạm",
    kind: "indictment",
    subject_key: "suspect_alpha",
    board_config: {
      pin_title: "Bản kết luận điều tra",
      position: { desktop: { x: 0.78, y: 0.78 } },
    },
  });
  if (cpErr) throw new Error(`seedTestCase (checkpoints) failed: ${cpErr.message}`);

  // 4. Insert case_board_nodes
  const { error: nodeErr } = await supabase.from("case_board_nodes").insert([
    {
      id: `${slug}:victim_phone:phone`,
      case_slug: slug,
      node_kind: "victim_phone",
      title: "Điện thoại nạn nhân",
      subject_key: "victim_test",
      slot_index: 0,
      config: {
        pin_title: "Điện thoại nạn nhân",
        position: { desktop: { x: 0.38, y: 0.14 } },
      },
    },
    {
      id: `${slug}:suspects_hub:hub`,
      case_slug: slug,
      node_kind: "suspects_hub",
      title: "Danh sách nghi phạm",
      subject_key: null,
      slot_index: 1,
      config: {
        pin_title: "Khu vực nghi phạm",
        position: { desktop: { x: 0.25, y: 0.5 } },
      },
    },
  ]);
  if (nodeErr) throw new Error(`seedTestCase (board_nodes) failed: ${nodeErr.message}`);
}
