import { google } from "googleapis";
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";
const DEFAULT_SPREADSHEET_ID = "1h2P9VaBC9PELUMhipo6ze1SkJIVv3IOm5SP3ynURm4Q";

// Server-side in-memory cache (15s TTL) to prevent rate-limiting Google Sheets API
interface CacheEntry {
  data: any[];
  timestamp: number;
}
const serverCache: Record<string, CacheEntry> = {};
const CACHE_TTL_MS = 15_000; // 15 seconds

/**
 * Dựng cấu hình xác thực Google Sheets an toàn từ Env hoặc Key File.
 * Nếu không có credentials, trả về null để chuyển sang chế độ Public Export mà không gây lỗi.
 */
function createGoogleAuth(): InstanceType<typeof google.auth.GoogleAuth> | null {
  const inlineCredentials = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  if (inlineCredentials) {
    try {
      return new google.auth.GoogleAuth({
        credentials: JSON.parse(inlineCredentials),
        scopes: [SHEETS_SCOPE],
      });
    } catch (e) {
      console.error("Invalid GOOGLE_SERVICE_ACCOUNT_JSON format:", e);
    }
  }

  const relativeKeyPath =
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH ||
    "google-service-account.json";

  const absoluteKeyPath = path.resolve(process.cwd(), relativeKeyPath);
  if (fs.existsSync(absoluteKeyPath)) {
    return new google.auth.GoogleAuth({
      keyFile: absoluteKeyPath,
      scopes: [SHEETS_SCOPE],
    });
  }

  // Không cố gọi ADC khi môi trường container/server không có cấu hình để tránh văng lỗi
  return null;
}

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
async function fetchPublicSheetRows(spreadsheetId: string, tab: string): Promise<string[][]> {
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Google Sheets public export failed with HTTP ${res.status}`);
  }
  const text = await res.text();
  return parseCsvRows(text);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tab = searchParams.get("tab") || "contacts";
  const rawCaseId = searchParams.get("caseId") || "case_000";
  const caseIdFilter = rawCaseId.trim().toLowerCase().replace(/-/g, "_");
  const forceRefresh =
    searchParams.get("refresh") === "true" ||
    searchParams.get("_refresh") === "1";

  const cacheKey = `${tab}:${caseIdFilter}`;
  const cached = serverCache[cacheKey];
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

  const spreadsheetId =
    process.env.GOOGLE_SHEETS_ID || DEFAULT_SPREADSHEET_ID;

  let rawRows: any[][] = [];

  try {
    const auth = createGoogleAuth();
    if (auth) {
      const sheets = google.sheets({ version: "v4", auth });
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `'${tab}'!A1:Z500`,
      });
      rawRows = response.data.values || [];
    } else {
      // Chế độ Public Fetch mượt mà khi không có Service Account
      rawRows = await fetchPublicSheetRows(spreadsheetId, tab);
    }
  } catch (primaryError: any) {
    console.warn("Primary Google Sheets fetch failed, falling back to public export:", primaryError?.message);
    try {
      rawRows = await fetchPublicSheetRows(spreadsheetId, tab);
    } catch (fallbackError: any) {
      console.error("Both primary and public fetch failed:", fallbackError);
      return NextResponse.json({
        success: false,
        caseId: rawCaseId,
        tab,
        totalCount: 0,
        data: [],
        error: fallbackError.message || primaryError?.message || "Failed to fetch data from Google Sheets",
      });
    }
  }

  if (rawRows.length === 0) {
    serverCache[cacheKey] = { data: [], timestamp: now };
    return NextResponse.json({ success: true, tab, data: [] });
  }

  const headers = rawRows[0].map((h: string) =>
    typeof h === "string" ? h.replace(/^[🔑⚡📝🔴🟢⚪\s]+/, "").trim() : h,
  );
  const rawData = rawRows.slice(1).map((row) => {
    const obj: Record<string, any> = {};
    headers.forEach((header, index) => {
      if (header) {
        obj[header] = row[index] !== undefined ? row[index] : "";
      }
    });
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
    return true;
  });

  // Save in server cache
  serverCache[cacheKey] = {
    data: filteredData,
    timestamp: now,
  };

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
