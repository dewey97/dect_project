/**
 * Import tab `checkpoints` (Google Sheets Live CMS) vào bảng Supabase
 * `case_checkpoints` dùng bởi Checkpoint Studio.
 *
 * Script chỉ ĐỌC dữ liệu Sheet và sinh file SQL upsert; không đổi runtime
 * gameplay. Chạy:
 *
 *   node --experimental-strip-types scripts/import-checkpoints-to-supabase.mjs
 *   node --experimental-strip-types scripts/import-checkpoints-to-supabase.mjs --case=case_001
 *
 * Kết quả: `.tmp/checkpoints-import.sql` — áp dụng bằng Supabase MCP
 * `execute_sql` hoặc `psql`.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { google } from "googleapis";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function loadEnv() {
  const envPath = path.resolve(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) return;
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

const SPREADSHEET_ID =
  process.env.GOOGLE_SHEETS_ID || "1h2P9VaBC9PELUMhipo6ze1SkJIVv3IOm5SP3ynURm4Q";
const SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";

function createGoogleAuth() {
  const inline = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  if (inline) {
    return new google.auth.GoogleAuth({
      credentials: JSON.parse(inline),
      scopes: [SCOPE],
    });
  }
  const keyPath = path.resolve(
    ROOT,
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH || "google-service-account.json",
  );
  if (fs.existsSync(keyPath)) {
    return new google.auth.GoogleAuth({ keyFile: keyPath, scopes: [SCOPE] });
  }
  throw new Error(
    "Thiếu Google credentials: GOOGLE_SERVICE_ACCOUNT_JSON hoặc GOOGLE_SERVICE_ACCOUNT_KEY_PATH.",
  );
}

function cleanHeader(value) {
  return String(value || "")
    .replace(/^﻿/, "")
    .replace(/^[^\wÀ-ỹ]+/, "")
    .trim();
}

function normalizeCaseId(raw) {
  const value = String(raw || "case_000")
    .trim()
    .toLowerCase()
    .replace(/-/g, "_");
  return value || "case_000";
}

function splitAiCases(raw) {
  if (!raw || typeof raw !== "string") return [];
  const byLine = raw
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
  if (byLine.length > 1) return byLine;
  return (byLine[0] || raw)
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

const HINT_HEADERS = {
  motive: ["[động cơ]", "động cơ:", "động cơ", "[dong co]", "dong co:"],
  alibi: [
    "[ngoại phạm]",
    "ngoại phạm:",
    "ngoại phạm",
    "[ngoai pham]",
    "ngoai pham:",
    "ngoại phạm mâu thuẫn",
    "[ngoại phạm mâu thuẫn]",
  ],
  contradiction: [
    "[mâu thuẫn]",
    "mâu thuẫn:",
    "[mâu thuẫn lời khai]",
    "mâu thuẫn lời khai:",
    "[contradiction]",
    "contradiction:",
    "mâu thuẫn",
    "mâu thuẫn lời khai",
    "lời nói dối",
    "[lời nói dối]",
  ],
};

/** Bóc hints đa cấp, giữ nguyên thứ tự dòng và nhóm hiện hành. */
function parseHints(raw) {
  if (!raw || typeof raw !== "string") return [];
  const trimmed = raw.trim();
  if (trimmed.startsWith("[") && trimmed.endsWith("]") && !trimmed.includes("\n")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => String(item).trim())
          .filter(Boolean)
          .map((text) => ({ group: "general", text }));
      }
    } catch {
      // Fall through to line parsing.
    }
  }

  const result = [];
  let group = "general";
  for (const line of trimmed.split(/\r?\n/)) {
    const text = line.trim();
    if (!text) continue;
    const lower = text.toLowerCase();
    const nextGroup =
      Object.entries(HINT_HEADERS).find(([, headers]) =>
        headers.includes(lower),
      )?.[0] || null;
    if (nextGroup) {
      group = nextGroup;
      continue;
    }
    result.push({ group, text });
  }
  return result;
}

function sqlString(value) {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlJson(value) {
  return `${sqlString(JSON.stringify(value))}::jsonb`;
}

async function fetchRows(caseId) {
  const auth = createGoogleAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const candidates = [`${caseId}_checkpoints`, "checkpoints"];

  for (const tab of candidates) {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `'${tab}'!A1:Z500`,
      });
      const values = response.data.values || [];
      if (values.length === 0) continue;
      console.log(`Nguồn: tab "${tab}" (${values.length - 1} dòng dữ liệu)`);
      return values;
    } catch (error) {
      console.warn(`Không đọc được tab "${tab}": ${error.message}`);
    }
  }
  throw new Error(`Không tìm thấy tab checkpoint cho ${caseId}.`);
}

async function main() {
  loadEnv();

  const caseArg = process.argv.find((arg) => arg.startsWith("--case="));
  const caseId = normalizeCaseId(caseArg?.split("=")[1] || "case_000");

  const { parseAnswersColumn, transformSheetCheckpoint } = await import(
    "../lib/cms/checkpoint-cms.ts"
  );

  const values = await fetchRows(caseId);
  const headers = values[0].map(cleanHeader);
  const sheetRows = values
    .slice(1)
    .filter((row) => row && row.some((cell) => String(cell ?? "").trim()))
    .map((row) => {
      const obj = {};
      headers.forEach((header, index) => {
        if (header) obj[header] = row[index] ?? "";
      });
      return obj;
    });

  const rows = sheetRows.map((row) => {
    const checkpoint = transformSheetCheckpoint(row);
    const rawAnswers =
      (typeof row.answers_id === "string" && row.answers_id.trim()) ||
      (typeof row.answer_id === "string" && row.answer_id.trim()) ||
      (typeof row.answers === "string" && row.answers.trim()) ||
      "";
    const answers = parseAnswersColumn(rawAnswers);

    const answerConfig = {
      validSuspects: answers.validSuspects || [],
      validMotives: answers.validMotives || [],
      requiredEvidenceIds: answers.requiredEvidenceIds || [],
      optionalEvidenceIds: answers.optionalEvidenceIds || [],
      motiveEvidenceIds: answers.motiveEvidenceIds || [],
      optionalMotiveIds: answers.optionalMotiveIds || [],
      alibiEvidenceIds: answers.alibiEvidenceIds || [],
      optionalAlibiIds: answers.optionalAlibiIds || [],
      contradictionEvidenceIds: answers.contradictionEvidenceIds || [],
      optionalContradictionIds: answers.optionalContradictionIds || [],
      // Giữ dữ liệu của các loại checkpoint chưa có editor trong V1.
      options: answers.options || [],
      correctAnswer: answers.correctAnswer ?? null,
      textMatchInputs: answers.textMatchInputs || [],
      photoCodes: answers.photoCodes || [],
      availableEvidences: answers.availableEvidences || [],
      rawAnswers,
    };

    return {
      case_id: normalizeCaseId(row.case_id || caseId),
      checkpoint_id: checkpoint.id,
      node_id: checkpoint.nodeId || null,
      dossier: row.dossier || null,
      title: row.title || checkpoint.title || "",
      question: row.question || checkpoint.question || "",
      type: row.type || checkpoint.type || "evidence_picker",
      question_type: checkpoint.questionType || null,
      unlocked_evidence_id: row.unlocked_evidence_id || null,
      followup_of: checkpoint.followupOf || null,
      suspect_label: row.suspect_label || null,
      evidence_step_label: row.evidence_step_label || null,
      answer_config: answerConfig,
      hints: parseHints(row.hints),
      narrative: checkpoint.storyConfig?.monologue || null,
      ai_context: checkpoint.aiContext || null,
      ai_valid_cases: checkpoint.aiValidCases || [],
      ai_invalid_cases: checkpoint.aiInvalidCases || [],
    };
  });

  const columns = [
    "case_id",
    "checkpoint_id",
    "node_id",
    "dossier",
    "title",
    "question",
    "type",
    "question_type",
    "unlocked_evidence_id",
    "followup_of",
    "suspect_label",
    "evidence_step_label",
    "answer_config",
    "hints",
    "narrative",
    "ai_context",
    "ai_valid_cases",
    "ai_invalid_cases",
  ];
  const updateColumns = columns.filter(
    (column) => column !== "case_id" && column !== "checkpoint_id",
  );

  const valuesSql = rows
    .map((row) => {
      const cells = columns.map((column) => {
        const value = row[column];
        if (column === "answer_config" || column === "hints") {
          return sqlJson(value);
        }
        if (
          column === "ai_valid_cases" ||
          column === "ai_invalid_cases"
        ) {
          return sqlJson(value);
        }
        return sqlString(value);
      });
      return `  (${cells.join(", ")})`;
    })
    .join(",\n");

  const sql = `-- Generated by scripts/import-checkpoints-to-supabase.mjs
-- Source: Google Sheets tab checkpoints (${rows.length} rows), case ${caseId}
BEGIN;

INSERT INTO public.case_checkpoints (${columns.join(", ")})
VALUES
${valuesSql}
ON CONFLICT (case_id, checkpoint_id) DO UPDATE SET
${updateColumns
  .map((column) => `  ${column} = EXCLUDED.${column}`)
  .join(",\n")},
  updated_at = NOW();

COMMIT;
`;

  const outDir = path.resolve(ROOT, ".tmp");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "checkpoints-import.sql");
  fs.writeFileSync(outPath, sql, "utf-8");

  const byType = rows.reduce((acc, row) => {
    acc[row.type] = (acc[row.type] || 0) + 1;
    return acc;
  }, {});
  console.log(`Đã sinh ${rows.length} dòng cho ${caseId}.`);
  console.log(`Loại: ${JSON.stringify(byType)}`);
  console.log(`SQL: ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
