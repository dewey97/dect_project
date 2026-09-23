import { google } from "googleapis";
import { NextResponse } from "next/server";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";

/**
 * Dựng cấu hình xác thực Google Sheets.
 *
 * Ưu tiên biến môi trường `GOOGLE_SERVICE_ACCOUNT_JSON` (chuỗi JSON của service account)
 * để môi trường serverless không phải đọc file. Chỉ khi biến này trống mới đọc file cứng
 * trong repo. Hai lời gọi `path.resolve` được đánh dấu `turbopackIgnore` để bundler không
 * trace nhầm toàn bộ thư mục gốc dự án vào bundle.
 */
function createGoogleAuth(): InstanceType<typeof google.auth.GoogleAuth> {
  const inlineCredentials = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  if (inlineCredentials) {
    return new google.auth.GoogleAuth({
      credentials: JSON.parse(inlineCredentials),
      scopes: [SHEETS_SCOPE],
    });
  }

  const relativeKeyPath =
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH ||
    "google-service-account.json";

  return new google.auth.GoogleAuth({
    keyFile: path.resolve(
      /* turbopackIgnore: true */ process.cwd(),
      relativeKeyPath,
    ),
    scopes: [SHEETS_SCOPE],
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab") || "contacts";
    const caseIdFilter = searchParams.get("caseId") || "case_000";

    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    const auth = createGoogleAuth();

    const sheets = google.sheets({ version: "v4", auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${tab}'!A1:Z500`,
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
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

    // Filter by case_id if present in table
    const filteredData = rawData.filter((item) => {
      if (item.case_id) {
        return item.case_id === caseIdFilter;
      }
      return true;
    });

    const res = NextResponse.json({
      success: true,
      caseId: caseIdFilter,
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
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch data from Google Sheets",
      },
      { status: 500 },
    );
  }
}
