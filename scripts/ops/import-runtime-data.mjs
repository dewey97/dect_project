#!/usr/bin/env node
/**
 * scripts/import-runtime-data.mjs
 *
 * Script một lần để đọc dữ liệu file hiện có trong data/ và sinh file SQL upsert
 * vào .tmp/import_runtime_data.sql (để chủ dự án kiểm tra và chạy thủ công lên Supabase).
 *
 * Usage: node scripts/import-runtime-data.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT_DIR, "data");
const TMP_DIR = path.join(ROOT_DIR, ".tmp");
const OUTPUT_FILE = path.join(TMP_DIR, "import_runtime_data.sql");

function escapeSqlString(str) {
  return str.replace(/'/g, "''");
}

function main() {
  console.log("=== BẮT ĐẦU SINH SQL IMPORT RUNTIME DATA ===");
  if (!fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR, { recursive: true });
  }

  const sqlStatements = [];
  sqlStatements.push("-- ==============================================================================");
  sqlStatements.push("-- DỮ LIỆU KHỞI TẠO RUNTIME DATA TỪ data/ (TỰ ĐỘNG SINH)");
  sqlStatements.push(`-- Sinh lúc: ${new Date().toISOString()}`);
  sqlStatements.push("-- Hướng dẫn: Xem xét kỹ trước khi chạy trên Supabase SQL Editor");
  sqlStatements.push("-- ==============================================================================\n");
  sqlStatements.push("BEGIN;\n");

  let mapCount = 0;
  let hotspotCount = 0;
  let waitlistCount = 0;

  // 1. Map vector (world_vector_map.json)
  const worldMapPath = path.join(DATA_DIR, "maps", "world_vector_map.json");
  const legacyMapPath = path.join(DATA_DIR, "maps", "case_000_vector.json");

  let mapDataRaw = null;
  if (fs.existsSync(worldMapPath)) {
    mapDataRaw = fs.readFileSync(worldMapPath, "utf-8");
    console.log(`[MAP] Đọc từ: ${worldMapPath}`);
  } else if (fs.existsSync(legacyMapPath)) {
    mapDataRaw = fs.readFileSync(legacyMapPath, "utf-8");
    console.log(`[MAP] Đọc từ fallback: ${legacyMapPath}`);
  }

  if (mapDataRaw) {
    try {
      const parsed = JSON.parse(mapDataRaw);
      const jsonStr = JSON.stringify(parsed);
      const escaped = escapeSqlString(jsonStr);
      sqlStatements.push("-- 1. Map vector dữ liệu thế giới dùng chung");
      sqlStatements.push(`INSERT INTO public.map_vectors (id, data, updated_at)`);
      sqlStatements.push(`VALUES ('world', '${escaped}'::jsonb, now())`);
      sqlStatements.push(`ON CONFLICT (id) DO UPDATE SET`);
      sqlStatements.push(`  data = EXCLUDED.data,`);
      sqlStatements.push(`  updated_at = EXCLUDED.updated_at;\n`);
      mapCount++;
    } catch (err) {
      console.error("[MAP] Lỗi parse JSON map:", err);
    }
  } else {
    console.log("[MAP] Không tìm thấy file map vector nào.");
  }

  // 2. Reinvestigation Hotspots (data/*_hotspots.json)
  if (fs.existsSync(DATA_DIR)) {
    const files = fs.readdirSync(DATA_DIR);
    for (const file of files) {
      if (file.endsWith("_hotspots.json")) {
        const match = file.match(/^(.+)_hotspots\.json$/);
        if (match) {
          const caseSlug = match[1].toLowerCase().replace(/-/g, "_");
          const filePath = path.join(DATA_DIR, file);
          try {
            const content = fs.readFileSync(filePath, "utf-8");
            const parsed = JSON.parse(content);
            const jsonStr = JSON.stringify(parsed);
            const escaped = escapeSqlString(jsonStr);
            sqlStatements.push(`-- 2. Hotspots cho vụ án: ${caseSlug}`);
            sqlStatements.push(`INSERT INTO public.reinvestigation_hotspots (case_slug, hotspots, updated_at)`);
            sqlStatements.push(`VALUES ('${caseSlug}', '${escaped}'::jsonb, now())`);
            sqlStatements.push(`ON CONFLICT (case_slug) DO UPDATE SET`);
            sqlStatements.push(`  hotspots = EXCLUDED.hotspots,`);
            sqlStatements.push(`  updated_at = EXCLUDED.updated_at;\n`);
            hotspotCount++;
          } catch (err) {
            console.error(`[HOTSPOT] Lỗi parse file ${file}:`, err);
          }
        }
      }
    }
  }

  // 3. Waitlist pending (data/waitlist_pending.json)
  const waitlistPath = path.join(DATA_DIR, "waitlist_pending.json");
  if (fs.existsSync(waitlistPath)) {
    try {
      const content = fs.readFileSync(waitlistPath, "utf-8");
      const entries = JSON.parse(content);
      if (Array.isArray(entries) && entries.length > 0) {
        sqlStatements.push(`-- 3. Danh sách waitlist pending (${entries.length} entries)`);
        for (const entry of entries) {
          if (!entry.email) continue;
          const email = escapeSqlString(String(entry.email).trim().toLowerCase());
          const source = escapeSqlString(String(entry.source || "landing_hero").trim());
          const ip = entry.ip ? `'${escapeSqlString(String(entry.ip))}'` : "NULL";
          const createdAt = entry.timestamp ? `'${escapeSqlString(String(entry.timestamp))}'::timestamptz` : "now()";

          sqlStatements.push(`INSERT INTO public.waitlist_entries (email, source, ip, created_at)`);
          sqlStatements.push(`VALUES ('${email}', '${source}', ${ip}, ${createdAt})`);
          sqlStatements.push(`ON CONFLICT (email, source) DO NOTHING;`);
          waitlistCount++;
        }
        sqlStatements.push("");
      }
    } catch (err) {
      console.error("[WAITLIST] Lỗi parse file waitlist_pending.json:", err);
    }
  }

  sqlStatements.push("COMMIT;\n");

  fs.writeFileSync(OUTPUT_FILE, sqlStatements.join("\n"), "utf-8");
  console.log(`\n✅ Đã sinh file SQL thành công tại: ${OUTPUT_FILE}`);
  console.log(`- Map vectors: ${mapCount}`);
  console.log(`- Hotspots files: ${hotspotCount}`);
  console.log(`- Waitlist entries: ${waitlistCount}`);
  console.log("\n⚠️  LƯU Ý: Không tự động chạy file này. Hãy gửi file cho chủ dự án kiểm tra trước khi chạy trên DB.");
}

main();
