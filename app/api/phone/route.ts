import { google } from "googleapis";
import { createGoogleAuth } from "@/lib/google/auth";
import { NextResponse } from "next/server";
import { denyIfNotAdmin } from "@/lib/security/admin-route-guard";
import { normalizeCaseId } from "@/lib/cases/case-id";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";
const DEFAULT_SPREADSHEET_ID = "1h2P9VaBC9PELUMhipo6ze1SkJIVv3IOm5SP3ynURm4Q";

// Server-side in-memory cache (15s TTL) to prevent rate-limiting Google Sheets API
interface CacheEntry {
  data: Record<string, unknown>[];
  timestamp: number;
}
const serverCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 15_000; // 15 seconds
const MAX_CACHE_ENTRIES = 100;

function setCacheEntry(
  key: string,
  data: Record<string, unknown>[],
  timestamp: number,
) {
  serverCache.delete(key);
  while (serverCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = serverCache.keys().next().value;
    if (oldestKey === undefined) break;
    serverCache.delete(oldestKey);
  }
  serverCache.set(key, { data, timestamp });
}

/** Tab công khai cho runtime; tab nội bộ (checkpoints, cấu hình...) không được đọc qua route này. */
const ALLOWED_TABS = new Set([
  "evidences",
  "photos",
  "contacts",
  "calls",
  "messages",
  "apps",
]);

/**
 * Trình bóc tách CSV chuẩn RFC 4180 cho dữ liệu xuất bản công khai từ Google Sheets
 */
function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
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

/**
 * Tải trực tiếp dữ liệu dạng CSV từ Google Sheets công khai khi không có Service Account.
 */
async function fetchPublicSheetRows(
  spreadsheetId: string,
  tab: string,
): Promise<string[][]> {
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&headers=1&sheet=${encodeURIComponent(tab)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(
      `Google Sheets public export failed with HTTP ${res.status}`,
    );
  }
  const text = await res.text();
  const parsed = parseCsvRows(text);
  // Quirk detection: Nếu tab không phải 'design' mà gviz trả về header của tab design,
  // nghĩa là tab yêu cầu không tồn tại và Google Sheets tự redirect về tab đầu tiên.
  if (tab !== "design" && parsed.length > 0) {
    const firstRowStr = parsed[0].join(" ").toLowerCase();
    if (
      firstRowStr.includes("link canva") ||
      (firstRowStr.includes("poster") && firstRowStr.includes("tên"))
    ) {
      throw new Error(
        `Tab '${tab}' does not exist on spreadsheet (redirected to default tab)`,
      );
    }
  }
  return parsed;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tab = (searchParams.get("tab") || "contacts").trim().toLowerCase();
  const rawCaseId = searchParams.get("caseId") || "case_000";
  const caseIdFilter = normalizeCaseId(rawCaseId);
  if (!ALLOWED_TABS.has(tab)) {
    return NextResponse.json(
      { success: false, error: `Tab '${tab}' không được phép truy vấn.` },
      { status: 400 },
    );
  }
  // Bỏ qua cache (gọi thẳng Google Sheets) chỉ dành cho admin, tránh bị spam cạn quota.
  const wantsRefresh =
    searchParams.get("refresh") === "true" ||
    searchParams.get("_refresh") === "1";
  const forceRefresh = wantsRefresh && !(await denyIfNotAdmin());

  const cacheKey = `${tab}:${caseIdFilter}`;
  const cached = serverCache.get(cacheKey);
  const now = Date.now();

  // Return server cache if fresh and not forced refresh
  if (!forceRefresh && cached && now - cached.timestamp < CACHE_TTL_MS) {
    const res = NextResponse.json({
      success: true,
      caseId: rawCaseId,
      tab,
      totalCount: cached.data.length,
      data: cached.data,
      cached: true,
    });
    res.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    return res;
  }

  const spreadsheetId = process.env.GOOGLE_SHEETS_ID || DEFAULT_SPREADSHEET_ID;

  const auth = createGoogleAuth(SHEETS_SCOPE);

  const fetchTab = async (sheetName: string): Promise<unknown[][]> => {
    try {
      if (auth) {
        const sheets = google.sheets({ version: "v4", auth });
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: `'${sheetName}'!A1:Z500`,
        });
        return (response.data.values as unknown[][]) || [];
      } else {
        return (await fetchPublicSheetRows(
          spreadsheetId,
          sheetName,
        )) as unknown[][];
      }
    } catch {
      try {
        return (await fetchPublicSheetRows(
          spreadsheetId,
          sheetName,
        )) as unknown[][];
      } catch {
        return [];
      }
    }
  };

  let rawRows: unknown[][] = [];
  if (tab === "photos" || tab === "evidences") {
    if (caseIdFilter !== "case_000") {
      rawRows = await fetchTab(`${caseIdFilter}_evidences`);
      if (rawRows.length === 0) {
        rawRows = await fetchTab(`${caseIdFilter}_photos`);
      }
    }
    if (rawRows.length === 0) {
      rawRows = await fetchTab("evidences");
    }
    if (rawRows.length === 0) {
      rawRows = await fetchTab("photos");
    }
    if (rawRows.length === 0) {
      rawRows = await fetchTab("photos_old");
    }
    if (rawRows.length === 0) {
      rawRows = await fetchTab("evidences_old");
    }
  } else {
    if (caseIdFilter !== "case_000") {
      rawRows = await fetchTab(`${caseIdFilter}_${tab}`);
    }
    if (rawRows.length === 0) {
      rawRows = await fetchTab(tab);
    }
  }

  if (rawRows.length === 0) {
    setCacheEntry(cacheKey, [], now);
    return NextResponse.json({ success: true, tab, data: [] });
  }

  const headers = (rawRows[0] as string[]).map((h: string) =>
    typeof h === "string"
      ? h
          .replace(/^\uFEFF/, "")
          .replace(/^[🔑⚡📝🔴🟢⚪\s]+/, "")
          .trim()
      : h,
  );
  const rawData = rawRows
    .slice(1)
    .filter(
      (row) =>
        row &&
        row.some((cell) =>
          typeof cell === "string" ? cell.trim() : Boolean(cell),
        ),
    )
    .map((row) => {
      const obj: Record<string, unknown> = {};
      headers.forEach((header, index) => {
        if (header) {
          obj[header] = row[index] !== undefined ? row[index] : "";
        }
      });

      // Two-way aliasing: Đảm bảo tương thích 100% giữa code / photo_code và label / title
      const canonicalCode = String(
        obj.code || obj.photo_code || obj.photo_id || "",
      ).trim();
      const canonicalLabel = String(
        obj.label || obj.title || obj.name || "",
      ).trim();
      const canonicalUrl = String(
        obj.drive_url || obj.direct_cdn_url || obj.url || "",
      ).trim();
      const canonicalDesc = String(
        obj.description || obj.description_prompt || "",
      ).trim();

      if (canonicalCode) {
        obj.code = canonicalCode;
        obj.photo_code = canonicalCode;
      }
      if (canonicalLabel) {
        obj.label = canonicalLabel;
        obj.title = canonicalLabel;
      }
      if (canonicalUrl) {
        obj.drive_url = canonicalUrl;
      }
      if (canonicalDesc) {
        obj.description = canonicalDesc;
        obj.description_prompt = canonicalDesc;
      }

      return obj;
    });

  // Case-insensitive & dash/underscore-agnostic filter by case_id
  const filteredData = rawData.filter((item) => {
    if (item.case_id) {
      const itemCaseId = String(item.case_id)
        .trim()
        .toLowerCase()
        .replace(/-/g, "_");
      return itemCaseId === caseIdFilter;
    }
    // Hàng thiếu case_id chỉ được gán mặc định cho case_000 (legacy compatibility - C6)
    return caseIdFilter === "case_000";
  });

  // Save in server cache
  setCacheEntry(cacheKey, filteredData, now);

  const res = NextResponse.json({
    success: true,
    caseId: rawCaseId,
    tab,
    totalCount: filteredData.length,
    data: filteredData,
  });
  res.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  return res;
}
