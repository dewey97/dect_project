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
 */
function createGoogleAuth(): InstanceType<typeof google.auth.GoogleAuth> {
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

  // Fallback to Application Default Credentials (ADC)
  return new google.auth.GoogleAuth({
    scopes: [SHEETS_SCOPE],
  });
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

  try {
    const spreadsheetId =
      process.env.GOOGLE_SHEETS_ID || DEFAULT_SPREADSHEET_ID;
    const auth = createGoogleAuth();

    const sheets = google.sheets({ version: "v4", auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${tab}'!A1:Z500`,
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      serverCache[cacheKey] = { data: [], timestamp: now };
      return NextResponse.json({ success: true, tab, data: [] });
    }

    const headers = rows[0].map((h: string) =>
      typeof h === "string" ? h.replace(/^[🔑⚡📝🔴🟢⚪\s]+/, "").trim() : h,
    );
    const rawData = rows.slice(1).map((row) => {
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
  } catch (error: any) {
    console.error("Error fetching Google Sheets API:", error);
    // Trả về dữ liệu rỗng an toàn thay vì HTTP 500 để không làm sập giao diện client
    return NextResponse.json({
      success: false,
      caseId: rawCaseId,
      tab,
      totalCount: 0,
      data: [],
      error: error.message || "Failed to fetch data from Google Sheets",
    });
  }
}
