#!/usr/bin/env node
/**
 * scripts/ops/backfill-character-avatars.mjs
 *
 * Backfill avatar một lần cho nhân vật vụ án:
 * Đọc `case_evidence` có `code` dạng `avatar_<x>` (không phân biệt hoa thường)
 * -> khớp `case_characters` cùng `case_slug` theo `key = <x>`, nếu không có thì theo `aliases` chứa `<x>`
 * -> sinh `UPDATE case_characters SET avatar_url = <file_url> WHERE case_slug = … AND key = … AND avatar_url IS NULL;`
 * Ghi `.tmp/backfill_avatars.sql` + in danh sách không khớp.
 *
 * Chú ý: Script CHỈ sinh file SQL, TUYỆT ĐỐI KHÔNG tự chạy lên database.
 *
 * Chạy:
 *   node scripts/ops/backfill-character-avatars.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const TMP_DIR = path.resolve(ROOT, ".tmp");
const OUTPUT_FILE = path.resolve(TMP_DIR, "backfill_avatars.sql");

function escapeSql(str) {
  if (str === null || str === undefined) return "NULL";
  return String(str).replace(/'/g, "''");
}

function loadEnv() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const envPath = path.resolve(ROOT, file);
    if (!fs.existsSync(envPath)) continue;
    try {
      const content = fs.readFileSync(envPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const idx = trimmed.indexOf("=");
        if (idx === -1) continue;
        const key = trimmed.slice(0, idx).trim();
        let value = trimmed.slice(idx + 1).trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = value;
      }
    } catch {
      // Bỏ qua nếu không đọc được
    }
  }
}

async function loadData() {
  loadEnv();

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://zalyxhmwwmfyexoilejp.supabase.co";
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_4DpTkT6yHYAPQjtkYFfObg_u1bGZrn6";

  const client = createClient(supabaseUrl, supabaseKey);

  console.log(`Đang nạp dữ liệu từ Supabase: ${supabaseUrl}`);
  const { data: evidences, error: evError } = await client
    .from("case_evidence")
    .select("case_slug, code, file_url, title")
    .ilike("code", "avatar_%");

  if (evError) {
    console.warn(`Lỗi khi đọc case_evidence từ Supabase: ${evError.message}`);
  }

  const { data: characters, error: charError } = await client
    .from("case_characters")
    .select("case_slug, key, aliases, name");

  if (charError) {
    console.warn(`Lỗi khi đọc case_characters từ Supabase: ${charError.message}`);
  }

  if (evidences && evidences.length > 0 && characters && characters.length > 0) {
    return { evidences, characters };
  }

  // Fallback đọc từ dump nếu có
  const dumpPath = path.resolve(ROOT, "data/_review/sheet-data-dump.json");
  if (fs.existsSync(dumpPath)) {
    console.log("Dùng fallback dữ liệu từ data/_review/sheet-data-dump.json");
    const dump = JSON.parse(fs.readFileSync(dumpPath, "utf-8"));
    const dumpEvidences = (dump.evidences || [])
      .filter((e) => String(e.code || "").toLowerCase().startsWith("avatar_"))
      .map((e) => ({
        case_slug: e.case_id || "case_000",
        code: e.code,
        file_url: e.drive_url || null,
        title: e.label || "",
      }));

    return { evidences: dumpEvidences, characters: characters || [] };
  }

  return { evidences: evidences || [], characters: characters || [] };
}

async function main() {
  console.log("=== BẮT ĐẦU BACKFILL AVATAR NHÂN VẬT TỪ CASE_EVIDENCE ===");

  const { evidences, characters } = await loadData();
  console.log(
    `Tìm thấy ${evidences.length} avatar evidence và ${characters.length} nhân vật.`,
  );

  if (!fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR, { recursive: true });
  }

  const sqlStatements = [];
  sqlStatements.push(
    "-- ==============================================================================",
  );
  sqlStatements.push("-- BACKFILL CHARACTER AVATARS TỪ CASE_EVIDENCE");
  sqlStatements.push(`-- Sinh lúc: ${new Date().toISOString()}`);
  sqlStatements.push(
    "-- Hướng dẫn: Xem xét kỹ trước khi chạy thủ công trên Supabase SQL Editor",
  );
  sqlStatements.push(
    "-- ==============================================================================\n",
  );
  sqlStatements.push("BEGIN;\n");

  const matched = [];
  const unmatched = [];
  const noUrl = [];

  for (const ev of evidences) {
    const rawCode = String(ev.code || "").trim();
    if (!rawCode.toLowerCase().startsWith("avatar_")) continue;

    const x = rawCode.slice(7).trim().toLowerCase();
    const caseSlug = ev.case_slug || "case_000";

    // 1. Khớp theo key = <x> cùng case_slug
    let char = characters.find(
      (c) =>
        c.case_slug === caseSlug &&
        String(c.key || "").trim().toLowerCase() === x,
    );

    // 2. Nếu không có, khớp theo aliases chứa <x>
    if (!char) {
      char = characters.find((c) => {
        if (c.case_slug !== caseSlug) return false;
        const aliases = Array.isArray(c.aliases) ? c.aliases : [];
        return aliases.some((a) => {
          const normA = String(a).trim().toLowerCase();
          return normA === x || normA.includes(x);
        });
      });
    }

    if (!char) {
      unmatched.push({
        code: rawCode,
        case_slug: caseSlug,
        title: ev.title || "",
      });
      continue;
    }

    if (!ev.file_url) {
      noUrl.push({
        code: rawCode,
        characterKey: char.key,
        characterName: char.name,
        case_slug: caseSlug,
      });
      continue;
    }

    matched.push({
      code: rawCode,
      characterKey: char.key,
      characterName: char.name,
      file_url: ev.file_url,
      case_slug: caseSlug,
    });

    sqlStatements.push(
      `-- Khớp ${rawCode} -> nhân vật [${char.key}] (${char.name})`,
    );
    sqlStatements.push(
      `UPDATE public.case_characters SET avatar_url = '${escapeSql(ev.file_url)}', updated_at = NOW() WHERE case_slug = '${escapeSql(caseSlug)}' AND key = '${escapeSql(char.key)}' AND avatar_url IS NULL;`,
    );
    sqlStatements.push("");
  }

  sqlStatements.push("COMMIT;\n");

  fs.writeFileSync(OUTPUT_FILE, sqlStatements.join("\n"), "utf-8");

  console.log("\n--- KẾT QUẢ KHỚP DỮ LIỆU ---");
  console.log(`- Đã khớp và sinh lệnh UPDATE: ${matched.length} nhân vật`);
  for (const m of matched) {
    console.log(
      `  ✓ [${m.case_slug}] ${m.code} -> key "${m.characterKey}" (${m.characterName})`,
    );
  }

  if (noUrl.length > 0) {
    console.log(`- Khớp nhân vật nhưng file_url rỗng/null: ${noUrl.length}`);
    for (const n of noUrl) {
      console.log(
        `  ⚠ [${n.case_slug}] ${n.code} -> key "${n.characterKey}" (${n.characterName}) - file_url is NULL`,
      );
    }
  }

  if (unmatched.length > 0) {
    console.log(`- KHÔNG KHỚP: ${unmatched.length} evidence`);
    for (const u of unmatched) {
      console.log(`  ✗ [${u.case_slug}] ${u.code} (${u.title})`);
    }
  } else {
    console.log("- Không có record nào không khớp (100% avatar_ được định danh).");
  }

  console.log(`\nĐã ghi file SQL: ${path.relative(ROOT, OUTPUT_FILE)}`);
  console.log(
    "Lưu ý: Không tự chạy file SQL này. Chủ dự án sẽ kiểm tra và thực thi sau khi chạy migration 38.",
  );
}

main().catch((err) => {
  console.error("Lỗi khi chạy backfill-character-avatars:", err);
  process.exit(1);
});
