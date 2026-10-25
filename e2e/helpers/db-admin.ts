import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function getAdminClient(): SupabaseClient | null {
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

  if (listError || !cases || cases.length === 0) return;

  const slugs = cases.map((c: { slug: string }) => c.slug);

  // 2. Dọn các bảng con
  await supabase.from("case_board_nodes").delete().in("case_slug", slugs);
  await supabase.from("case_checkpoints").delete().in("case_id", slugs);
  await supabase.from("case_characters").delete().in("case_slug", slugs);
  await supabase.from("boardgame_pins").delete().in("case_slug", slugs);
  await supabase.from("boardgame_connections").delete().in("case_slug", slugs);
  await supabase.from("reinvestigation_hotspots").delete().in("case_id", slugs);

  // 3. Xóa chính case
  await supabase.from("cases").delete().in("slug", slugs);
}

/**
 * Xóa một case test cụ thể theo slug.
 */
export async function deleteTestCase(slug: string) {
  const supabase = getAdminClient();
  if (!supabase) return;
  await supabase.from("case_board_nodes").delete().eq("case_slug", slug);
  await supabase.from("case_checkpoints").delete().eq("case_id", slug);
  await supabase.from("case_characters").delete().eq("case_slug", slug);
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


/**
 * Nghiệm thu B14-13: Tạo vụ case_tron_tim_v2 đầy đủ theo tiêu chuẩn multi-case độc lập
 * 1 nạn nhân, 3 nghi phạm, 4 bộ hồ sơ, >= 6 tài liệu, >= 4 vật chứng,
 * checkpoints đủ kind (phone_lookup, 3 suspect_interrogation, followup, indictment, epilogue),
 * điện thoại nạn nhân (danh bạ, tin nhắn, cuộc gọi), bảng điều tra, hotspot khám xét.
 */
export async function seedCaseTronTimV2(slug = "case_tron_tim_v2") {
  const supabase = getAdminClient();
  if (!supabase) throw new Error("Supabase client is not available for seedCaseTronTimV2");

  // 1. Case table
  const { error: cErr } = await supabase.from("cases").upsert({
    slug,
    title: "Trốn Tìm v2 (Thử Nghiệm Studio)",
    summary: "Vụ án bí ẩn tại biệt thự ven hồ, hoàn toàn độc lập với case_000.",
    status: "PUBLISHED",
    difficulty: "MEDIUM",
    access_code: "TRONTIMV2",
    reinvestigation_bg_url: "/images/cases/case_000/crime_scene.jpg",
  });
  if (cErr) throw cErr;

  // 2. Characters (1 victim, 3 suspects)
  const { error: chErr } = await supabase.from("case_characters").upsert([
    {
      case_slug: slug,
      key: "victim_nam",
      name: "Hoàng Văn Nam",
      role: "victim",
      avatar_url: "/images/avatar_placeholder.svg",
      description: "Nạn nhân 28 tuổi, kỹ sư phần mềm cao cấp.",
    },
    {
      case_slug: slug,
      key: "suspect_huy",
      name: "Đỗ Quốc Huy",
      role: "suspect",
      avatar_url: "/images/avatar_placeholder.svg",
      description: "Bạn thân và đồng nghiệp của nạn nhân.",
    },
    {
      case_slug: slug,
      key: "suspect_lan",
      name: "Phạm Mai Lan",
      role: "suspect",
      avatar_url: "/images/avatar_placeholder.svg",
      description: "Bạn gái cũ của nạn nhân, kế toán trưởng.",
    },
    {
      case_slug: slug,
      key: "suspect_minh",
      name: "Bùi Đức Minh",
      role: "suspect",
      avatar_url: "/images/avatar_placeholder.svg",
      description: "Quản lý tòa nhà biệt thự cho thuê.",
    },
  ]);
  if (chErr) throw chErr;

  // 3. Dossiers (4 bộ hồ sơ)
  const { error: dosErr } = await supabase.from("case_dossiers").upsert([
    {
      case_id: slug,
      dossier_key: "dossier_scene",
      title: "Hồ sơ Hiện Trường",
      document_codes: ["DOC-01", "DOC-02"],
      description: "Biên bản và hiện trường ban đầu",
    },
    {
      case_id: slug,
      dossier_key: "dossier_statements",
      title: "Lời Khai Ban Đầu",
      document_codes: ["DOC-03", "DOC-04"],
      description: "Lời khai của Huy và Lan",
    },
    {
      case_id: slug,
      dossier_key: "dossier_autopsy",
      title: "Báo Cáo Pháp Y",
      document_codes: ["DOC-05"],
      description: "Giám định pháp y độc chất học",
    },
    {
      case_id: slug,
      dossier_key: "dossier_digital",
      title: "Bằng Chứng Số",
      document_codes: ["DOC-06"],
      description: "Trích xuất viễn thông và thiết bị số",
    },
  ]);
  if (dosErr) throw dosErr;

  // 4. Evidence (6 tài liệu + 4 vật chứng)
  const { error: evErr } = await supabase.from("case_evidence").upsert([
    // 6 Documents
    {
      case_slug: slug,
      code: "DOC-01",
      title: "Biên bản khám nghiệm hiện trường biệt thự",
      kind: "pdf",
      phase: 0,
      description: "Biên bản chi tiết về tình trạng tử thi và dấu vết cạy phá cửa.",
    },
    {
      case_slug: slug,
      code: "DOC-02",
      title: "Sơ đồ bố trí đồ đạc phòng khách",
      kind: "pdf",
      phase: 0,
      description: "Sơ đồ không gian và vị trí các cốc trà trên bàn trà.",
    },
    {
      case_slug: slug,
      code: "DOC-03",
      title: "Biên bản lấy lời khai Đỗ Quốc Huy",
      kind: "pdf",
      phase: 1,
      description: "Khai nhận về cuộc gặp cuối cùng lúc 20h30.",
    },
    {
      case_slug: slug,
      code: "DOC-04",
      title: "Biên bản lấy lời khai Phạm Mai Lan",
      kind: "pdf",
      phase: 1,
      description: "Khai nhận về các giao dịch chuyển khoản đáng ngờ.",
    },
    {
      case_slug: slug,
      code: "DOC-05",
      title: "Giám định pháp y độc chất học",
      kind: "pdf",
      phase: 2,
      description: "Tìm thấy dư lượng chất ức chế thần kinh trong mẫu máu.",
    },
    {
      case_slug: slug,
      code: "DOC-06",
      title: "Báo cáo trích xuất nhật ký viễn thông BTS",
      kind: "pdf",
      phase: 3,
      description: "Định vị trạm phát sóng di động của các nghi phạm.",
    },
    // 4 Physical Evidences
    {
      case_slug: slug,
      code: "EV-01",
      title: "Chùm chìa khóa cổng phụ",
      kind: "photo",
      phase: 0,
      description: "Tìm thấy dưới bụi cây gần hàng rào phía sau.",
    },
    {
      case_slug: slug,
      code: "EV-02",
      title: "Hóa đơn tiệm thuốc tây Trung Sơn",
      kind: "photo",
      phase: 1,
      description: "Hóa đơn mua thuốc an thần liều cao lúc 17h.",
    },
    {
      case_slug: slug,
      code: "EV-03",
      title: "Mẩu tàn thuốc lá ngoại",
      kind: "photo",
      phase: 2,
      description: "Dấu vân tay một phần trên đầu lọc thuốc lá.",
    },
    {
      case_slug: slug,
      code: "EV-04",
      title: "Băng ghi âm cuộc cãi vã lúc 21h",
      kind: "audio",
      phase: 3,
      description: "File âm thanh ghi âm tiếng tranh cãi dữ dội.",
    },
  ]);
  if (evErr) throw evErr;

  // 5. Checkpoints (phone_lookup, 3 suspect_interrogation, followup, indictment, epilogue)
  const { error: cpErr } = await supabase.from("case_checkpoints").upsert([
    {
      id: `cp_${slug}_phone_lookup`,
      checkpoint_id: "phone_lookup",
      case_id: slug,
      title: "Mật mã điện thoại Hoàng Văn Nam",
      kind: "phone_lookup",
      type: "phone_lookup",
      order_index: 0,
      question: "Nhập mã số PIN 4 chữ số để mở khóa điện thoại nạn nhân",
      board_config: { position: { desktop: { x: 100, y: 350 } } },
      answer_config: { rawAnswers: "2026, 1234" },
    },
    {
      id: `cp_${slug}_interrogate_huy`,
      checkpoint_id: "interrogate_huy",
      case_id: slug,
      title: "Thẩm vấn Đỗ Quốc Huy",
      kind: "suspect_interrogation",
      type: "suspect_interrogation",
      order_index: 1,
      target_suspect_key: "suspect_huy",
      question: "Chất vấn Đỗ Quốc Huy về hóa đơn thuốc tây",
      board_config: { position: { desktop: { x: 300, y: 200 } } },
      answer_config: { rawAnswers: "EV-02, hóa đơn" },
    },
    {
      id: `cp_${slug}_interrogate_lan`,
      checkpoint_id: "interrogate_lan",
      case_id: slug,
      title: "Thẩm vấn Phạm Mai Lan",
      kind: "suspect_interrogation",
      type: "suspect_interrogation",
      order_index: 2,
      target_suspect_key: "suspect_lan",
      question: "Đối chất Phạm Mai Lan về biến động số dư ngân hàng",
      board_config: { position: { desktop: { x: 300, y: 350 } } },
      answer_config: { rawAnswers: "DOC-04" },
    },
    {
      id: `cp_${slug}_interrogate_minh`,
      checkpoint_id: "interrogate_minh",
      case_id: slug,
      title: "Thẩm vấn Bùi Đức Minh",
      kind: "suspect_interrogation",
      type: "suspect_interrogation",
      order_index: 3,
      target_suspect_key: "suspect_minh",
      question: "Hỏi Bùi Đức Minh về chùm chìa khóa cổng phụ",
      board_config: { position: { desktop: { x: 300, y: 500 } } },
      answer_config: { rawAnswers: "EV-01, chìa khóa" },
    },
    {
      id: `cp_${slug}_followup_scene`,
      checkpoint_id: "followup_scene",
      case_id: slug,
      title: "Đối chất mâu thuẫn hiện trường",
      kind: "followup",
      type: "followup",
      order_index: 4,
      question: "Vật chứng nào mâu thuẫn với lời khai của hung thủ?",
      board_config: { position: { desktop: { x: 450, y: 350 } } },
      answer_config: { rawAnswers: "EV-03, tàn thuốc" },
    },
    {
      id: `cp_${slug}_indictment`,
      checkpoint_id: "indictment",
      case_id: slug,
      title: "Cáo trạng truy tố hung thủ",
      kind: "indictment",
      type: "indictment",
      order_index: 5,
      question: "Ai là hung thủ sát hại Hoàng Văn Nam?",
      board_config: { position: { desktop: { x: 600, y: 350 } } },
      answer_config: {
        validSuspects: ["suspect_huy"],
        rawAnswers: "Đỗ Quốc Huy, huy",
      },
    },
    {
      id: `cp_${slug}_epilogue`,
      checkpoint_id: "epilogue",
      case_id: slug,
      title: "Hậu án và kết luận",
      kind: "epilogue",
      type: "epilogue",
      order_index: 6,
      question: "Kết thúc vụ án và lưu hồ sơ",
      board_config: { position: { desktop: { x: 750, y: 350 } } },
      answer_config: { rawAnswers: "hoàn thành" },
    },
  ]);
  if (cpErr) throw cpErr;

  // 6. Phone Data (Contacts, Messages, Calls)
  await supabase.from("phone_contacts").upsert([
    {
      case_slug: slug,
      contact_id: "c_huy",
      name: "Đỗ Quốc Huy",
      display_name: "Huy Kỹ Thuật",
      phone_number: "0901234567",
      slot_index: 0,
    },
    {
      case_slug: slug,
      contact_id: "c_lan",
      name: "Phạm Mai Lan",
      display_name: "Lan Kế Toán",
      phone_number: "0909876543",
      slot_index: 1,
    },
    {
      case_slug: slug,
      contact_id: "c_minh",
      name: "Bùi Đức Minh",
      display_name: "Minh Quản Lý",
      phone_number: "0912345678",
      slot_index: 2,
    },
  ]);

  await supabase.from("phone_messages").upsert([
    {
      case_slug: slug,
      thread_key: "huy",
      thread_name: "Đỗ Quốc Huy",
      sender: "Đỗ Quốc Huy",
      role: "received",
      body: "Tối nay tao qua biệt thự bàn nốt bản thiết kế nhé.",
      timestamp: "20:15",
      slot_index: 0,
    },
    {
      case_slug: slug,
      thread_key: "huy",
      thread_name: "Đỗ Quốc Huy",
      sender: "Hoàng Văn Nam",
      role: "sent",
      body: "Ừ qua đi, cửa sau không khóa đâu.",
      timestamp: "20:20",
      slot_index: 1,
    },
  ]);

  await supabase.from("phone_calls").upsert([
    {
      case_slug: slug,
      code: "CALL-01",
      contact_name: "Đỗ Quốc Huy",
      phone_number: "0901234567",
      call_type: "incoming",
      timestamp: "20:45",
      duration: "02:14",
      slot_index: 0,
    },
  ]);

  // 7. Board Nodes
  const { error: bnErr } = await supabase.from("case_board_nodes").upsert([
    {
      id: `${slug}:victim:victim_nam`,
      case_slug: slug,
      node_kind: "victim",
      title: "Nạn nhân Hoàng Văn Nam",
      subject_key: "victim_nam",
      slot_index: 0,
      config: { position: { desktop: { x: 100, y: 150 } } },
    },
    {
      id: `${slug}:victim_phone:victim_nam`,
      case_slug: slug,
      node_kind: "victim_phone",
      title: "Điện thoại Hoàng Văn Nam",
      subject_key: "victim_nam",
      slot_index: 1,
      config: { position: { desktop: { x: 100, y: 350 } } },
    },
    {
      id: `${slug}:reinvestigate:scene`,
      case_slug: slug,
      node_kind: "reinvestigate",
      title: "Khám nghiệm hiện trường",
      slot_index: 2,
      config: { position: { desktop: { x: 300, y: 150 } } },
    },
    {
      id: `${slug}:suspects_hub:hub`,
      case_slug: slug,
      node_kind: "suspects_hub",
      title: "Danh sách nghi phạm",
      slot_index: 3,
      config: { position: { desktop: { x: 450, y: 150 } } },
    },
    {
      id: `${slug}:evidence_hub:hub`,
      case_slug: slug,
      node_kind: "evidence_hub",
      title: "Hồ sơ vật chứng",
      slot_index: 4,
      config: { position: { desktop: { x: 600, y: 150 } } },
    },
  ]);
  if (bnErr) throw bnErr;

  // 8. Reinvestigation Hotspots
  await supabase.from("reinvestigation_hotspots").upsert([
    {
      case_id: slug,
      hotspot_id: "hs_1",
      num: 1,
      title: "Cốc trà trên bàn trà",
      description: "Có cặn bột trắng nghi là thuốc ngủ",
      x: 35.5,
      y: 60.2,
      detail_image_url: "/images/evidence_default.jpg",
    },
    {
      case_id: slug,
      hotspot_id: "hs_2",
      num: 2,
      title: "Vết máu gần chân ghế",
      description: "Mẫu máu nhỏ giọt hướng ra cửa sau",
      x: 72.0,
      y: 45.0,
      detail_image_url: "/images/evidence_default.jpg",
    },
  ]);
}

/**
 * Dọn dẹp case_tron_tim_v2 hoặc đặt về DRAFT sau khi nghiệm thu
 */
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
