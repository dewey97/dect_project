/**
 * Dọn cột `answers` của tab `checkpoints`: bỏ các biến thể không dấu trùng lặp
 * và các mã bypass (`00`, `000`, `0`, `admin`) vì code đã tự chuẩn hoá và
 * hard-code sẵn phần bypass.
 *
 * Script CHỈ ghi lại cột H (answers), giữ nguyên toàn bộ cột khác và các dòng
 * không thuộc phạm vi dọn dẹp. An toàn để chạy lại nhiều lần.
 *
 * Chạy: node scripts/clean-checkpoint-answers.js
 */
const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");

const root = path.resolve(__dirname, "..");
const envPath = path.resolve(root, ".env.local");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf-8")
    .split("\n")
    .forEach((line) => {
      const t = line.trim();
      if (!t || t.startsWith("#")) return;
      const i = t.indexOf("=");
      if (i > -1) process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
    });
}

const spreadsheetId =
  process.env.GOOGLE_SHEETS_ID ||
  "1h2P9VaBC9PELUMhipo6ze1SkJIVv3IOm5SP3ynURm4Q";
const keyFilePath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH
  ? path.resolve(root, process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH)
  : path.resolve(root, "google-service-account.json");

const BYPASS_CODES = new Set(["00", "000", "0", "admin"]);

/** Chuẩn hoá để phát hiện trùng lặp: bỏ dấu, thường hoá, bỏ ký tự không phải chữ/số. */
function normalizeVariant(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]/g, "");
}

/** Bỏ mục trùng lặp (giữ dạng xuất hiện đầu tiên) và mã bypass. Trả về mảng đã trim. */
function dedupeVariants(list) {
  const seen = new Set();
  const kept = [];
  list.forEach((raw) => {
    const item = raw.trim();
    if (!item || BYPASS_CODES.has(item.toLowerCase())) return;
    const key = normalizeVariant(item);
    if (!key || seen.has(key)) return;
    seen.add(key);
    kept.push(item);
  });
  return kept;
}

/** Dọn danh sách đáp án ở cuối dòng `input: id | nhãn | placeholder | đáp án...` */
function cleanInputLine(value) {
  const parts = value.split("|");
  if (parts.length < 4) return value;
  const kept = dedupeVariants(parts[3].split(","));
  return [...parts.slice(0, 3), " " + kept.join(", ")].join("|");
}

/** Dọn cột `answers` của một dòng: bỏ dòng `show:`, chuẩn hoá `suspect:` và `input:`. */
function cleanAnswersCell(cell) {
  if (!cell) return cell;
  return cell
    .split("\n")
    .filter((line) => {
      const separator = line.indexOf(":");
      if (separator === -1) return true;
      const key = line.slice(0, separator).trim().toLowerCase();
      // Bỏ hoàn toàn dòng `show:` / `available:` vì Web Mode và Boardgame Mode đã dùng chung Bảng ghim + Nhập mã
      if (
        ["show", "available", "available_evidences", "hien_thi"].includes(key)
      ) {
        return false;
      }
      return true;
    })
    .map((line) => {
      const separator = line.indexOf(":");
      if (separator === -1) return line;
      const key = line.slice(0, separator).trim().toLowerCase();
      const value = line.slice(separator + 1).trim();

      if (key === "suspect") {
        return `suspect: ${dedupeVariants(value.split(",")).join(", ")}`;
      }
      if (key === "input") {
        return `input: ${cleanInputLine(value)}`;
      }
      return line;
    })
    .join("\n");
}

(async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: keyFilePath,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  const headers = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'checkpoints'!A1:Z1",
  });
  const header = headers.data.values[0];
  const answersIndex = header.indexOf("answers");
  if (answersIndex === -1) {
    console.error("ERR: không tìm thấy cột 'answers' trong header.");
    return;
  }
  const column = String.fromCharCode(65 + answersIndex);

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'checkpoints'!${column}2:${column}60`,
  });
  const cells = res.data.values || [];

  const updated = cells.map((row, i) => {
    const before = row[0] || "";
    const after = cleanAnswersCell(before);
    if (before !== after) {
      const cpId = i + 2;
      console.log(`~ dòng ${cpId}: đã dọn`);
      before.split("\n").forEach((line, li) => {
        const afterLine = after.split("\n")[li];
        if (line !== afterLine) {
          console.log(`    - ${line ? line.trim() : ""}`);
          if (afterLine) console.log(`    + ${afterLine.trim()}`);
        }
      });
    }
    return [after];
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'checkpoints'!${column}2:${column}${updated.length + 1}`,
    valueInputOption: "RAW",
    requestBody: { values: updated },
  });

  console.log(`✅ Đã ghi lại cột ${column} (answers), ${updated.length} dòng.`);
})().catch((e) => console.error("ERR:", e.message));
