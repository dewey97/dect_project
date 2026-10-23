/**
 * Script bóc tách dữ liệu điện thoại từ Google Sheets / API phone và sinh file SQL migration.
 *
 * Chỉ ĐỌC dữ liệu và sinh file SQL vào `data/_review/phone-migration.sql`.
 * TUYỆT ĐỐI KHÔNG TỰ CHẠY SQL LÊN PRODUCTION.
 *
 * Chạy:
 *   node scripts/ops/migrate-phone-sheets.mjs
 *   node scripts/ops/migrate-phone-sheets.mjs --case=case_000
 *   node scripts/ops/migrate-phone-sheets.mjs --api=http://localhost:3000
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { google } from "googleapis";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");

function loadEnv() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const envPath = path.resolve(ROOT, file);
    if (!fs.existsSync(envPath)) continue;
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
  }
}

loadEnv();

const SPREADSHEET_ID =
  process.env.GOOGLE_SHEETS_ID || "1h2P9VaBC9PELUMhipo6ze1SkJIVv3IOm5SP3ynURm4Q";
const SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";

function createGoogleAuth() {
  const keyPath = path.resolve(
    ROOT,
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH || "google-service-account.json",
  );
  if (fs.existsSync(keyPath)) {
    return new google.auth.GoogleAuth({ keyFile: keyPath, scopes: [SCOPE] });
  }

  const inline = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  if (inline) {
    try {
      return new google.auth.GoogleAuth({
        credentials: JSON.parse(inline),
        scopes: [SCOPE],
      });
    } catch (e) {
      console.warn("[WARN] Lỗi parse GOOGLE_SERVICE_ACCOUNT_JSON:", e.message);
    }
  }

  console.warn("[WARN] Không tìm thấy google-service-account.json hoặc GOOGLE_SERVICE_ACCOUNT_JSON hợp lệ.");
  return null;
}

function parseCsvRows(text) {
  const rows = [];
  let row = [];
  let inQuotes = false;
  let field = "";

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (c === '"' && next === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ",") {
        row.push(field);
        field = "";
      } else if (c === "\n" || (c === "\r" && next === "\n")) {
        row.push(field);
        field = "";
        rows.push(row);
        row = [];
        if (c === "\r") i++;
      } else if (c === "\r") {
        row.push(field);
        field = "";
        rows.push(row);
        row = [];
      } else {
        field += c;
      }
    }
  }

  if (field || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

async function fetchTabDirect(sheetName) {
  const auth = createGoogleAuth();
  if (auth) {
    try {
      const sheets = google.sheets({ version: "v4", auth });
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `'${sheetName}'!A1:Z500`,
      });
      return response.data.values || [];
    } catch (err) {
      console.warn(`[WARN] Google Sheets API lỗi với tab "${sheetName}": ${err.message}`);
      // Fall through to public CSV export
    }
  }

  try {
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&headers=1&sheet=${encodeURIComponent(sheetName)}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const text = await res.text();
    const parsed = parseCsvRows(text);
    if (sheetName !== "des" && sheetName !== "design" && parsed.length > 0) {
      const firstRowStr = parsed[0].join(" ").toLowerCase();
      if (firstRowStr.includes("link canva") || (firstRowStr.includes("poster") && firstRowStr.includes("tên")) || firstRowStr.includes("thiết kế") || firstRowStr.includes("bản đồ")) {
        return [];
      }
    }
    return parsed;
  } catch {
    return [];
  }
}

async function fetchTabData(tab, caseSlug, apiBase) {
  if (apiBase) {
    try {
      const url = `${apiBase}/api/phone?tab=${tab}&caseId=${caseSlug}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn(`[WARN] Không gọi được ${apiBase}/api/phone: ${err.message}. Thử fetch Google Sheets trực tiếp...`);
    }
  }

  const candidateNames = [`${caseSlug}_${tab}`, tab];
  for (const name of candidateNames) {
    const rawRows = await fetchTabDirect(name);
    if (rawRows.length > 1) {
      const headers = rawRows[0].map((h) =>
        String(h || "")
          .replace(/^﻿/, "")
          .replace(/^[🔑⚡📝🔴🟢⚪\s]+/, "")
          .trim(),
      );
      return rawRows
        .slice(1)
        .filter((r) => r && r.some((c) => String(c || "").trim()))
        .map((row) => {
          const obj = {};
          headers.forEach((header, index) => {
            if (header) obj[header] = row[index] !== undefined ? row[index] : "";
          });
          return obj;
        });
    }
  }

  return [];
}

function sqlString(value) {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlJson(value) {
  if (value === null || value === undefined) return "NULL";
  return `${sqlString(JSON.stringify(value))}::jsonb`;
}

function sqlBool(value, defaultVal = false) {
  if (value === null || value === undefined || value === "") return defaultVal ? "true" : "false";
  const s = String(value).toLowerCase().trim();
  if (s === "true" || s === "1" || s === "yes" || s === "co" || s === "có") return "true";
  if (s === "false" || s === "0" || s === "no" || s === "khong" || s === "không") return "false";
  return defaultVal ? "true" : "false";
}

function sqlInt(value, defaultVal = 0) {
  const n = parseInt(value, 10);
  return isNaN(n) ? defaultVal : n;
}

async function main() {
  const caseArg = process.argv.find((a) => a.startsWith("--case="));
  const apiArg = process.argv.find((a) => a.startsWith("--api="));

  const caseSlug = (caseArg?.split("=")[1] || "case_000").trim().toLowerCase().replace(/-/g, "_");
  const apiBase = apiArg ? apiArg.split("=")[1].replace(/\/+$/, "") : null;

  console.log(`Bắt đầu trích xuất dữ liệu điện thoại cho vụ án: ${caseSlug}`);
  if (apiBase) console.log(`API Base: ${apiBase}`);

  const [rawContacts, rawCalls, rawMessages, rawPhotos, rawApps] = await Promise.all([
    fetchTabData("contacts", caseSlug, apiBase),
    fetchTabData("calls", caseSlug, apiBase),
    fetchTabData("messages", caseSlug, apiBase),
    fetchTabData("photos", caseSlug, apiBase),
    fetchTabData("apps", caseSlug, apiBase),
  ]);

  console.log(`Tìm thấy:
  - Contacts: ${rawContacts.length} dòng
  - Calls:    ${rawCalls.length} dòng
  - Messages: ${rawMessages.length} dòng
  - Photos:   ${rawPhotos.length} dòng
  - Apps:     ${rawApps.length} dòng`);

  const sqlStatements = [];

  sqlStatements.push(`-- ==============================================================================`);
  sqlStatements.push(`-- MIGRATION XUẤT BẢN TỪ GOOGLE SHEETS SANG SUPABASE PHONE DATA`);
  sqlStatements.push(`-- Case: ${caseSlug}`);
  sqlStatements.push(`-- Sinh ngày: ${new Date().toISOString()}`);
  sqlStatements.push(`-- LƯU Ý: Rà soát kỹ dữ liệu trước khi nạp vào production.`);
  sqlStatements.push(`-- ==============================================================================\n`);
  sqlStatements.push(`BEGIN;\n`);

  // 1. Contacts
  if (rawContacts.length > 0) {
    sqlStatements.push(`-- 1. phone_contacts (${rawContacts.length} records)`);
    sqlStatements.push(`DELETE FROM public.phone_contacts WHERE case_slug = ${sqlString(caseSlug)};`);
    sqlStatements.push(
      `INSERT INTO public.phone_contacts (case_slug, contact_id, name, display_name, phone_number, category, note, is_saved, avatar_url, is_suspicious, slot_index) VALUES`,
    );
    const rows = rawContacts.map((c, idx) => {
      const name = c.name || c.contact_name || c.title || `Liên hệ #${idx + 1}`;
      const contactId = c.contact_id || c.id || `CT-${String(idx + 1).padStart(2, "0")}`;
      const displayName = c.display_name || name;
      const phone = c.phone_number || c.phone || c.sdt || null;
      const category = c.category || c.group || null;
      const note = c.note || c.ghi_chu || null;
      const isSaved = sqlBool(c.is_saved, true);
      const avatarUrl = c.avatar_url || c.avatar || null;
      const isSuspicious = sqlBool(c.is_suspicious, false);
      return `  (${sqlString(caseSlug)}, ${sqlString(contactId)}, ${sqlString(name)}, ${sqlString(displayName)}, ${sqlString(phone)}, ${sqlString(category)}, ${sqlString(note)}, ${isSaved}, ${sqlString(avatarUrl)}, ${isSuspicious}, ${idx})`;
    });
    sqlStatements.push(rows.join(",\n") + ";\n");
  }

  // 2. Calls
  if (rawCalls.length > 0) {
    sqlStatements.push(`-- 2. phone_calls (${rawCalls.length} records)`);
    sqlStatements.push(`DELETE FROM public.phone_calls WHERE case_slug = ${sqlString(caseSlug)};`);
    sqlStatements.push(
      `INSERT INTO public.phone_calls (case_slug, code, contact_name, phone_number, call_type, timestamp, duration, audio_url, is_key_clue, clue_title, clue_analysis, slot_index) VALUES`,
    );
    const rows = rawCalls.map((c, idx) => {
      const contactName = c.contact_name || c.name || "Không rõ";
      const code = c.code || null;
      const phone = c.phone_number || c.phone || null;
      const callType = c.call_type || c.type || "incoming";
      const timestamp = c.timestamp || c.time || null;
      const duration = c.duration || null;
      const audioUrl = c.audio_url || c.audio || null;
      const isKeyClue = sqlBool(c.is_key_clue, false);
      const clueTitle = c.clue_title || null;
      const clueAnalysis = c.clue_analysis || null;
      return `  (${sqlString(caseSlug)}, ${sqlString(code)}, ${sqlString(contactName)}, ${sqlString(phone)}, ${sqlString(callType)}, ${sqlString(timestamp)}, ${sqlString(duration)}, ${sqlString(audioUrl)}, ${isKeyClue}, ${sqlString(clueTitle)}, ${sqlString(clueAnalysis)}, ${idx})`;
    });
    sqlStatements.push(rows.join(",\n") + ";\n");
  }

  // 3. Messages
  if (rawMessages.length > 0) {
    sqlStatements.push(`-- 3. phone_messages (${rawMessages.length} records)`);
    sqlStatements.push(`DELETE FROM public.phone_messages WHERE case_slug = ${sqlString(caseSlug)};`);
    sqlStatements.push(
      `INSERT INTO public.phone_messages (case_slug, thread_key, thread_name, thread_phone, sender, role, body, timestamp, code, is_clue, clue_title, clue_analysis, attachment_type, attachment_url, attachment_duration, slot_index) VALUES`,
    );
    const rows = rawMessages.map((m, idx) => {
      const threadKey =
        m.thread_key ||
        m.thread ||
        (m.sender ? `thread_${String(m.sender).toLowerCase().replace(/[^a-z0-9]/g, "_")}` : "thread_default");
      const threadName = m.thread_name || m.sender || "Hội thoại";
      const threadPhone = m.thread_phone || m.phone || null;
      const sender = m.sender || "Người gửi";
      const role = m.role || "received";
      const body = m.body || m.message || m.content || "";
      const timestamp = m.timestamp || m.time || null;
      const code = m.code || null;
      const isClue = sqlBool(m.is_clue, false);
      const clueTitle = m.clue_title || null;
      const clueAnalysis = m.clue_analysis || null;
      const attachType = m.attachment_type || null;
      const attachUrl = m.attachment_url || null;
      const attachDuration = m.attachment_duration || null;
      return `  (${sqlString(caseSlug)}, ${sqlString(threadKey)}, ${sqlString(threadName)}, ${sqlString(threadPhone)}, ${sqlString(sender)}, ${sqlString(role)}, ${sqlString(body)}, ${sqlString(timestamp)}, ${sqlString(code)}, ${isClue}, ${sqlString(clueTitle)}, ${sqlString(clueAnalysis)}, ${sqlString(attachType)}, ${sqlString(attachUrl)}, ${sqlString(attachDuration)}, ${idx})`;
    });
    sqlStatements.push(rows.join(",\n") + ";\n");
  }

  // 4. Photos
  if (rawPhotos.length > 0) {
    sqlStatements.push(`-- 4. phone_photos (${rawPhotos.length} records)`);
    sqlStatements.push(`DELETE FROM public.phone_photos WHERE case_slug = ${sqlString(caseSlug)};`);
    sqlStatements.push(
      `INSERT INTO public.phone_photos (case_slug, photo_code, label, image_url, taken_at, description, exif_json, is_evidence, slot_index) VALUES`,
    );
    const rows = rawPhotos.map((p, idx) => {
      const photoCode = p.code || p.photo_code || p.photo_id || null;
      const label = p.label || p.title || p.name || `Ảnh #${idx + 1}`;
      const imageUrl = p.image_url || p.drive_url || p.url || "";
      const takenAt = p.taken_at || p.time || p.date || null;
      const description = p.description || p.note || null;
      let exifJson = null;
      if (p.exif_json) {
        try {
          exifJson = typeof p.exif_json === "object" ? p.exif_json : JSON.parse(p.exif_json);
        } catch {
          exifJson = null;
        }
      }
      const isEvidence = sqlBool(p.is_evidence, false);
      return `  (${sqlString(caseSlug)}, ${sqlString(photoCode)}, ${sqlString(label)}, ${sqlString(imageUrl)}, ${sqlString(takenAt)}, ${sqlString(description)}, ${sqlJson(exifJson)}, ${isEvidence}, ${idx})`;
    });
    sqlStatements.push(rows.join(",\n") + ";\n");
  }

  // 5. Apps (nếu có trên sheet)
  if (rawApps.length > 0) {
    sqlStatements.push(`-- 5. case_phone_apps (${rawApps.length} records)`);
    sqlStatements.push(
      `INSERT INTO public.case_phone_apps (case_slug, app_type, display_name, icon_url, slot_index, is_dock) VALUES`,
    );
    const rows = rawApps.map((a, idx) => {
      const appType = a.app_type || a.id || a.app || `app_${idx}`;
      const displayName = a.display_name || a.name || a.title || appType;
      const iconUrl = a.icon_url || a.icon || null;
      const slotIndex = sqlInt(a.slot_index, idx);
      const isDock = sqlBool(a.is_dock, false);
      return `  (${sqlString(caseSlug)}, ${sqlString(appType)}, ${sqlString(displayName)}, ${sqlString(iconUrl)}, ${slotIndex}, ${isDock})`;
    });
    sqlStatements.push(
      rows.join(",\n") +
        `\nON CONFLICT (case_slug, app_type) DO UPDATE SET\n` +
        `  display_name = EXCLUDED.display_name,\n` +
        `  icon_url = EXCLUDED.icon_url,\n` +
        `  slot_index = EXCLUDED.slot_index,\n` +
        `  is_dock = EXCLUDED.is_dock,\n` +
        `  updated_at = NOW();\n`,
    );
  }

  sqlStatements.push(`COMMIT;\n`);

  const outDir = path.resolve(ROOT, "data/_review");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "phone-migration.sql");
  fs.writeFileSync(outPath, sqlStatements.join("\n"), "utf-8");

  console.log(`\nHoàn tất! Đã xuất file SQL xem trước tại:`);
  console.log(`-> ${outPath}`);
}

main().catch((err) => {
  console.error("Lỗi thực thi migration script:", err);
  process.exit(1);
});
